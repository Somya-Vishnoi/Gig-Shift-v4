"use client";

interface Props {
  label: string;
  value: string | number;
  color?: string;
  sub?: string;
  dark?: boolean;
  pulse?: boolean;
}

export default function MetricCard({ label, value, color, sub, dark = true, pulse = false }: Props) {
  return (
    <div className={`rounded-xl p-4 transition-all duration-300 ${pulse ? "scale-[1.02]" : "scale-100"} ${
      dark ? "bg-[#0D1F16] border border-[#1A3326]" : "bg-white border border-[#D1E8DC] shadow-sm"
    }`}>
      <div className={`text-[10px] tracking-[0.15em] uppercase mb-2 ${dark ? "text-[#4A7A62]" : "text-[#6B9E85]"}`}>{label}</div>
      <div className="text-[22px] font-bold leading-none" style={{ color: color || (dark ? "#E8F5EE" : "#0A1A10") }}>{value}</div>
      {sub && <div className={`text-[11px] mt-1 ${dark ? "text-[#2A4A38]" : "text-[#A0C4B0]"}`}>{sub}</div>}
    </div>
  );
}
