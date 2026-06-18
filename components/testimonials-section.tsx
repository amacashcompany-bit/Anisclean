import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const testimonials = [
  {
    quote:
      "Très professionnelle et minutieuse. Ma maison n'a jamais été aussi propre, et le crédit d'impôt rend le service vraiment accessible.",
    name: "Nadia B.",
    role: "Nîmes",
  },
  {
    quote:
      "Intervention de remise en état après nos travaux : impeccable et rapide. Je recommande sans hésiter.",
    name: "Julien M.",
    role: "Caissargues",
  },
  {
    quote:
      "Nous faisons appel à Roudjine Clean pour nos bureaux chaque semaine. Sérieux, ponctuel et soigné.",
    name: "Cabinet Lestra",
    role: "Nîmes",
  },
]

export function TestimonialsSection() {
  return (
    <section id="avis" className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-sm font-medium text-accent">
            Ils nous font confiance
          </span>
          <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Ce que disent nos clients
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="border-border bg-card">
              <CardContent className="flex h-full flex-col gap-4 pt-6">
                <div className="flex" aria-label="Note de 5 étoiles sur 5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="flex-1 text-pretty leading-relaxed text-foreground">
                  {`"${t.quote}"`}
                </blockquote>
                <div className="mt-2">
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Témoignages présentés à titre d&apos;exemple — à remplacer par de vrais avis clients (Google).
        </p>
      </div>
    </section>
  )
}
