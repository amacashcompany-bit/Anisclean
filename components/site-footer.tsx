import { Sparkles, Phone, Mail, Clock, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { site } from "@/lib/site"

export function SiteFooter() {
  return (
    <footer id="contact" className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="mb-14 text-center">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight md:text-4xl">
            Prêt à retrouver un intérieur impeccable ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-primary-foreground/70">
            Devis gratuit et sans engagement. Réponse rapide par téléphone, WhatsApp ou e-mail.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                Discuter sur WhatsApp
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="gap-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <a href={site.phoneHref}>
                <Phone className="h-4 w-4" />
                {site.phoneDisplay}
              </a>
            </Button>
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <Sparkles className="h-5 w-5" />
                </span>
                <span className="text-xl font-bold uppercase tracking-tight">{site.name}</span>
              </div>
              <p className="mt-4 max-w-md leading-relaxed text-primary-foreground/70">
                Ménage à domicile, remise en état, vitres, textiles, terrasses et bureaux à Nîmes. Un seul prestataire
                pour tout nettoyer.
              </p>
            </div>

            <ul className="flex flex-col gap-4">
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-primary-foreground/70" />
                <a href={site.phoneHref} className="hover:underline">
                  {site.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-primary-foreground/70" />
                <a href={`mailto:${site.email}`} className="hover:underline">
                  {site.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 shrink-0 text-primary-foreground/70" />
                <span>Lun - Sam : 8h - 19h</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl bg-primary-foreground/5 p-6 ring-1 ring-primary-foreground/10 md:p-8">
            <h3 className="text-2xl font-bold">Demander un devis gratuit</h3>
            <p className="mt-2 text-primary-foreground/70">Laissez-nous un message, nous vous répondons sous 24h.</p>
            <form className="mt-6 flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-primary-foreground">
                  Nom
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Votre nom"
                  className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-primary-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="vous@exemple.fr"
                  className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message" className="text-primary-foreground">
                  Message
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="Décrivez votre besoin..."
                  className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50"
                />
              </div>
              <Button type="button" variant="secondary" size="lg" className="mt-2">
                Envoyer la demande
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t border-primary-foreground/10 pt-6 text-center text-sm text-primary-foreground/60">
          © {new Date().getFullYear()} {site.name}. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
