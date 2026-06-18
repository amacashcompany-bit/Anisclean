import { Home, Building2, HardHat, AppWindow } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const services = [
  {
    icon: Home,
    title: "Nettoyage Résidentiel",
    description:
      "Un foyer impeccable du sol au plafond. Entretien régulier ou ponctuel adapté à votre rythme de vie.",
  },
  {
    icon: Building2,
    title: "Nettoyage Commercial",
    description:
      "Bureaux, commerces et locaux professionnels nettoyés avec rigueur pour un environnement de travail sain.",
  },
  {
    icon: HardHat,
    title: "Nettoyage de Fin de Chantier",
    description:
      "Élimination des poussières et résidus après travaux pour livrer un espace parfaitement prêt à l'emploi.",
  },
  {
    icon: AppWindow,
    title: "Nettoyage de Vitres",
    description:
      "Des vitres éclatantes sans traces, à l'intérieur comme à l'extérieur, pour laisser entrer la lumière.",
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Nos Services de Nettoyage
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Des prestations sur mesure pour chaque besoin, réalisées par des professionnels équipés et formés.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card
              key={service.title}
              className="group border-border transition-all hover:-translate-y-1 hover:border-accent hover:shadow-lg"
            >
              <CardHeader>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <service.icon className="h-6 w-6" />
                </span>
                <CardTitle className="mt-4 text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
