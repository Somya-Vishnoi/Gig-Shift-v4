"use client";

import type { MarketSnapshot } from "@/lib/data/types";
import { PLATFORMS } from "@/lib/data/types";

interface Props {
  snapshot: MarketSnapshot;
  rank: number;
  pulseId: string | null;
  dark: boolean;
}

export default function PlatformCard({ snapshot, rank, pulseId, dark }: Props) {
  const platform = PLATFORMS.find(p => p.id === snapshot.platformId)!;
  const isPulsing = pulseId === snapshot.platformId;
  const isTop = rank === 0;
  const coveragePct = Math.round(snapshot.fulfillmentRate * 100);
  const coverageColor = coveragePct >= 90 ? "#10B981" : coveragePct >= 60 ? "#F59E0B" : "#EF4444";
  const border = dark ? "#1A3326" : "#D1E8DC";

  return (
    <div className={`rounded-xl p-4 transition-all duration-300 ${isPulsing ? "scale-[1.02]" : "scale-100"}`}
      style={{
        background: isTop ? (dark ? "#0D1F16" : "#F0FAF5") : (dark ? "#0A1410" : "#FAFFFE"),
        border: `1px solid ${isTop ? "#10B981" : border}`,
        boxShadow: isTop ? "0 0 24px rgba(16,185,129,0.08)" : "none",
      }}>
      {isTop && (
        <div className="absolute top-3 right-3 text-[9px] px-2 py-0.5 rounded bg-[#059669] text-white font-bold tracking-widest">TOP</div>
      )}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg"></span>
        <span className={`font-semibold text-[13px] ${dark ? "text-[#E8F5EE]" : "text-[#0A1A10]"}`}>{platform.name}</span>
        {snapshot.trend === "up" && <span className="text-[10px] text-[#10B981] ml-auto">↑ rising</span>}
        {snapshot.trend === "down" && <span className={`text-[10px] ml-auto ${dark ? "text-[#4A7A62]" : "text-[#6B9E85]"}`}>↓ easing</span>}
      </div>
      <div className={`text-[26px] font-bold mb-1 leading-none ${dark ? "text-[#E8F5EE]" : "text-[#0A1A10]"}`}>
        ₹{snapshot.ppd}<span className={`text-[11px] font-normal ml-1 ${dark ? "text-[#4A7A62]" : "text-[#6B9E85]"}`}>/del</span>
      </div>
      {snapshot.surgeMult > 1.05 && (
        <div className="inline-block text-[10px] px-2 py-0.5 rounded mb-2 font-mono bg-[#F59E0B]/10 text-[#F59E0B]">
          ⚡ {snapshot.surgeMult.toFixed(2)}× surge
        </div>
      )}
      <div className={`flex gap-4 text-[11px] mb-2 ${dark ? "text-[#4A7A62]" : "text-[#6B9E85]"}`}>
        <span>{snapshot.supply} online</span>
        <span>{snapshot.demand} orders</span>
      </div>
      {snapshot.shortage > 0 && <div className="text-[11px] text-[#EF4444] mb-2">↑ {snapshot.shortage} rider gap</div>}
      <div className={`h-[2px] rounded-sm mb-1 ${dark ? "bg-[#1A3326]" : "bg-[#D1E8DC]"}`}>
        <div className="h-full rounded-sm transition-all duration-700" style={{ width: `${Math.min(100, coveragePct)}%`, background: coverageColor }} />
      </div>
      <div className={`text-[9px] ${dark ? "text-[#2A4A38]" : "text-[#A0C4B0]"}`}>Coverage {coveragePct}%</div>
    </div>
  );
}
