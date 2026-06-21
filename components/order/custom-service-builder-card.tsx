"use client"

import { useState } from "react"
import { Minus, Plus, Check, Wrench, Brush, Hammer, Wind, Sofa, Trees, Building2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/providers/i18n-provider"
import { useCart } from "@/components/order/cart-context"

const ICONS: Record<string, React.ElementType> = {
  Brush, Hammer, Wind, Sofa, Trees, Building2, Wrench,
}

interface CustomServiceDef {
  id: string
  name: string
  description?: string | null
  icon: string
  imageUrl?: string | null
  hourlyRate?: number | null
  packages?: { id: string; label: string; price: number }[] | null
  packagesTitle?: string | null
  fromLabel?: string | null
  taxEligible: boolean
}

export function CustomServiceBuilderCard({ service }: { service: CustomServiceDef }) {
  const { t } = useI18n()
  const { addLine, removeLine, has } = useCart()
  const Icon = ICONS[service.icon] ?? Wrench

  const [hours, setHours] = useState(2)
  const hourlyKey = `custom-${service.id}-hourly`
  const hourlyInCart = has(hourlyKey)
  const hourlyRate = service.hourlyRate ?? 0
  const hourlyTotal = hourlyRate * hours

  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden">
      {/* Image header */}
      {service.imageUrl && (
        <div className="relative h-40 w-full overflow-hidden">
          <Image src={service.imageUrl} alt={service.name} fill className="object-cover" />
        </div>
      )}

      <div className="p-5 md:p-6 flex flex-col flex-1">
        <div className="flex items-start gap-4">
          {!service.imageUrl && (
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-secondary text-accent">
              <Icon className="h-6 w-6" />
            </span>
          )}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">{service.name}</h3>
              {service.taxEligible && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                  {t("common.taxBadge")}
                </span>
              )}
            </div>
            {service.description && (
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
            )}
          </div>
        </div>

        {/* Hourly option */}
        {hourlyRate > 0 && (
          <div className="mt-5 rounded-xl border border-accent/30 bg-accent/5 p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{t("lbl.hourly")}</span>
              <span className="rounded-full bg-background px-3 py-1 text-sm font-bold text-accent">
                {hourlyRate} €{t("common.perHour")}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">{t("order.hours")}</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-full border border-border bg-background">
                  <button
                    type="button"
                    onClick={() => setHours((h) => Math.max(1, h - 1))}
                    className="flex h-9 w-9 items-center justify-center text-foreground"
                    aria-label="-1"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-foreground">{hours}</span>
                  <button
                    type="button"
                    onClick={() => setHours((h) => h + 1)}
                    className="flex h-9 w-9 items-center justify-center text-foreground"
                    aria-label="+1"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="min-w-16 text-end text-lg font-extrabold text-foreground">{hourlyTotal} €</span>
              </div>
            </div>

            {hourlyInCart ? (
              <Button variant="outline" className="mt-4 w-full bg-transparent" onClick={() => removeLine(hourlyKey)}>
                <Check className="h-4 w-4" /> {t("order.added")}
              </Button>
            ) : (
              <Button
                className="mt-4 w-full"
                onClick={() =>
                  addLine({
                    key: hourlyKey,
                    serviceId: service.id,
                    nameKey: service.name,
                    descKey: "lbl.hourly",
                    kind: "hourly",
                    baseRate: hourlyRate,
                    material: false,
                    qty: hours,
                    taxEligible: service.taxEligible,
                  })
                }
              >
                <Plus className="h-4 w-4" /> {t("order.add")}
              </Button>
            )}
          </div>
        )}

        {/* Fixed packages */}
        {service.packages && service.packages.length > 0 && (
          <div className="mt-5">
            {service.packagesTitle && (
              <p className="mb-3 text-sm font-semibold text-foreground">{service.packagesTitle}</p>
            )}
            <div className="flex flex-col gap-2.5">
              {service.packages.map((pkg) => {
                const pkgKey = `custom-${service.id}-${pkg.id}`
                const inCart = has(pkgKey)
                return (
                  <div
                    key={pkg.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{pkg.label}</p>
                      <p className="text-sm text-muted-foreground">{pkg.price} €</p>
                    </div>
                    <button
                      type="button"
                      aria-label={inCart ? t("order.remove") : t("order.add")}
                      onClick={() =>
                        inCart
                          ? removeLine(pkgKey)
                          : addLine({
                              key: pkgKey,
                              serviceId: service.id,
                              nameKey: service.name,
                              descLabel: pkg.label,
                              kind: "package",
                              baseRate: pkg.price,
                              material: false,
                              qty: 1,
                              taxEligible: service.taxEligible,
                            })
                      }
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                        inCart ? "bg-accent text-accent-foreground" : "bg-accent/10 text-accent hover:bg-accent/20"
                      }`}
                    >
                      {inCart ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Fallback if no pricing defined */}
        {!hourlyRate && (!service.packages || service.packages.length === 0) && (
          <div className="mt-5 rounded-xl border border-border bg-secondary/40 p-4 text-center text-sm text-muted-foreground">
            {t("form.contactForPrice")}
          </div>
        )}
      </div>
    </article>
  )
}
