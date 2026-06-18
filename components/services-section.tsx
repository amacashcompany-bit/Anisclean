"use client"

import { Brush, Hammer, Wind, Sofa, Trees, Building2, ArrowRight, Wrench } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/providers/i18n-provider"

const BUILTIN_ICONS: Record<string, React.ElementType> = {
  Brush, Hammer, Wind, Sofa, Trees, Building2, Wrench,
}

const BUILTIN_SERVICES = [
  { icon: "Brush", key: "menage", price: "30 €/h", badge: true },
  { icon: "Hammer", key: "remise", price: "250 €", badge: true },
  { icon: "Wind", key: "vitres", price: "90 €", badge: true },
  { icon: "Sofa", key: "canape", price: "60 €", badge: true },
  { icon: "Trees", key: "bureaux", price: "90 €", badge: false },
  { icon: "Building2", key: "nuisibles", price: "120 €", badge: true },
]

interface CustomService {
  id: string
  name: string
  description?: string | null
  icon: string
  imageUrl?: string | null
  fromLabel?: string | null
  hourlyRate?: number | null
  taxEligible: boolean
}

interface Props {
  customServices?: CustomService[]
}

export function ServicesSection({ customServices = [] }: Props) {
  const { t } = useI18n()

  return (
    <section id="services" className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-sm font-medium text-accent">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            {t("services.badge")}
          </span>
          <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {t("services.title")}
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">{t("services.desc")}</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Built-in services */}
          {BUILTIN_SERVICES.map((service) => {
            const Icon = BUILTIN_ICONS[service.icon] ?? Wrench
            return (
              <article
                key={service.key}
                className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-accent">
                    <Icon className="h-6 w-6" />
                  </span>
                  {service.badge && (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      {t("common.taxBadge")}
                    </span>
                  )}
                </div>
                <h3 className="mt-5 text-xl font-bold text-foreground">{t(`svc.${service.key}.name`)}</h3>
                <p className="mt-2 flex-1 text-pretty leading-relaxed text-muted-foreground">
                  {t(`svc.${service.key}.desc`)}
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <span className="font-bold text-accent">
                    {t("common.from")} {service.price}
                  </span>
                  <Link
                    href="/commande"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-foreground transition-colors group-hover:text-accent"
                  >
                    {t("nav.order")}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </Link>
                </div>
              </article>
            )
          })}

          {/* Custom services from DB */}
          {customServices.map((svc) => {
            const Icon = BUILTIN_ICONS[svc.icon] ?? Wrench
            const priceLabel = svc.fromLabel
              ? svc.fromLabel
              : svc.hourlyRate
              ? `${svc.hourlyRate} €/h`
              : null

            return (
              <article
                key={svc.id}
                className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg"
              >
                {/* Image or icon header */}
                {svc.imageUrl ? (
                  <div className="relative h-40 w-full overflow-hidden">
                    <Image
                      src={svc.imageUrl}
                      alt={svc.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {svc.taxEligible && (
                      <span className="absolute top-3 right-3 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        {t("common.taxBadge")}
                      </span>
                    )}
                  </div>
                ) : null}

                <div className={svc.imageUrl ? "p-6 flex flex-col flex-1" : "p-6 flex flex-col flex-1"}>
                  {!svc.imageUrl && (
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-accent">
                        <Icon className="h-6 w-6" />
                      </span>
                      {svc.taxEligible && (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          {t("common.taxBadge")}
                        </span>
                      )}
                    </div>
                  )}

                  <h3 className={`${svc.imageUrl ? "" : "mt-5"} text-xl font-bold text-foreground`}>
                    {svc.name}
                  </h3>
                  {svc.description && (
                    <p className="mt-2 flex-1 text-pretty leading-relaxed text-muted-foreground">
                      {svc.description}
                    </p>
                  )}

                  <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                    {priceLabel ? (
                      <span className="font-bold text-accent">
                        {t("common.from")} {priceLabel}
                      </span>
                    ) : (
                      <span />
                    )}
                    <Link
                      href="/commande"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-foreground transition-colors group-hover:text-accent"
                    >
                      {t("nav.order")}
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Button render={<Link href="/commande" />} size="lg">
            {t("nav.order")}
          </Button>
        </div>
      </div>
    </section>
  )
}
