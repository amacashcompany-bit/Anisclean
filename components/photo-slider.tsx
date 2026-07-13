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
  cta?: { labelKey: string; href: string; labelFr?: string; labelEn?: string; labelAr?: string }
  // DB locale overrides
  labelFr?: string
  labelEn?: string
  labelAr?: string
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
          <span className="text-xl font-black text-white">A</span>
        </div>
        <span className="text-2xl font-black tracking-wider text-white drop-shadow-lg">
          ANIS<span className="text-[oklch(0.7_0.13_232)]">CLEAN</span>
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

type DbSlide = {
  id: number
  imageUrl: string
  labelFr: string | null
  labelEn: string | null
  labelAr: string | null
  tag: string
  sortOrder: number
  ctaLabelFr: string | null
  ctaLabelEn: string | null
  ctaLabelAr: string | null
  ctaHref: string | null
  isActive: boolean
  createdAt: Date
}

interface Props {
  dbSlides?: DbSlide[]
}

export function PhotoSlider({ dbSlides }: Props) {
  const { t, lang } = useI18n()
  const [idx, setIdx] = useState(0)
  const [dir, setDir] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const autoRef = useRef<NodeJS.Timeout | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  // Merge DB slides with static slides
  const slides: Slide[] = dbSlides && dbSlides.length > 0
    ? dbSlides
        .filter((s) => s.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((s) => ({
          src: s.imageUrl,
          labelKey: `dbSlide.${s.id}`,
          tag: s.tag as Slide["tag"],
          labelFr: s.labelFr ?? undefined,
          labelEn: s.labelEn ?? undefined,
          labelAr: s.labelAr ?? undefined,
          cta: s.ctaHref
            ? {
                labelKey: `dbSlideCta.${s.id}`,
                href: s.ctaHref,
                labelFr: s.ctaLabelFr ?? undefined,
                labelEn: s.ctaLabelEn ?? undefined,
                labelAr: s.ctaLabelAr ?? undefined,
              }
            : undefined,
        }))
    : SLIDES

  const slideLabel = (slide: Slide) => {
    if (slide.labelFr && lang === "fr") return slide.labelFr
    if (slide.labelEn && lang === "en") return slide.labelEn
    if (slide.labelAr && lang === "ar") return slide.labelAr
    return t(slide.labelKey)
  }

  const ctaLabel = (slide: Slide) => {
    if (!slide.cta) return ""
    if (slide.cta.labelFr && lang === "fr") return slide.cta.labelFr
    if (slide.cta.labelEn && lang === "en") return slide.cta.labelEn
    if (slide.cta.labelAr && lang === "ar") return slide.cta.labelAr
    return t(slide.cta.labelKey)
  }

  const n = slides.length

  const go = useCallback(
    (d: number) => {
      setDir(d)
      setIdx((i) => mod(i + d, n))
    },
    [n]
  )

  // Auto-advance (skip promo slide)
  useEffect(() => {
    if (n <= 1) return
    autoRef.current = setInterval(() => go(1), AUTO_INTERVAL)
    return () => {
      if (autoRef.current) clearInterval(autoRef.current)
    }
  }, [n, go])

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1)
      if (e.key === "ArrowLeft") go(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [go])

  // Touch / swipe
  const onTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX)
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart == null) return
    const diff = e.changedTouches[0].clientX - touchStart
    if (Math.abs(diff) > 50) go(diff < 0 ? 1 : -1)
    setTouchStart(null)
  }

  // Mouse drag
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setTouchStart(e.clientX)
  }
  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || touchStart == null) return
    const diff = e.clientX - touchStart
    if (Math.abs(diff) > 50) go(diff < 0 ? 1 : -1)
    setIsDragging(false)
    setTouchStart(null)
  }

  const tagLabel: Record<string, string> = {
    service: t("slider.tagService"),
    france: "France",
    before: t("slider.tagBefore"),
    after: t("slider.tagAfter"),
    promo: t("slider.promoTag"),
  }

  return (
    <section
      className="relative mx-auto w-full overflow-hidden rounded-3xl border border-border bg-muted"
      style={{ maxWidth: 1100, aspectRatio: "16/9" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={() => { setIsDragging(false); setTouchStart(null) }}
    >
      {/* Slides */}
      <div
        ref={trackRef}
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(${-idx * 100}%)`, cursor: isDragging ? "grabbing" : "grab" }}
      >
        {slides.map((slide, i) => {
          const isPromo = slide.tag === "promo"
          const isBeforeAfter = slide.tag === "before" || slide.tag === "after"
          const slideLabel = slideLabel(slide)
          const ctaLabel = ctaLabel(slide)

          return (
            <div key={i} className="relative h-full w-full shrink-0">
              <Image
                src={slide.src}
                alt={slideLabel}
                fill
                className="object-cover"
                sizes="(max-width: 1100px) 100vw, 1100px"
                priority={i === 0}
                draggable={false}
              />

              {/* Promo overlay */}
              {isPromo && <PromoOverlay t={t} />}

              {/* Standard overlay */}
              {!isPromo && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-6 pb-10 pt-24 md:px-10">
                  <span
                    className={`mb-2 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${TAG_STYLE[slide.tag] ?? "bg-white/20 text-white"}`}
                  >
                    {tagLabel[slide.tag]}
                  </span>
                  <h2
                    className="font-heading font-extrabold leading-tight text-white drop-shadow-xl"
                    style={{ fontSize: "clamp(1.25rem,3.5vw,2.5rem)" }}
                  >
                    {slideLabel}
                  </h2>
                  {/* Anisclean logo inline */}
                  <p className="mt-1 text-xs font-semibold tracking-widest text-white/60">
                    ANIS<span className="text-[oklch(0.7_0.13_232)]">CLEAN</span>
                  </p>
                  {slide.cta && (
                    <Link
                      href={slide.cta.href}
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-[oklch(0.7_0.13_232)] px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-[oklch(0.62_0.15_232)] active:scale-95"
                    >
                      {ctaLabel} <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Anisclean watermark top-left ─────────────────────────────── */}
      <div className="pointer-events-none absolute left-4 top-4 z-20 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm">
          <span className="text-sm font-black text-white">A</span>
        </div>
        <span className="text-sm font-black tracking-wider text-white/90 drop-shadow">
          ANIS<span className="text-[oklch(0.85_0.14_232)]">CLEAN</span>
        </span>
      </div>

      {/* Arrows */}
      {n > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
            aria-label="Précédent"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
            aria-label="Suivant"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {n > 1 && (
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDir(i > idx ? 1 : -1)
                setIdx(i)
              }}
              className={`h-2 rounded-full transition-all ${i === idx ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/70"}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}