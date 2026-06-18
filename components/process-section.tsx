"use client"

import { useI18n } from "@/components/providers/i18n-provider"

const steps = [
  { num: "01", t: "process.s1t", d: "process.s1d" },
  { num: "02", t: "process.s2t", d: "process.s2d" },
  { num: "03", t: "process.s3t", d: "process.s3d" },
]

export function ProcessSection() {
  const { t } = useI18n()

  return (
    <section id="process" className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-sm font-medium text-accent">
            {t("process.badge")}
          </span>
          <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {t("process.title")}
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.num} className="relative rounded-2xl border border-border bg-card p-8">
              <span className="text-5xl font-extrabold text-accent/20">{step.num}</span>
              <h3 className="mt-4 text-xl font-bold text-foreground">{t(step.t)}</h3>
              <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">{t(step.d)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
