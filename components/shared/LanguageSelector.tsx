'use client'
// Language globe selector — shows all 24 Indian official + regional languages
// Grouped by region. Persists to localStorage + Supabase profile.

import { useState, useRef, useEffect } from 'react'
import { LANGUAGES, LangCode } from '@/lib/data/types'

interface LanguageSelectorProps {
  value: LangCode
  onChange: (lang: LangCode) => void
  size?: 'sm' | 'md'
}

const REGIONS = ['North', 'South', 'East', 'West', 'Northeast', 'Central', 'Classical', 'International']

export function LanguageSelector({ value, onChange, size = 'md' }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = LANGUAGES.find(l => l.code === value)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const grouped = REGIONS.reduce((acc, region) => {
    acc[region] = LANGUAGES.filter(l => l.region === region)
    return acc
  }, {} as Record<string, typeof LANGUAGES>)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] bg-white dark:bg-[#111827] text-[#111827] dark:text-[#F9FAFB] hover:border-[#059669] transition-colors ${size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'}`}
        title="Select language"
      >
        {/* Globe icon */}
        <svg width={size === 'sm' ? 14 : 16} height={size === 'sm' ? 14 : 16} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
          <ellipse cx="8" cy="8" rx="3" ry="7" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="1" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="2" y1="5" x2="14" y2="5" stroke="currentColor" strokeWidth="1"/>
          <line x1="2" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="1"/>
        </svg>
        <span className="font-medium">{current?.native ?? 'EN'}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.5 }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-72 rounded-xl border border-[#E5E7EB] dark:border-[#1F2937] bg-white dark:bg-[#111827] shadow-xl overflow-hidden">
          <div className="max-h-80 overflow-y-auto">
            {REGIONS.map(region => {
              const langs = grouped[region]
              if (!langs?.length) return null
              return (
                <div key={region}>
                  <div className="px-3 py-1.5 text-[10px] font-semibold tracking-widest uppercase text-[#6B7280] dark:text-[#9CA3AF] bg-[#F9FAFB] dark:bg-[#0C0C0C] border-b border-[#E5E7EB] dark:border-[#1F2937]">
                    {region}
                  </div>
                  <div className="grid grid-cols-2">
                    {langs.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => { onChange(lang.code); setOpen(false) }}
                        className={`flex flex-col items-start px-3 py-2 text-left hover:bg-[#F9FAFB] dark:hover:bg-[#0C0C0C] transition-colors ${value === lang.code ? 'bg-[#F0FDF4] dark:bg-[#052e16]' : ''}`}
                      >
                        <span className={`text-sm font-medium ${value === lang.code ? 'text-[#059669]' : 'text-[#111827] dark:text-[#F9FAFB]'}`}>
                          {lang.native}
                        </span>
                        <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
