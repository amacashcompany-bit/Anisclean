"use client"

import { useState } from "react"
import { Minus, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { ServiceDef } from "@/lib/services"
import { MATERIAL_SURCHARGE } from "@/lib/services"
import { useI18n } from "@/components/providers/i18n-provider"
import { useCart } from "@/components/order/cart-context"

export function ServiceBuilderCard({ service }: { service: ServiceDef }) {
  const { t } = useI18n()
  const Icon = service.icon
  const { addLine, has, removeLine } = useCart()

  const [hours, setHours] = useState(2)
  const [material, setMaterial] = useState(false)

  const hourlyKey = `${service.id}-hourly`
  const hourlyInCart = has(hourlyKey)
  const unit = material && service.hourly?.allowMaterial ? (service.hourly?.rate ?? 0) + MATERIAL_SURCHARGE : service.hourly?.rate ?? 0
  const hourlyTotal = unit * hours

  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-5 md:p-6">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-secondary text-accent">
          <Icon className="h-6 w-6" />
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-foreground">{t(service.nameKey)}</h3>
            {service.taxEligible && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                {t("common.taxBadge")}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t(service.descKey)}</p>
        </div>
      </div>

      {/* Hourly option */}
      {service.hourly && (
        <div className="mt-5 rounded-xl border border-accent/30 bg-accent/5 p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">{t(service.hourly.labelKey)}</span>
            <span className="rounded-full bg-background px-3 py-1 text-sm font-bold text-accent">
              {service.hourly.rate} €{t("common.perHour")}
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

          {service.hourly.allowMaterial && (
            <label className="mt-3 flex items-center gap-2 text-sm text-foreground">
              <Checkbox checked={material} onCheckedChange={(v) => setMaterial(Boolean(v))} />
              {t("order.material")}
            </label>
          )}

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
                  nameKey: service.nameKey,
                  descKey: service.hourly!.labelKey,
                  kind: "hourly",
                  baseRate: service.hourly!.rate,
                  material: material && Boolean(service.hourly!.allowMaterial),
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
      {service.packages && (
        <div className="mt-5">
          <p className="mb-3 text-sm font-semibold text-foreground">{t(service.packagesTitleKey ?? "")}</p>
          <div className="flex flex-col gap-2.5">
            {service.packages.map((pkg) => {
              const inCart = has(pkg.id)
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
                        ? removeLine(pkg.id)
                        : addLine({
                            key: pkg.id,
                            serviceId: service.id,
                            nameKey: service.nameKey,
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
    </article>
  )
}
