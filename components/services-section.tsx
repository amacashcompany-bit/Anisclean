import { Brush, Hammer, Wind, Sofa, Trees, Building2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const services = [
  {
    icon: Brush,
    title: "Ménage & nettoyage",
    desc: "Entretien régulier de votre logement ou grand nettoyage de printemps.",
    price: "dès 30 €/h",
    badge: "Crédit d'impôt 50 %",
  },
  {
    icon: Hammer,
    title: "Remise en état",
    desc: "Nettoyage en profondeur après travaux, déménagement ou avant état des lieux.",
    price: "dès 250 €",
    badge: "Crédit d'impôt 50 %",
  },
  {
    icon: Wind,
    title: "Nettoyage de vitres",
    desc: "Vitres, baies et miroirs impeccables, sans traces, intérieur et extérieur.",
    price: "dès 90 €",
    badge: "Crédit d'impôt 50 %",
  },
  {
    icon: Sofa,
    title: "Canapé & fauteuil",
    desc: "Nettoyage et désincrustation de vos canapés, fauteuils et textiles.",
    price: "dès 60 €",
    badge: "Crédit d'impôt 50 %",
  },
  {
    icon: Trees,
    title: "Terrasse & extérieur",
    desc: "Nettoyage et dégraissage de vos terrasses et sols extérieurs.",
    price: "dès 90 €",
    badge: "Crédit d'impôt 50 %",
  },
  {
    icon: Building2,
    title: "Nettoyage de bureaux",
    desc: "Entretien régulier de vos bureaux, commerces et locaux professionnels.",
    price: "dès 90 €",
    badge: "Sur devis",
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-sm font-medium text-accent">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            Nos prestations
          </span>
          <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Un seul prestataire pour tout nettoyer
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Ménage, remise en état, vitres, nuisibles, bureaux : tous vos besoins à Nîmes, avec un seul interlocuteur.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <article
                key={service.title}
                className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-accent">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    {service.badge}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-foreground">{service.title}</h3>
                <p className="mt-2 flex-1 text-pretty leading-relaxed text-muted-foreground">{service.desc}</p>
                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <span className="font-bold text-accent">{service.price}</span>
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-foreground transition-colors group-hover:text-accent"
                  >
                    Voir
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </article>
            )
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Button asChild size="lg" variant="outline" className="bg-transparent">
            <a href="#contact">Voir toutes nos prestations</a>
          </Button>
        </div>
      </div>
    </section>
  )
}
