"use client"

import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/components/providers/i18n-provider"

const items = ["r1", "r2", "r3"]

export function TestimonialsSection() {
  const { t } = useI18n()

  return (
    <section id="avis" className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-sm font-medium text-accent">
            {t("reviews.badge")}
          </span>
          <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {t("reviews.title")}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((key) => (
            <Card key={key} className="border-border bg-card">
              <CardContent className="flex h-full flex-col gap-4 pt-6">
                <div className="flex" aria-label="5 / 5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="flex-1 text-pretty leading-relaxed text-foreground">
                  {`"${t(`${key}.text`)}"`}
                </blockquote>
                <div className="mt-2">
                  <p className="font-semibold text-foreground">{t(`${key}.name`)}</p>
                  <p className="text-sm text-muted-foreground">{t(`${key}.city`)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
