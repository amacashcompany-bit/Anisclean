import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

const communes = [
  "Nîmes", "Caissargues", "Bouillargues", "Rodilhan", "Marguerittes", "Garons",
  "Saint-Gervasy", "Poulx", "Caveirac", "Clarensac", "Milhaud", "Bernis",
  "Manduel", "Saint-Gilles", "Uchaud", "Vergèze", "Générac", "Vauvert",
]

export function AreaSection() {
  return (
    <section id="zone" className="bg-secondary/40 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:px-6 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-sm font-medium text-accent">
            Zone d&apos;intervention
          </span>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            À Nîmes et dans tout le Gard rhodanien
          </h2>
          <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
            Nous intervenons à Nîmes et dans les communes voisines. Vérifiez votre secteur ou contactez-nous
            directement.
          </p>
          <Button asChild size="lg">
            <a href="#contact">Vérifier mon secteur</a>
          </Button>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {communes.map((commune) => (
            <span
              key={commune}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground"
            >
              <MapPin className="h-3.5 w-3.5 text-accent" />
              {commune}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
