"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

const RATE = 30 // €/h plein tarif

export function CreditSimulatorSection() {
  const [hours, setHours] = useState(3)

  const weeklyFull = hours * RATE
  const monthlyFull = Math.round(weeklyFull * 4.33)
  const monthlyReal = Math.round(monthlyFull / 2)
  const yearlySavings = Math.round((monthlyFull - monthlyReal) * 12)

  const benefits = [
    "50 % de crédit d'impôt sur le ménage à domicile",
    "Avance immédiate : ne payez tout de suite que la moitié",
    "Paiement en CESU accepté",
  ]

  return (
    <section id="credit-impot" className="bg-secondary/40 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:px-6 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-sm font-medium text-accent">
            Services à la personne
          </span>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Le ménage à domicile vous coûte 2 fois moins cher
          </h2>
          <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
            Pour le ménage à votre domicile : 30 €/h facturés, 15 €/h réellement à votre charge.
          </p>
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
          <h3 className="text-xl font-bold text-foreground">Simulateur crédit d&apos;impôt</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Estimez votre coût réel après les 50 % de crédit d&apos;impôt.
          </p>

          <div className="mt-6">
            <div className="flex items-baseline justify-between">
              <label htmlFor="hours" className="text-sm font-medium text-foreground">
                Heures de ménage par semaine
              </label>
              <span className="text-lg font-extrabold text-accent">{hours} h</span>
            </div>
            <Slider
              id="hours"
              className="mt-4"
              min={1}
              max={15}
              step={1}
              value={[hours]}
              onValueChange={(v) => setHours(v[0])}
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>1 h</span>
              <span>15 h</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm text-muted-foreground">Prix plein / mois</p>
              <p className="mt-1 text-2xl font-extrabold text-muted-foreground line-through">{monthlyFull} €</p>
            </div>
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
              <p className="text-sm text-accent">Votre coût / mois</p>
              <p className="mt-1 text-2xl font-extrabold text-foreground">{monthlyReal} €</p>
            </div>
          </div>

          <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-center text-sm font-semibold text-foreground">
            Vous économisez {yearlySavings.toLocaleString("fr-FR")} € par an
            <span className="ml-1 font-normal text-muted-foreground">· estimation indicative</span>
          </p>

          <Button asChild size="lg" className="mt-6 w-full">
            <a href="#contact">Demander un devis gratuit</a>
          </Button>
          <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
            Estimation indicative. Crédit d&apos;impôt via la coopérative Accès SAP, sur les prestations à domicile.
          </p>
        </div>
      </div>
    </section>
  )
}
