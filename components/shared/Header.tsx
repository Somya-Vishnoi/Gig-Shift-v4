"use client";

import { useState } from "react";
import type { Role } from "@/lib/data/types";
import { t } from "@/lib/data/types";
import { Sun, Moon, LogOut, Menu, X } from "lucide-react";

interface Props {
  role: Role;
  name: string;
  language: string;
  darkMode: boolean;
  toggleDark: () => void;
  lastTick: Date;
  tickCount: number;
  onLogout: () => void;
}

const ROLE_LABELS: Record<Role, string> = {
  rider: "Rider", platform: "Platform", admin: "Admin",
};

export default function Header({ role, name, language, darkMode, toggleDark, lastTick, onLogout }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50 bg-white/95 dark:bg-[#0C0C0C]/95 backdrop-blur-sm">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-[#059669] rounded-md flex items-center justify-center shrink-0">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path d="M8 1L10.5 6H15L11.5 9.5L13 15L8 12L3 15L4.5 9.5L1 6H5.5L8 1Z" fill="white"/>
          </svg>
        </div>
        <span className="text-[14px] font-semibold tracking-tight text-gray-900 dark:text-gray-100">GigShift</span>
        {role === "admin" && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#059669] text-white tracking-wider hidden sm:inline">ADMIN</span>
        )}
      </div>

      {/* Live — desktop only */}
      <div className="hidden sm:flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#059669] gs-pulse-dot" />
        <span className="text-[11px] text-gray-400 font-mono">
          {t(language, "liveLabel")} · {lastTick.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {/* Right — desktop */}
      <div className="hidden sm:flex items-center gap-3">
        <span className="text-[12px] text-gray-500 dark:text-gray-400">
          {name} · <span className="text-gray-400">{ROLE_LABELS[role]}</span>
        </span>
        <button onClick={toggleDark} className="p-2 rounded-md cursor-pointer text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          {darkMode ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <button onClick={onLogout} className="p-2 rounded-md cursor-pointer text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <LogOut size={14} />
        </button>
      </div>

      {/* Mobile menu button */}
      <button onClick={() => setMenuOpen(o => !o)} className="sm:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 cursor-pointer">
        {menuOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50 px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-gray-700">{name} · {ROLE_LABELS[role]}</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
              <span className="text-[11px] text-gray-400 font-mono">{lastTick.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { toggleDark(); setMenuOpen(false); }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 text-[13px] text-gray-600 cursor-pointer">
              {darkMode ? <><Sun size={13} /> Light</> : <><Moon size={13} /> Dark</>}
            </button>
            <button onClick={() => { onLogout(); setMenuOpen(false); }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-red-100 text-[13px] text-red-500 cursor-pointer">
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
