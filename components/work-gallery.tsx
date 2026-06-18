"use client"

import Image from "next/image"
import Link from "next/link"
import { Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/providers/i18n-provider"

type WorkItem = {
  id: string
  image: string
  captionKey: string
  tagKey: string
}

const WORK_ITEMS: WorkItem[] = [
  { id: "staircase", image: "/work/staircase.png", captionKey: "work.staircase", tagKey: "work.staircaseTag" },
  { id: "kitchen", image: "/work/kitchen.png", captionKey: "work.kitchen", tagKey: "work.kitchenTag" },
  { id: "bathroom", image: "/work/bathroom.png", captionKey: "work.bathroom", tagKey: "work.bathroomTag" },
  { id: "sofa", image: "/work/sofa.png", captionKey: "work.sofa", tagKey: "work.sofaTag" },
  { id: "windows", image: "/work/windows.png", captionKey: "work.windows", tagKey: "work.windowsTag" },
  { id: "terrace", image: "/work/terrace.png", captionKey: "work.terrace", tagKey: "work.terraceTag" },
]

export function WorkGallery() {
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

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {WORK_ITEMS.map((item) => (
            <figure
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={t(item.captionKey)}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* center divider line */}
                <span
                  className="pointer-events-none absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-background/70"
                  aria-hidden="true"
                />
                {/* before label (left half) */}
                <span className="absolute bottom-3 left-3 rounded-md bg-foreground/75 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-background backdrop-blur-sm">
                  {t("work.before")}
                </span>
                {/* after label (right half) */}
                <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md bg-accent/90 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-accent-foreground backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("work.after")}
                </span>
              </div>
              <figcaption className="flex items-center justify-between gap-3 p-4">
                <span className="text-pretty font-semibold text-foreground">{t(item.captionKey)}</span>
                <Badge variant="secondary" className="shrink-0 rounded-full text-xs">
                  {t(item.tagKey)}
                </Badge>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link href="/commande">{t("work.cta")}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
