"use client";

import { useState, useEffect } from "react";

interface Platform {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface MarketData extends Platform {
  demand: number;
  supply: number;
  shortage: number;
  ppd: number;
  surgeMult: number;
}

interface WeeklyData {
  day: string;
  [key: string]: string | number;
}

const PLATFORMS: Platform[] = [
  { id: "swft", name: "Swft", color: "#FF4D1C", icon: "⚡" },
  { id: "grubgo", name: "GrubGo", color: "#00C896", icon: "🛵" },
  { id: "dropd", name: "Dropd", color: "#6C5CE7", icon: "📦" },
  { id: "rushly", name: "Rushly", color: "#F7B731", icon: "🏃" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function generateMarketData(): MarketData[] {
  return PLATFORMS.map((p) => {
    const demand = Math.floor(Math.random() * 60) + 20;
    const supply = Math.floor(Math.random() * demand * 1.4) + 5;
    const shortage = Math.max(0, demand - supply);
    const basePPD = 28 + Math.random() * 10;
    const surgeMult = shortage > 0 ? 1 + (shortage / demand) * 0.8 : 1;
    const ppd = Math.round(basePPD * surgeMult * 10) / 10;
    return { ...p, demand, supply, shortage, ppd, surgeMult };
  });
}

function generateWeeklyData(): WeeklyData[] {
  return DAYS.map((day) => ({
    day,
    ...Object.fromEntries(
      PLATFORMS.map((p) => {
        const isWeekend = day === "Sat" || day === "Sun";
        const base = isWeekend ? 38 + Math.random() * 12 : 24 + Math.random() * 8;
        return [p.id, Math.round(base * 10) / 10];
      })
    ),
  }));
}

export default function GigShift() {
  const [view, setView] = useState<"worker" | "platform">("worker");
  const [market, setMarket] = useState<MarketData[]>(generateMarketData());
  const [weekly, setWeekly] = useState<WeeklyData[]>(generateWeeklyData());
  const [selectedPlatform, setSelectedPlatform] = useState("swft");
  const [demandTarget, setDemandTarget] = useState(40);
  const [currentPPD, setCurrentPPD] = useState(30);
  const [pulseIndex, setPulseIndex] = useState(-1);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const topPlatform = [...market].sort((a, b) => b.ppd - a.ppd)[0];

  useEffect(() => {
    const interval = setInterval(() => {
      const newMarket = generateMarketData();
      setMarket(newMarket);
      setWeekly(generateWeeklyData());
      setLastRefresh(new Date());
      setPulseIndex(Math.floor(Math.random() * PLATFORMS.length));
      setTimeout(() => setPulseIndex(-1), 800);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const selPlatData = market.find((p) => p.id === selectedPlatform);
  const projectedSupply = Math.min(
    demandTarget,
    Math.floor((currentPPD / 28) * 15)
  );
  const supplyGap = demandTarget - projectedSupply;

  const optimalPPD = Math.round(28 * (1 + (demandTarget / 20) * 0.4) * 10) / 10;

  return (
    <div className="min-h-screen bg-[#0A0A0F] font-mono text-[#E8E8F0]">
      {/* Header */}
      <div className="border-b border-[#1E1E2E] px-6 py-4 flex items-center justify-between bg-[#0D0D18]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#FF4D1C] to-[#6C5CE7] rounded-lg flex items-center justify-center text-base">
            ⚡
          </div>
          <span className="text-lg font-bold tracking-wider">GIGSHIFT</span>
          <span className="text-[10px] text-[#666] tracking-[0.15em] bg-[#1a1a2e] px-2 py-0.5 rounded">
            BETA
          </span>
        </div>

        <div className="flex gap-2">
          {(["worker", "platform"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-md text-[11px] tracking-wider uppercase cursor-pointer transition-colors ${
                view === v
                  ? "border border-[#6C5CE7] bg-[#6C5CE720] text-[#9D8FFF]"
                  : "border border-[#1E1E2E] bg-transparent text-[#666] hover:border-[#3E3E4E]"
              }`}
            >
              {v === "worker" ? "🛵 Worker" : "📊 Platform"}
            </button>
          ))}
        </div>

        <div className="text-[10px] text-[#444]">
          LIVE · {lastRefresh.toLocaleTimeString()}
        </div>
      </div>

      {view === "worker" ? (
        <WorkerView
          market={market}
          weekly={weekly}
          topPlatform={topPlatform}
          pulseIndex={pulseIndex}
        />
      ) : (
        <PlatformView
          market={market}
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={setSelectedPlatform}
          selPlatData={selPlatData}
          demandTarget={demandTarget}
          setDemandTarget={setDemandTarget}
          currentPPD={currentPPD}
          setCurrentPPD={setCurrentPPD}
          projectedSupply={projectedSupply}
          supplyGap={supplyGap}
          optimalPPD={optimalPPD}
        />
      )}
    </div>
  );
}

function WorkerView({
  market,
  weekly,
  topPlatform,
  pulseIndex,
}: {
  market: MarketData[];
  weekly: WeeklyData[];
  topPlatform: MarketData;
  pulseIndex: number;
}) {
  const sorted = [...market].sort((a, b) => b.ppd - a.ppd);

  return (
    <div className="p-6 max-w-[900px] mx-auto">
      {/* Hero alert */}
      <div
        className="rounded-xl p-5 mb-6 flex items-center justify-between"
        style={{
          background: `linear-gradient(135deg, ${topPlatform.color}18, ${topPlatform.color}08)`,
          border: `1px solid ${topPlatform.color}40`,
        }}
      >
        <div>
          <div className="text-[11px] text-[#888] tracking-[0.15em] mb-1">
            BEST EARNING RIGHT NOW
          </div>
          <div
            className="text-[28px] font-extrabold"
            style={{ color: topPlatform.color }}
          >
            {topPlatform.icon} {topPlatform.name} — ₹{topPlatform.ppd}/del
          </div>
          {topPlatform.surgeMult > 1 && (
            <div className="text-xs text-[#aaa] mt-1">
              🔥 Surge {topPlatform.surgeMult.toFixed(2)}× · High demand, low
              supply
            </div>
          )}
        </div>
        <div
          className="px-5 py-2.5 rounded-lg font-bold text-[13px] cursor-pointer hover:opacity-90 transition-opacity"
          style={{ background: topPlatform.color, color: "#000" }}
        >
          GO NOW →
        </div>
      </div>

      {/* Live platform cards */}
      <div className="mb-6">
        <div className="text-[11px] text-[#666] tracking-[0.15em] mb-3">
          LIVE RATES · AUTO-REFRESH 5s
        </div>
        <div className="grid grid-cols-2 gap-3">
          {sorted.map((p, i) => (
            <div
              key={p.id}
              className="rounded-xl p-4 relative transition-colors duration-300"
              style={{
                background:
                  pulseIndex === market.indexOf(p) ? `${p.color}15` : "#0D0D18",
                border: `1px solid ${i === 0 ? p.color + "60" : "#1E1E2E"}`,
              }}
            >
              {i === 0 && (
                <div
                  className="absolute top-2.5 right-2.5 text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wider"
                  style={{ background: p.color, color: "#000" }}
                >
                  TOP
                </div>
              )}
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-xl">{p.icon}</span>
                <span className="font-semibold text-[15px]">{p.name}</span>
              </div>
              <div
                className="text-[26px] font-extrabold mb-2"
                style={{ color: p.color }}
              >
                ₹{p.ppd}
                <span className="text-[13px] text-[#666] font-normal">/del</span>
              </div>
              <div className="flex gap-4 text-[11px] text-[#666]">
                <span>📍 {p.supply} online</span>
                <span>📦 {p.demand} orders</span>
              </div>
              {p.shortage > 0 && (
                <div className="mt-2 text-[11px] text-[#FF4D1C]">
                  ⚠ {p.shortage} rider shortage
                </div>
              )}
              {/* Mini supply bar */}
              <div className="mt-2.5 h-[3px] bg-[#1E1E2E] rounded-sm">
                <div
                  className="h-full rounded-sm transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (p.supply / p.demand) * 100)}%`,
                    background: p.supply >= p.demand ? "#00C896" : "#FF4D1C",
                  }}
                />
              </div>
              <div className="text-[9px] text-[#444] mt-1">
                Supply coverage: {Math.round((p.supply / p.demand) * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly trend */}
      <div className="bg-[#0D0D18] border border-[#1E1E2E] rounded-xl p-5">
        <div className="text-[11px] text-[#666] tracking-[0.15em] mb-4">
          7-DAY PPD FORECAST
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left text-[#444] font-normal pb-2">Day</th>
                {PLATFORMS.map((p) => (
                  <th
                    key={p.id}
                    className="text-right font-semibold pb-2 pr-3"
                    style={{ color: p.color }}
                  >
                    {p.icon} {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weekly.map((row) => {
                const maxVal = Math.max(
                  ...PLATFORMS.map((p) => row[p.id] as number)
                );
                return (
                  <tr key={row.day} className="border-t border-[#1a1a2a]">
                    <td
                      className={`py-2 ${
                        row.day === "Sat" || row.day === "Sun"
                          ? "text-[#F7B731]"
                          : "text-[#aaa]"
                      }`}
                    >
                      {row.day === "Sat" || row.day === "Sun" ? "⭐ " : ""}
                      {row.day}
                    </td>
                    {PLATFORMS.map((p) => (
                      <td
                        key={p.id}
                        className="text-right pr-3"
                        style={{
                          color: row[p.id] === maxVal ? p.color : "#666",
                          fontWeight: row[p.id] === maxVal ? 700 : 400,
                        }}
                      >
                        ₹{row[p.id]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="text-[11px] text-[#444] mt-3">
          ⭐ Weekends typically 40-60% higher PPD due to demand surges
        </div>
      </div>
    </div>
  );
}

function PlatformView({
  market,
  selectedPlatform,
  setSelectedPlatform,
  selPlatData,
  demandTarget,
  setDemandTarget,
  currentPPD,
  setCurrentPPD,
  projectedSupply,
  supplyGap,
  optimalPPD,
}: {
  market: MarketData[];
  selectedPlatform: string;
  setSelectedPlatform: (id: string) => void;
  selPlatData: MarketData | undefined;
  demandTarget: number;
  setDemandTarget: (val: number) => void;
  currentPPD: number;
  setCurrentPPD: (val: number) => void;
  projectedSupply: number;
  supplyGap: number;
  optimalPPD: number;
}) {
  const competitor = [...market]
    .filter((p) => p.id !== selectedPlatform)
    .sort((a, b) => b.ppd - a.ppd)[0];

  return (
    <div className="p-6 max-w-[900px] mx-auto">
      {/* Platform selector */}
      <div className="flex gap-2.5 mb-6">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPlatform(p.id)}
            className="px-4 py-2 rounded-lg text-[13px] font-mono cursor-pointer transition-colors"
            style={{
              border:
                selectedPlatform === p.id
                  ? `1px solid ${p.color}`
                  : "1px solid #1E1E2E",
              background:
                selectedPlatform === p.id ? `${p.color}20` : "transparent",
              color: selectedPlatform === p.id ? p.color : "#666",
            }}
          >
            {p.icon} {p.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Demand control */}
        <div className="bg-[#0D0D18] border border-[#1E1E2E] rounded-xl p-5">
          <div className="text-[11px] text-[#666] tracking-[0.15em] mb-1">
            {"TODAY'S DEMAND"}
          </div>
          <div className="text-[32px] font-extrabold mb-4">
            {demandTarget}{" "}
            <span className="text-sm text-[#666] font-normal">orders/hr</span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            value={demandTarget}
            onChange={(e) => setDemandTarget(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: selPlatData?.color }}
          />
          <div className="flex justify-between text-[10px] text-[#444] mt-1">
            <span>Low (10)</span>
            <span>High (100)</span>
          </div>
        </div>

        {/* PPD control */}
        <div className="bg-[#0D0D18] border border-[#1E1E2E] rounded-xl p-5">
          <div className="text-[11px] text-[#666] tracking-[0.15em] mb-1">
            YOUR OFFERED PPD
          </div>
          <div
            className="text-[32px] font-extrabold mb-4"
            style={{ color: selPlatData?.color }}
          >
            ₹{currentPPD}{" "}
            <span className="text-sm text-[#666] font-normal">/delivery</span>
          </div>
          <input
            type="range"
            min={20}
            max={80}
            value={currentPPD}
            onChange={(e) => setCurrentPPD(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: selPlatData?.color }}
          />
          <div className="flex justify-between text-[10px] text-[#444] mt-1">
            <span>₹20</span>
            <span>₹80</span>
          </div>
        </div>
      </div>

      {/* Outcome panel */}
      <div
        className="rounded-xl p-5 mb-4 grid grid-cols-4 gap-4"
        style={{
          background: supplyGap > 0 ? "#FF4D1C08" : "#00C89608",
          border: `1px solid ${supplyGap > 0 ? "#FF4D1C40" : "#00C89640"}`,
        }}
      >
        <Metric
          label="PROJECTED SUPPLY"
          value={`${projectedSupply} riders`}
          color={supplyGap > 0 ? "#FF4D1C" : "#00C896"}
        />
        <Metric
          label="SUPPLY GAP"
          value={supplyGap > 0 ? `−${supplyGap} riders` : "✓ Covered"}
          color={supplyGap > 0 ? "#FF4D1C" : "#00C896"}
        />
        <Metric
          label="HOURLY COST"
          value={`₹${currentPPD * projectedSupply}`}
          color="#F7B731"
        />
        <Metric
          label="OPTIMAL PPD"
          value={`₹${optimalPPD}`}
          color={selPlatData?.color}
          sub="to fill demand"
        />
      </div>

      {/* Recommendation */}
      {supplyGap > 0 && (
        <div className="bg-[#FF4D1C10] border border-[#FF4D1C30] rounded-xl px-5 py-3.5 mb-4 text-[13px]">
          <span className="text-[#FF4D1C] font-bold">⚠ SHORTAGE DETECTED</span>
          <span className="text-[#aaa]">
            {" "}
            · Raise PPD to ₹{optimalPPD} to attract {supplyGap} more riders.
            Competitor {competitor?.name} is currently at ₹{competitor?.ppd}/del
            — you need to beat that.
          </span>
        </div>
      )}

      {/* Competitor intelligence */}
      <div className="bg-[#0D0D18] border border-[#1E1E2E] rounded-xl p-5">
        <div className="text-[11px] text-[#666] tracking-[0.15em] mb-3.5">
          COMPETITOR INTELLIGENCE
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {market
            .filter((p) => p.id !== selectedPlatform)
            .map((p) => (
              <div
                key={p.id}
                className="bg-[#13131F] rounded-lg px-3.5 py-3 border border-[#1a1a2a]"
              >
                <div
                  className="text-[13px] font-semibold mb-1.5"
                  style={{ color: p.color }}
                >
                  {p.icon} {p.name}
                </div>
                <div className="text-xl font-extrabold">₹{p.ppd}</div>
                <div className="text-[11px] text-[#555] mt-1">
                  {p.supply}/{p.demand} supply met
                </div>
                {currentPPD > p.ppd ? (
                  <div className="text-[11px] text-[#00C896] mt-1">
                    {"✓ You're beating them"}
                  </div>
                ) : (
                  <div className="text-[11px] text-[#FF4D1C] mt-1">
                    {"↑ They're attracting your riders"}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  color,
  sub,
}: {
  label: string;
  value: string;
  color?: string;
  sub?: string;
}) {
  return (
    <div>
      <div className="text-[10px] text-[#555] tracking-[0.12em] mb-1">
        {label}
      </div>
      <div
        className="text-[22px] font-extrabold"
        style={{ color: color || "#E8E8F0" }}
      >
        {value}
      </div>
      {sub && <div className="text-[10px] text-[#444] mt-0.5">{sub}</div>}
    </div>
  );
}
