import Image from "next/image"
import { Phone, ShieldCheck, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section id="accueil" className="relative overflow-hidden bg-secondary/40">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-sm font-medium text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-accent" />
            Service de nettoyage certifié et assuré
          </span>

          <h1 className="text-pretty text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Des espaces impeccables, un service de confiance.
          </h1>

          <p className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Sanadclean propose un nettoyage haut de gamme pour vos espaces résidentiels et commerciaux. Une équipe
            professionnelle, des résultats irréprochables, à chaque visite.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href="#contact">Réserver maintenant</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="tel:+33767029762" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Appeler le 07 67 02 97 62
              </a>
            </Button>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <div className="flex" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">Noté 5/5 par plus de 200 clients satisfaits</span>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-border shadow-xl">
            <Image
              src="/hero-cleaning.png"
              alt="Salon moderne lumineux et impeccablement nettoyé par Sanadclean"
              width={720}
              height={560}
              priority
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
