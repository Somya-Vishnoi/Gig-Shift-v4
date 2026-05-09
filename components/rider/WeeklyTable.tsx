"use client";

import { PLATFORMS, DAYS } from "@/lib/data/types";

interface Props {
  weekly: Record<string, string | number>[];
  dark: boolean;
}

export default function WeeklyTable({ weekly, dark }: Props) {
  const bg = dark ? "bg-[#0D1F16] border border-[#1A3326]" : "bg-white border border-[#D1E8DA] shadow-sm";
  const textMuted = dark ? "text-[#3D6B55]" : "text-[#9ABBA8]";

  return (
    <div className={`${bg} rounded-xl p-5`}>
      <div className={`text-[10px] tracking-[0.15em] uppercase mb-4 ${textMuted}`}>7-Day PPD Forecast</div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className={`text-left font-normal pb-2 ${textMuted}`}>Day</th>
              {PLATFORMS.map(p => (
                <th key={p.id} className="text-right font-semibold pb-2 pr-2" style={{ color: p.color }}>
                  {p.name[0]} {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weekly.map((row, i) => {
              const day = DAYS[i] ?? row.day as string;
              const isWeekend = day === "Sat" || day === "Sun";
              const maxVal = Math.max(...PLATFORMS.map(p => row[p.id] as number));
              return (
                <tr key={day} className={`border-t ${dark ? "border-[#0F2318]" : "border-[#EAF5EF]"}`}>
                  <td className={`py-2 font-mono ${isWeekend ? "text-[#F59E0B]" : dark ? "text-[#8ABBA0]" : "text-[#555]"}`}>
                    {isWeekend ? "⭐ " : ""}{day}
                  </td>
                  {PLATFORMS.map(p => {
                    const val = row[p.id] as number;
                    const isMax = val === maxVal;
                    return (
                      <td key={p.id} className="text-right pr-2 font-mono"
                        style={{ color: isMax ? p.color : dark ? "#3D6B55" : "#9ABBA8", fontWeight: isMax ? 700 : 400 }}>
                        ₹{val}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className={`text-[11px] mt-3 ${dark ? "text-[#2A4A37]" : "text-[#9ABBA8]"}`}>
        ⭐ Weekends avg 40–60% higher
      </div>
    </div>
  );
}
