// GigShift Logo — SVG component
// Brand concept: "The Shift" — a geometric arrow-within-arrow mark
// Meaning: movement, transition, momentum. The inner arrow = rider. Outer = platform.
// Together they shift. No vehicles. No food. Pure motion.

import React from 'react'

interface LogoProps {
  size?: number
  variant?: 'full' | 'mark' | 'wordmark'
  theme?: 'light' | 'dark'
  className?: string
}

export function GigShiftLogo({ size = 40, variant = 'full', theme = 'light', className = '' }: LogoProps) {
  const green = '#059669'
  const dark = '#111827'
  const light = '#F9FAFB'
  const textColor = theme === 'dark' ? light : dark

  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer parallelogram — platform layer */}
      <path
        d="M4 28L16 8H36L24 28H4Z"
        fill={green}
        opacity="0.15"
      />
      {/* Inner arrow — rider layer */}
      <path
        d="M10 26L20 10H34L24 26H10Z"
        fill={green}
        opacity="0.4"
      />
      {/* Core arrow tip — the shift moment */}
      <path
        d="M16 24L22 13H32L26 24H16Z"
        fill={green}
      />
      {/* Vertical slash — the "G" in GS, also looks like a shift key */}
      <rect
        x="18.5"
        y="8"
        width="3"
        height="24"
        rx="1.5"
        fill={green}
        opacity="0.25"
      />
    </svg>
  )

  if (variant === 'mark') return <span className={className}>{mark}</span>

  if (variant === 'wordmark') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {mark}
        <div style={{ color: textColor }}>
          <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: size * 0.55, letterSpacing: '-0.02em' }}>
            Gig
          </span>
          <span style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: size * 0.55, letterSpacing: '-0.02em', color: green }}>
            Shift
          </span>
        </div>
      </div>
    )
  }

  // full — mark + wordmark stacked or side by side
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {mark}
      <div style={{ lineHeight: 1 }}>
        <div style={{ color: textColor, fontFamily: 'Inter', fontWeight: 700, fontSize: size * 0.5, letterSpacing: '-0.03em' }}>
          Gig<span style={{ color: green, fontWeight: 300 }}>Shift</span>
        </div>
        <div style={{ color: green, fontFamily: 'Inter', fontWeight: 500, fontSize: size * 0.22, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Dispatch Intelligence
        </div>
      </div>
    </div>
  )
}

// Animated splash version — for the 3s intro screen
export function GigShiftSplash({ onComplete }: { onComplete: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-[#0C0C0C]"
      style={{ animation: 'fadeOut 0.5s ease-in-out 2.8s forwards' }}
      onAnimationEnd={onComplete}
    >
      <style>{`
        @keyframes fadeOut {
          to { opacity: 0; pointer-events: none; }
        }
        @keyframes drawIn {
          from { stroke-dashoffset: 200; opacity: 0; }
          to { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes fillIn {
          0% { fill-opacity: 0; transform: scale(0.92); }
          60% { fill-opacity: 1; transform: scale(1.02); }
          100% { fill-opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .logo-outer { animation: fillIn 0.6s ease-out 0.2s both; }
        .logo-mid { animation: fillIn 0.5s ease-out 0.5s both; }
        .logo-core { animation: fillIn 0.5s ease-out 0.75s both; }
        .logo-slash { animation: fillIn 0.4s ease-out 0.95s both; }
        .logo-wordmark { animation: slideUp 0.5s ease-out 1.1s both; }
        .logo-tagline { animation: slideUp 0.4s ease-out 1.4s both; }
      `}</style>

      <div className="flex flex-col items-center gap-6">
        <svg width="80" height="80" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path className="logo-outer" d="M4 28L16 8H36L24 28H4Z" fill="#059669" fillOpacity="0.15" />
          <path className="logo-mid" d="M10 26L20 10H34L24 26H10Z" fill="#059669" fillOpacity="0.4" />
          <path className="logo-core" d="M16 24L22 13H32L26 24H16Z" fill="#059669" />
          <rect className="logo-slash" x="18.5" y="8" width="3" height="24" rx="1.5" fill="#059669" fillOpacity="0.25" />
        </svg>

        <div className="logo-wordmark text-center">
          <div className="text-4xl font-bold tracking-tight text-[#111827] dark:text-[#F9FAFB]">
            Gig<span className="font-light text-[#059669]">Shift</span>
          </div>
        </div>

        <div className="logo-tagline text-xs font-medium tracking-[0.2em] uppercase text-[#059669]">
          Dispatch Intelligence
        </div>
      </div>
    </div>
  )
}
