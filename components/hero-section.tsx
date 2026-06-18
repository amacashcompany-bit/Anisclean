import Image from "next/image"
import { Phone, Sparkles, Star, BadgePercent } from "lucide-react"
import { Button } from "@/components/ui/button"
import { site } from "@/lib/site"

export function HeroSection() {
  return (
    <section id="accueil" className="relative overflow-hidden bg-secondary/40">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-sm font-medium text-muted-foreground">
            <Sparkles className="h-4 w-4 text-accent" />
            Entreprise de nettoyage à Nîmes
          </span>

          <h1 className="text-pretty text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Un intérieur impeccable, <span className="text-accent">à partir de 15 €/h</span>
          </h1>

          <p className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Ménage à domicile avec crédit d&apos;impôt de 50 %, nettoyage de locaux, remise en état et traitement des
            nuisibles à Nîmes. On s&apos;occupe de tout.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href="#contact">Demander un devis gratuit</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent">
              <a href={site.phoneHref} className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {site.phoneDisplay}
              </a>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
            <div className="flex items-center gap-2">
              <div className="flex" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">Clients satisfaits à Nîmes</span>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
              <BadgePercent className="h-4 w-4" />
              −50 % crédit d&apos;impôt
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-border shadow-xl">
            <Image
              src="/hero-cleaning.png"
              alt="Salon moderne lumineux et impeccablement nettoyé par Roudjine Clean"
              width={720}
              height={560}
              priority
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-border bg-background p-4 shadow-lg sm:block">
            <p className="text-2xl font-extrabold text-foreground">
              15 €<span className="text-sm font-medium text-muted-foreground"> /h après crédit d&apos;impôt</span>
            </p>
            <p className="text-sm text-muted-foreground line-through">30 €/h</p>
          </div>
        </div>
      </div>
    </section>
  )
}
