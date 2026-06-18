import type { Metadata } from "next"
import Link from "next/link"
import { Phone, Mail, MapPin, Clock, MessageCircle, ArrowRight, CheckCircle } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { FloatingContact } from "@/components/floating-contact"
import { ContactForm } from "@/components/contact-form"
import { site } from "@/lib/site"

export const metadata: Metadata = {
  title: `Contact — ${site.name}`,
  description:
    "Contactez Sanad Clean pour un devis gratuit, une intervention ou toute question. Réponse rapide par téléphone, WhatsApp ou email.",
}

const contactItems = [
  {
    icon: Phone,
    label: "Téléphone",
    value: site.phoneDisplay,
    href: site.phoneHref,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Répondons en quelques minutes",
    href: site.whatsappHref,
    color: "text-green-600",
    bg: "bg-green-50",
    external: true,
  },
  {
    icon: Mail,
    label: "Email",
    value: site.email,
    href: `mailto:${site.email}`,
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: MapPin,
    label: "Adresse",
    value: "Dijon et alentours, 21000 France",
    href: "https://maps.google.com/?q=Dijon,+21000+France",
    color: "text-orange-600",
    bg: "bg-orange-50",
    external: true,
  },
  {
    icon: Clock,
    label: "Horaires",
    value: "Lun – Dim · Disponible 24h/24, 7j/7",
    href: null,
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
]

const guarantees = [
  "Devis gratuit sous 24 h",
  "Aucun engagement",
  "Réponse rapide garantie",
  "Intervention à Dijon et 30 km alentours",
]

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-background pt-16">
        {/* ── Hero banner ── */}
        <section className="bg-muted/50 border-b border-border/60">
          <div className="mx-auto max-w-6xl px-4 py-12 md:py-16 md:px-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5" aria-label="Fil d'Ariane">
              <Link href="/" className="hover:text-foreground transition-colors">Accueil</Link>
              <span>/</span>
              <span className="text-foreground font-medium">Contact</span>
            </nav>

            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground shadow-sm">
                <span className="size-1.5 rounded-full bg-accent animate-pulse" />
                Contact
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading tracking-tight text-foreground text-balance mb-4">
              Parlons de votre besoin
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl text-pretty leading-relaxed">
              Une question, une demande d&apos;intervention ? Écrivez-nous, appelez ou passez
              par WhatsApp — réponse rapide, devis gratuit.
            </p>

            {/* Guarantees */}
            <ul className="flex flex-wrap gap-x-6 gap-y-2 mt-6">
              {guarantees.map((g) => (
                <li key={g} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CheckCircle className="size-3.5 text-accent shrink-0" />
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Main content ── */}
        <section className="mx-auto max-w-6xl px-4 py-12 md:py-16 md:px-6">
          {/* Badge */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground shadow-sm">
              <span className="size-1.5 rounded-full bg-accent" />
              Contact
            </span>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight text-foreground text-balance mb-3">
              Demande d&apos;intervention
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-pretty">
              Décrivez votre besoin : prestation, zone et date souhaitée. Nous revenons vers
              vous rapidement avec une estimation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10 items-start">
            {/* ── Left: contact info ── */}
            <aside className="lg:col-span-2 flex flex-col gap-4">
              {/* Contact card */}
              <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4 shadow-sm">
                {contactItems.map((item) => {
                  const Icon = item.icon
                  const inner = (
                    <div className="flex items-start gap-3.5">
                      <div className={`flex items-center justify-center size-9 rounded-xl ${item.bg} shrink-0`}>
                        <Icon className={`size-4 ${item.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">
                          {item.label}
                        </p>
                        <p className="text-sm font-semibold text-foreground break-words">{item.value}</p>
                      </div>
                      {item.href && (
                        <ArrowRight className="size-3.5 text-muted-foreground ml-auto shrink-0 mt-1" />
                      )}
                    </div>
                  )
                  return item.href ? (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      className="rounded-xl p-3 hover:bg-muted transition-colors -mx-3"
                    >
                      {inner}
                    </a>
                  ) : (
                    <div key={item.label} className="rounded-xl p-3 -mx-3">
                      {inner}
                    </div>
                  )
                })}
              </div>

              {/* WhatsApp CTA */}
              <a
                href={site.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 rounded-2xl bg-green-600 hover:bg-green-700 transition-colors text-white px-5 py-4 shadow-md"
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="size-5 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Écrire sur WhatsApp</p>
                    <p className="text-xs text-white/80">Réponse en quelques minutes</p>
                  </div>
                </div>
                <ArrowRight className="size-4 shrink-0" />
              </a>

              {/* Phone CTA */}
              <a
                href={site.phoneHref}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card hover:bg-muted transition-colors px-5 py-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Phone className="size-5 text-primary shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-foreground">{site.phoneDisplay}</p>
                    <p className="text-xs text-muted-foreground">Appel direct</p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground shrink-0" />
              </a>
            </aside>

            {/* ── Right: form ── */}
            <div className="lg:col-span-3 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
              <ContactForm />
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6">
          <div className="rounded-3xl bg-primary text-primary-foreground px-6 py-12 md:px-12 text-center shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-balance mb-3">
              Un besoin particulier ou un grand chantier ?
            </h2>
            <p className="text-primary-foreground/75 max-w-md mx-auto mb-8 text-pretty">
              Contactez-nous pour un devis personnalisé, gratuit et sans engagement.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="#cf-name"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-foreground text-primary font-semibold px-6 py-3 text-sm hover:bg-primary-foreground/90 transition-colors"
              >
                Nous contacter
              </a>
              <a
                href={site.phoneHref}
                className="inline-flex items-center gap-2 rounded-xl border border-primary-foreground/30 bg-transparent text-primary-foreground font-semibold px-6 py-3 text-sm hover:bg-primary-foreground/10 transition-colors"
              >
                <Phone className="size-4" />
                {site.phoneDisplay}
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <FloatingContact />
    </>
  )
}
