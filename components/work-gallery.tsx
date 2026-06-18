"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { GripVertical, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/providers/i18n-provider"

type WorkItem = {
  id: number
  title: string
  tag: string | null
  beforeUrl: string
  afterUrl: string
}

// Interactive drag-to-reveal before/after slider
function BeforeAfterSlider({ before, after, title }: { before: string; after: string; title: string }) {
  const [pos, setPos] = useState(50)
  const trackRef = useRef<HTMLDivElement>(null)

  function calcPct(clientX: number) {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return pos
    return Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100))
  }

  // Pointer events (mouse + touch unified)
  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId)
    setPos(calcPct(e.clientX))
  }
  function onPointerMove(e: React.PointerEvent) {
    if (e.buttons === 0) return
    setPos(calcPct(e.clientX))
  }

  return (
    <div
      ref={trackRef}
      className="relative aspect-[4/3] w-full overflow-hidden cursor-col-resize select-none touch-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      aria-label={`Comparaison avant/après : ${title}`}
    >
      {/* After — full background */}
      <Image
        src={after}
        alt={`${title} — après`}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
        draggable={false}
      />

      {/* Before — clipped left portion */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <Image
          src={before}
          alt={`${title} — avant`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          draggable={false}
        />
      </div>

      {/* Divider line + handle */}
      <div
        className="absolute inset-y-0 w-0.5 bg-white/90 shadow-[0_0_8px_rgba(0,0,0,0.4)] pointer-events-none"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-9 rounded-full bg-white shadow-md flex items-center justify-center">
          <GripVertical className="size-4 text-foreground" aria-hidden="true" />
        </div>
      </div>

      {/* Labels */}
      <span className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-foreground/75 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-background backdrop-blur-sm">
        Avant
      </span>
      <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md bg-accent/90 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-accent-foreground backdrop-blur-sm">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        Après
      </span>
    </div>
  )
}

export function WorkGallery({ items }: { items: WorkItem[] }) {
  const { t } = useI18n()

  return (
    <section className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <Badge
            variant="outline"
            className="mb-4 gap-2 rounded-full border-accent/40 bg-accent/10 px-4 py-1.5 text-accent"
          >
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            {t("work.badge")}
          </Badge>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            {t("work.title")}
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            {t("work.subtitle")}
          </p>
        </div>

        {items.length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">
            Aucune réalisation pour le moment. Revenez bientôt !
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <figure
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                <BeforeAfterSlider
                  before={item.beforeUrl}
                  after={item.afterUrl}
                  title={item.title}
                />
                <figcaption className="flex items-center justify-between gap-3 p-4">
                  <span className="text-pretty font-semibold text-foreground">{item.title}</span>
                  {item.tag && (
                    <Badge variant="secondary" className="shrink-0 rounded-full text-xs">
                      {item.tag}
                    </Badge>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Button render={<Link href="/commande" />} size="lg" className="rounded-full px-8">
            {t("work.cta")}
          </Button>
        </div>
      </div>
    </section>
  )
}
