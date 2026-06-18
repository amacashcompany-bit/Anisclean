"use client"

import Link from "next/link"
import { Sparkles, Phone, Mail, Clock, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { site } from "@/lib/site"
import { useI18n } from "@/components/providers/i18n-provider"

export function SiteFooter() {
  const { t } = useI18n()

  return (
    <footer id="contact" className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="mb-14 text-center">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight md:text-4xl">{t("contact.title")}</h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-primary-foreground/70">
            {t("contact.desc")}
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              render={<a href={site.whatsappHref} target="_blank" rel="noopener noreferrer" />}
              size="lg"
              variant="secondary"
              className="gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
            <Button
              render={<a href={site.phoneHref} />}
              size="lg"
              variant="outline"
              className="gap-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Phone className="h-4 w-4" />
              {site.phoneDisplay}
            </Button>
            <Button render={<Link href="/commande" />} size="lg" variant="secondary" className="gap-2">
              {t("nav.order")}
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
              <p className="mt-4 max-w-md leading-relaxed text-primary-foreground/70">{t("hero.desc")}</p>
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
                <span>{t("contact.hoursValue")}</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col justify-center gap-4 rounded-2xl bg-primary-foreground/5 p-6 ring-1 ring-primary-foreground/10 md:p-8">
            <h3 className="text-2xl font-bold">{t("order.title")}</h3>
            <p className="text-primary-foreground/70">{t("order.subtitle")}</p>
            <Button render={<Link href="/commande" />} size="lg" variant="secondary" className="mt-2 self-start">
              {t("nav.order")}
            </Button>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-primary-foreground/10 pt-6 text-center text-sm text-primary-foreground/60 sm:flex-row">
          <span>
            © {new Date().getFullYear()} {site.name}. {t("footer.rights")}
          </span>
          <span className="flex gap-4">
            <Link href="#" className="hover:underline">
              {t("footer.legal")}
            </Link>
            <Link href="#" className="hover:underline">
              {t("footer.privacy")}
            </Link>
          </span>
        </div>
      </div>
    </footer>
  )
}
