import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const testimonials = [
  {
    quote:
      "Une équipe ponctuelle et méticuleuse. Mon appartement n'a jamais été aussi propre, je recommande sans hésiter !",
    name: "Sophie L.",
    role: "Cliente résidentielle",
  },
  {
    quote:
      "Nous faisons appel à Sanadclean pour nos bureaux chaque semaine. Service impeccable et personnel très professionnel.",
    name: "Marc D.",
    role: "Gérant d'entreprise",
  },
  {
    quote:
      "Nettoyage de fin de chantier parfait, ils ont tout pris en charge. Le résultat a dépassé mes attentes.",
    name: "Amélie R.",
    role: "Architecte d'intérieur",
  },
]

export function TestimonialsSection() {
  return (
    <section id="avis" className="bg-secondary/40 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Ce que disent nos clients
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            La satisfaction de nos clients est notre meilleure publicité.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="border-border bg-background">
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
      </div>
    </section>
  )
}
