"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react"
import { useI18n } from "@/components/providers/i18n-provider"

/* ─── slide data ──────────────────────────────────────────────────── */
type Slide = {
  src: string
  labelKey: string
  tag: "service" | "france" | "before" | "after" | "promo"
  cta?: { labelKey: string; href: string }
}

const SLIDES: Slide[] = [
  // promotional slide first
  {
    src: "/slider/promo-50.png",
    labelKey: "slider.promoTitle",
    tag: "promo",
    cta: { labelKey: "slider.promoCta", href: "/commande" },
  },
  {
    src: "/slider/clean-2.png",
    labelKey: "slider.slide1",
    tag: "service",
    cta: { labelKey: "nav.order", href: "/commande" },
  },
  {
    src: "/slider/clean-3.png",
    labelKey: "slider.slide2",
    tag: "service",
    cta: { labelKey: "nav.order", href: "/commande" },
  },
  {
    src: "/slider/clean-1.png",
    labelKey: "slider.slide3",
    tag: "service",
    cta: { labelKey: "nav.order", href: "/commande" },
  },
  {
    src: "/slider/clean-4.png",
    labelKey: "slider.slide4",
    tag: "service",
    cta: { labelKey: "nav.order", href: "/commande" },
  },
  {
    src: "/slider/clean-france-1.png",
    labelKey: "slider.slide5",
    tag: "france",
    cta: { labelKey: "nav.order", href: "/commande" },
  },
  {
    src: "/slider/clean-france-2.png",
    labelKey: "slider.slide6",
    tag: "france",
    cta: { labelKey: "nav.order", href: "/commande" },
  },
  {
    src: "/slider/before-kitchen.png",
    labelKey: "slider.before1",
    tag: "before",
  },
  {
    src: "/slider/after-kitchen.png",
    labelKey: "slider.after1",
    tag: "after",
    cta: { labelKey: "nav.order", href: "/commande" },
  },
  {
    src: "/slider/before-bathroom.png",
    labelKey: "slider.before2",
    tag: "before",
  },
  {
    src: "/slider/after-bathroom.png",
    labelKey: "slider.after2",
    tag: "after",
    cta: { labelKey: "nav.order", href: "/commande" },
  },
]

const AUTO_INTERVAL = 4500

function mod(n: number, m: number) {
  return ((n % m) + m) % m
}

/* ─── tag config ──────────────────────────────────────────────────── */
const TAG_STYLE: Record<string, string> = {
  service: "bg-primary text-primary-foreground",
  france:  "bg-[#c9273a] text-white",
  before:  "bg-black/70 text-white",
  after:   "bg-[oklch(0.7_0.13_232)] text-white",
  promo:   "bg-amber-400 text-black",
}

/* ─── promo overlay ───────────────────────────────────────────────── */
function PromoOverlay({ t }: { t: (k: string) => string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 px-6 pb-14 text-center">
      {/* logo */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[oklch(0.7_0.13_232)] shadow-lg">
          <span className="text-xl font-black text-white">Z</span>
        </div>
        <span className="text-2xl font-black tracking-wider text-white drop-shadow-lg">
          ZYN<span className="text-[oklch(0.7_0.13_232)]">CLEEN</span>
        </span>
      </div>
      {/* badge */}
      <div className="mb-3 flex items-center gap-2 rounded-full bg-amber-400/20 px-4 py-1.5 ring-1 ring-amber-400/50">
        <Sparkles className="h-4 w-4 text-amber-300" />
        <span className="text-sm font-bold uppercase tracking-widest text-amber-300">
          {t("slider.promoTag")}
        </span>
      </div>
      {/* big 50% */}
      <div
        className="font-black leading-none text-white drop-shadow-2xl"
        style={{ fontSize: "clamp(5rem,18vw,10rem)", WebkitTextStroke: "2px oklch(0.7 0.13 232)" }}
      >
        50%
      </div>
      <p className="mt-1 text-lg font-semibold text-white/90 drop-shadow md:text-2xl">
        {t("slider.promoSub")}
      </p>
      <Link
        href="/commande"
        className="mt-6 flex items-center gap-2 rounded-full bg-[oklch(0.7_0.13_232)] px-8 py-3 text-sm font-bold text-white shadow-xl transition-all hover:scale-105 hover:bg-[oklch(0.62_0.15_232)] active:scale-95"
      >
        {t("slider.promoCta")} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

/* ─── component ───────────────────────────────────────────────────── */
export function PhotoSlider({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n()
  const [active, setActive] = useState(0)
  const [prev, setPrev]     = useState<number | null>(null)
  const [dir, setDir]       = useState<1 | -1>(1)
  const [animating, setAnimating] = useState(false)
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchXRef = useRef<number | null>(null)
  const total = SLIDES.length

  const go = useCallback(
    (d: 1 | -1) => {
      if (animating) return
      setDir(d)
      setPrev(active)
      setActive((p) => mod(p + d, total))
      setAnimating(true)
      setTimeout(() => { setPrev(null); setAnimating(false) }, 600)
    },
    [active, animating, total],
  )

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => go(1), AUTO_INTERVAL)
  }, [go])

  useEffect(() => {
    resetTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [resetTimer])

  /* touch swipe */
  const onTouchStart = (e: React.TouchEvent) => { touchXRef.current = e.touches[0].clientX }
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchXRef.current === null) return
    const delta = e.changedTouches[0].clientX - touchXRef.current
    touchXRef.current = null
    if (delta < -40) { go(1); resetTimer() }
    else if (delta > 40) { go(-1); resetTimer() }
  }

  const tagLabel: Record<string, string> = {
    service: t("slider.tagService"),
    france:  "🇫🇷 France",
    before:  t("slider.tagBefore"),
    after:   t("slider.tagAfter"),
    promo:   t("slider.promoTag"),
  }

  return (
    <section
      className="relative w-full overflow-hidden bg-black"
      style={{ height: compact ? "clamp(360px, 48vw, 560px)" : "clamp(420px, 60vw, 720px)" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── slides ─────────────────────────────────────────────────── */}
      {SLIDES.map((slide, i) => {
        const isActive = i === active
        const isPrev   = i === prev

        // position classes based on direction + state
        let translateClass = "translate-x-full"    // off-right by default
        if (isActive) translateClass = "translate-x-0"
        else if (isPrev) translateClass = dir === 1 ? "-translate-x-full" : "translate-x-full"

        return (
          <div
            key={slide.src}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-transform duration-[600ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${translateClass}`}
          >
            {/* image */}
            <Image
              src={slide.src}
              alt={t(slide.labelKey)}
              fill
              priority={i === 0}
              className={`object-cover transition-transform duration-[8000ms] ease-linear ${
                isActive ? "scale-110" : "scale-100"
              }`}
              sizes="100vw"
              draggable={false}
            />

            {/* overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

            {/* promo slide gets its own overlay */}
            {slide.tag === "promo" && isActive && <PromoOverlay t={t} />}

            {/* regular slide content */}
            {slide.tag !== "promo" && isActive && (
              <div className="absolute bottom-0 left-0 right-0 p-6 pb-14 md:p-10 md:pb-16">
                <span className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold ${TAG_STYLE[slide.tag]}`}>
                  {tagLabel[slide.tag]}
                </span>
                <h2
                  className="font-heading font-extrabold leading-tight text-white drop-shadow-xl"
                  style={{ fontSize: "clamp(1.25rem,3.5vw,2.5rem)" }}
                >
                  {t(slide.labelKey)}
                </h2>
                {/* Zyncleen logo inline */}
                <p className="mt-1 text-xs font-semibold tracking-widest text-white/60">
                  ZYN<span className="text-[oklch(0.7_0.13_232)]">CLEEN</span>
                </p>
                {slide.cta && (
                  <Link
                    href={slide.cta.href}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-[oklch(0.7_0.13_232)] px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-[oklch(0.62_0.15_232)] active:scale-95"
                  >
                    {t(slide.cta.labelKey)} <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* ── Zyncleen watermark top-left ─────────────────────────────── */}
      <div className="pointer-events-none absolute left-4 top-4 z-20 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm">
          <span className="text-sm font-black text-white">Z</span>
        </div>
        <span className="text-sm font-black tracking-wider text-white/90 drop-shadow">
          ZYN<span className="text-[oklch(0.85_0.14_232)]">CLEEN</span>
        </span>
      </div>

      {/* ── arrows ──────────────────────────────────────────────────── */}
      <button
        aria-label="Previous slide"
        onClick={() => { go(-1); resetTimer() }}
        className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/70 md:left-5 md:h-12 md:w-12"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        aria-label="Next slide"
        onClick={() => { go(1); resetTimer() }}
        className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/70 md:right-5 md:h-12 md:w-12"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* ── dot indicators ──────────────────────────────────────────── */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => { setActive(i); resetTimer() }}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width:      i === active ? 28 : 6,
              background: i === active ? "oklch(0.7 0.13 232)" : "rgba(255,255,255,0.45)",
            }}
          />
        ))}
      </div>

      {/* ── progress bar ─────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-0.5 bg-white/10">
        <div
          key={active}
          className="h-full bg-[oklch(0.7_0.13_232)]"
          style={{
            animation: `slideProgress ${AUTO_INTERVAL}ms linear forwards`,
          }}
        />
      </div>

      <style jsx>{`
        @keyframes slideProgress {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </section>
  )
}
