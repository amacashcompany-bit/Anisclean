"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useI18n } from "@/components/providers/i18n-provider"

/* ─── slide data ─────────────────────────────────────────────────── */
const SLIDES = [
  {
    src: "/slider/clean-2.png",
    labelKey: "slider.slide1",
    tag: "service",
  },
  {
    src: "/slider/clean-3.png",
    labelKey: "slider.slide2",
    tag: "service",
  },
  {
    src: "/slider/clean-1.png",
    labelKey: "slider.slide3",
    tag: "service",
  },
  {
    src: "/slider/clean-4.png",
    labelKey: "slider.slide4",
    tag: "service",
  },
  {
    src: "/slider/clean-france-1.png",
    labelKey: "slider.slide5",
    tag: "france",
  },
  {
    src: "/slider/clean-france-2.png",
    labelKey: "slider.slide6",
    tag: "france",
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
  },
]

const AUTO_INTERVAL = 4000

/* ─── helpers ────────────────────────────────────────────────────── */
function mod(n: number, m: number) {
  return ((n % m) + m) % m
}

/** Maps an index offset (-2…+2) to its 3-D transform */
function getTransform(offset: number): React.CSSProperties {
  const abs = Math.abs(offset)
  if (abs > 2) return { display: "none" }

  const tx = offset * 260
  const tz = abs === 0 ? 0 : abs === 1 ? -120 : -260
  const rotY = offset * -18
  const scale = abs === 0 ? 1 : abs === 1 ? 0.82 : 0.64
  const opacity = abs === 0 ? 1 : abs === 1 ? 0.7 : 0.4
  const zIndex = 10 - abs * 3

  return {
    transform: `translateX(${tx}px) translateZ(${tz}px) rotateY(${rotY}deg) scale(${scale})`,
    opacity,
    zIndex,
  }
}

export function PhotoSlider() {
  const { t } = useI18n()
  const [active, setActive] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const [dragDelta, setDragDelta] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const total = SLIDES.length

  const go = useCallback(
    (dir: 1 | -1) => {
      setActive((p) => mod(p + dir, total))
    },
    [total],
  )

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => go(1), AUTO_INTERVAL)
  }, [go])

  useEffect(() => {
    resetTimer()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [resetTimer])

  /* touch / mouse drag */
  const onDragStart = (x: number) => {
    setDragging(true)
    setDragStart(x)
    setDragDelta(0)
    if (timerRef.current) clearInterval(timerRef.current)
  }
  const onDragMove = (x: number) => {
    if (!dragging) return
    setDragDelta(x - dragStart)
  }
  const onDragEnd = () => {
    if (!dragging) return
    setDragging(false)
    if (dragDelta < -50) go(1)
    else if (dragDelta > 50) go(-1)
    setDragDelta(0)
    resetTimer()
  }

  const tagColor: Record<string, string> = {
    service: "bg-primary text-primary-foreground",
    france: "bg-[oklch(0.55_0.18_25)] text-white",
    before: "bg-muted-foreground text-white",
    after: "bg-accent text-white",
  }
  const tagLabel: Record<string, string> = {
    service: t("slider.tagService"),
    france: "🇫🇷 France",
    before: t("slider.tagBefore"),
    after: t("slider.tagAfter"),
  }

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-muted/60 to-background py-16 md:py-24">
      {/* heading */}
      <div className="mx-auto mb-10 max-w-2xl px-4 text-center">
        <span className="mb-3 inline-block rounded-full bg-accent/15 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
          {t("slider.badge")}
        </span>
        <h2 className="font-heading text-3xl font-extrabold text-primary md:text-4xl">
          {t("slider.title")}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          {t("slider.desc")}
        </p>
      </div>

      {/* 3-D stage */}
      <div
        className="relative mx-auto h-[340px] md:h-[420px]"
        style={{ perspective: "1100px", perspectiveOrigin: "50% 50%" }}
        onMouseDown={(e) => onDragStart(e.clientX)}
        onMouseMove={(e) => onDragMove(e.clientX)}
        onMouseUp={onDragEnd}
        onMouseLeave={onDragEnd}
        onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
        onTouchMove={(e) => onDragMove(e.touches[0].clientX)}
        onTouchEnd={onDragEnd}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {SLIDES.map((slide, i) => {
            const rawOffset = mod(i - active + Math.round(total / 2), total) - Math.round(total / 2)
            // small drag nudge on the active card
            const extraTx = rawOffset === 0 ? dragDelta * 0.4 : 0
            const style = getTransform(rawOffset)
            const hidden = style.display === "none"
            if (hidden) return null

            return (
              <div
                key={slide.src}
                className="absolute cursor-pointer select-none"
                style={{
                  ...style,
                  width: "clamp(220px, 38vw, 480px)",
                  transition: dragging && rawOffset === 0
                    ? "none"
                    : "transform 0.55s cubic-bezier(0.34,1.2,0.64,1), opacity 0.45s ease",
                  transform:
                    dragging && rawOffset === 0
                      ? `translateX(calc(${(style.transform as string).match(/translateX\(([^)]+)\)/)?.[1] ?? "0px"} + ${extraTx}px)) translateZ(0px) rotateY(0deg) scale(1)`
                      : (style.transform as string),
                }}
                onClick={() => {
                  if (rawOffset !== 0) setActive(i)
                }}
              >
                {/* card */}
                <div className="relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-border/30"
                  style={{ aspectRatio: "4/3" }}>
                  <Image
                    src={slide.src}
                    alt={t(slide.labelKey)}
                    fill
                    className="object-cover"
                    sizes="(max-width:768px) 80vw, 480px"
                    draggable={false}
                  />
                  {/* gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  {/* Zyncleen logo watermark */}
                  <div className="absolute right-3 top-3 rounded-lg bg-black/40 px-2 py-1 backdrop-blur-sm">
                    <span className="text-xs font-black tracking-wider text-white">
                      ZYN<span className="text-[oklch(0.7_0.13_232)]">CLEEN</span>
                    </span>
                  </div>

                  {/* tag */}
                  {rawOffset === 0 && (
                    <div className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-semibold ${tagColor[slide.tag]}`}>
                      {tagLabel[slide.tag]}
                    </div>
                  )}

                  {/* label */}
                  {rawOffset === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-sm font-semibold leading-snug text-white drop-shadow-md">
                        {t(slide.labelKey)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* arrows */}
      <div className="mt-8 flex items-center justify-center gap-6">
        <button
          aria-label="Previous"
          onClick={() => { go(-1); resetTimer() }}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background shadow-md transition hover:bg-primary hover:text-primary-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* dots */}
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => { setActive(i); resetTimer() }}
              className="h-2 rounded-full transition-all"
              style={{
                width: i === active ? 24 : 8,
                background: i === active ? "oklch(0.7 0.13 232)" : "oklch(0.85 0.02 235)",
              }}
            />
          ))}
        </div>

        <button
          aria-label="Next"
          onClick={() => { go(1); resetTimer() }}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background shadow-md transition hover:bg-primary hover:text-primary-foreground"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  )
}
