"use client"

import { useState } from "react"
import Link from "next/link"
import { Check } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/providers/i18n-provider"

const RATE = 30 // €/h full price

export function CreditSimulatorSection() {
  const { t, lang } = useI18n()
  const [hours, setHours] = useState(8)

  const monthlyGross = hours * RATE
  const monthlyNet = Math.round(monthlyGross / 2)
  const yearlySavings = (monthlyGross - monthlyNet) * 12
  const locale = lang === "ar" ? "ar" : lang === "en" ? "en-US" : "fr-FR"

  const benefits = [t("hero.f2"), t("hero.f3"), t("hero.f5")]

  return (
    <section id="credit-impot" className="bg-secondary/40 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:px-6 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-sm font-medium text-accent">
            {t("sim.badge")}
          </span>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {t("sim.title")}
          </h2>
          <p className="text-pretty text-lg leading-relaxed text-muted-foreground">{t("sim.desc")}</p>
          <ul className="flex flex-col gap-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-accent/10 text-accent">
                  <Check className="h-4 w-4" />
                </span>
                <span className="leading-relaxed text-foreground">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg md:p-8">
          <div className="mt-2">
            <div className="flex items-baseline justify-between">
              <label htmlFor="hours" className="text-sm font-medium text-foreground">
                {t("sim.hours")}
              </label>
              <span className="text-lg font-extrabold text-accent">
                {hours} {t("inv.hoursUnit")}
              </span>
            </div>
            <Slider
              id="hours"
              className="mt-4"
              min={1}
              max={40}
              step={1}
              value={[hours]}
              onValueChange={(v) => setHours(v[0])}
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>40</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm text-muted-foreground">{t("sim.monthlyGross")}</p>
              <p className="mt-1 text-2xl font-extrabold text-muted-foreground line-through">{monthlyGross} €</p>
            </div>
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
              <p className="text-sm text-accent">{t("sim.monthlyNet")}</p>
              <p className="mt-1 text-2xl font-extrabold text-foreground">{monthlyNet} €</p>
            </div>
          </div>

          <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-center text-sm font-semibold text-foreground">
            {t("sim.yearlySaving")}: {yearlySavings.toLocaleString(locale)} €
          </p>

          <Button asChild size="lg" className="mt-6 w-full">
            <Link href="/commande">{t("sim.cta")}</Link>
          </Button>
          <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">{t("sim.note")}</p>
        </div>
      </div>
    </section>
  )
}
