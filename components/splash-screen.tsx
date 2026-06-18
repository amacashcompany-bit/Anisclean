"use client"

import { useEffect, useState } from "react"

/* Renders only on mobile viewports (< 768 px) and only on the very first
   visit / page load in a session. On desktop it mounts nothing at all.     */
export function SplashScreen() {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const [hiding, setHiding] = useState(false)

  useEffect(() => {
    // Only show on mobile
    if (window.innerWidth >= 768) return

    // Only show once per session
    if (sessionStorage.getItem("splash_shown")) return
    sessionStorage.setItem("splash_shown", "1")

    setVisible(true)

    // Animate progress bar from 0 → 100 over 2.4 s
    const start = performance.now()
    const duration = 2400
    let rafId: number
    const tick = (now: number) => {
      const pct = Math.min(((now - start) / duration) * 100, 100)
      setProgress(pct)
      if (pct < 100) {
        rafId = requestAnimationFrame(tick)
      } else {
        // Fade out after bar completes
        setTimeout(() => {
          setHiding(true)
          setTimeout(() => setVisible(false), 600)
        }, 300)
      }
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden select-none md:hidden"
      style={{
        background: "linear-gradient(160deg, #0d9488 0%, #14b8a6 30%, #d1fae5 65%, #86efac 100%)",
        opacity: hiding ? 0 : 1,
        transition: hiding ? "opacity 0.6s ease-in-out" : "none",
      }}
    >
      {/* Decorative blurred circles */}
      <div
        className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #ffffff 0%, #0d9488 100%)" }}
      />
      <div
        className="absolute bottom-24 -left-20 w-64 h-64 rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, #86efac 0%, #0d9488 100%)" }}
      />

      {/* Ghost leaf top-right */}
      <svg
        className="absolute top-8 right-6 opacity-10"
        width="90"
        height="110"
        viewBox="0 0 90 110"
        fill="none"
      >
        <path
          d="M45 5 C70 5 85 30 85 55 C85 80 65 105 45 105 C25 105 5 80 5 55 C5 30 20 5 45 5 Z"
          fill="white"
        />
        <line x1="45" y1="105" x2="45" y2="5" stroke="white" strokeWidth="2" opacity="0.5" />
        <line x1="45" y1="55" x2="75" y2="30" stroke="white" strokeWidth="1.5" opacity="0.4" />
        <line x1="45" y1="70" x2="20" y2="45" stroke="white" strokeWidth="1.5" opacity="0.4" />
      </svg>

      {/* ── Logo area ── */}
      <div className="flex flex-col items-center gap-2 mb-16 animate-[splash-pop_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.15s_both]">
        {/* Stylised Z */}
        <div className="relative w-28 h-28 mb-2">
          <svg viewBox="0 0 120 120" fill="none" className="w-full h-full drop-shadow-2xl">
            {/* Z body */}
            <path
              d="M20 28 L95 28 L25 88 L100 88"
              stroke="url(#zgrad)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Sparkle top-right */}
            <path d="M92 16 L94 10 L96 16 L102 18 L96 20 L94 26 L92 20 L86 18 Z" fill="#ffffff" opacity="0.9" />
            <path d="M105 32 L106 28 L107 32 L111 33 L107 34 L106 38 L105 34 L101 33 Z" fill="#ffffff" opacity="0.7" />
            {/* Leaf top */}
            <path
              d="M86 20 C90 12 100 8 108 14 C104 22 94 24 86 20 Z"
              fill="#4ade80"
              opacity="0.9"
            />
            {/* Water drop */}
            <ellipse cx="34" cy="18" rx="5" ry="7" fill="#7dd3fc" opacity="0.85" />
            <defs>
              <linearGradient id="zgrad" x1="20" y1="28" x2="100" y2="88" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0d9488" />
                <stop offset="50%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Brand name */}
        <div className="flex items-baseline gap-0">
          <span
            className="text-4xl font-black tracking-wider"
            style={{ color: "#0d3050", fontFamily: "var(--font-inter)" }}
          >
            ZYN
          </span>
          <span
            className="text-4xl font-black tracking-wider"
            style={{ color: "#0d9488", fontFamily: "var(--font-inter)" }}
          >
            CLEAN
          </span>
        </div>

        {/* Tagline */}
        <p
          className="text-xs font-semibold tracking-[0.28em] uppercase mt-1"
          style={{ color: "#0d504a" }}
        >
          Cleaning Services App
        </p>
      </div>

      {/* ── App icon + loading bar ── */}
      <div
        className="absolute bottom-16 flex flex-col items-center gap-4 w-48 animate-[splash-fadein_0.5s_ease_0.6s_both]"
      >
        {/* App icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl"
          style={{ background: "linear-gradient(135deg, #0d9488 0%, #10b981 100%)" }}
        >
          <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
            <path
              d="M7 11 L30 11 L10 28 L33 28"
              stroke="white"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M28 5 C31 1 37 0 40 4 C37 8 31 8 28 5 Z" fill="#4ade80" opacity="0.9" />
            <path d="M30 7 L31 4 L32 7 L35 8 L32 9 L31 12 L30 9 L27 8 Z" fill="white" opacity="0.9" />
          </svg>
        </div>

        {/* Loading bar track */}
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(13,80,74,0.2)" }}>
          <div
            className="h-full rounded-full transition-none"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #0d9488, #10b981, #34d399)",
              boxShadow: "0 0 8px rgba(13,148,136,0.7)",
              transition: "width 0.05s linear",
            }}
          />
        </div>

        {/* Label */}
        <p className="text-xs font-medium" style={{ color: "#0d504a" }}>
          Loading services...
        </p>
      </div>

      <style>{`
        @keyframes splash-pop {
          from { opacity: 0; transform: scale(0.7) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes splash-fadein {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
