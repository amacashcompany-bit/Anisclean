import { Sparkles, Phone, Mail, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function SiteFooter() {
  return (
    <footer id="contact" className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <Sparkles className="h-5 w-5" />
                </span>
                <span className="text-xl font-bold">Sanadclean</span>
              </div>
              <p className="mt-4 max-w-md leading-relaxed text-primary-foreground/70">
                Votre partenaire de confiance pour un nettoyage résidentiel et commercial de qualité supérieure.
              </p>
            </div>

            <ul className="flex flex-col gap-4">
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-primary-foreground/70" />
                <a href="tel:+33767029762" className="hover:underline">
                  07 67 02 97 62
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-primary-foreground/70" />
                <a href="mailto:contact@sanadclean.fr" className="hover:underline">
                  contact@sanadclean.fr
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 shrink-0 text-primary-foreground/70" />
                <span>Lun - Sam : 8h - 19h</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl bg-primary-foreground/5 p-6 ring-1 ring-primary-foreground/10 md:p-8">
            <h2 className="text-2xl font-bold">Demander un devis</h2>
            <p className="mt-2 text-primary-foreground/70">
              Laissez-nous un message, nous vous répondons sous 24h.
            </p>
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
          © {new Date().getFullYear()} Sanadclean. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
