"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/providers/i18n-provider"
import { useCart, lineUnit, lineTotal } from "@/components/order/cart-context"

export function CartSummary({ onContinue }: { onContinue: () => void }) {
  const { t } = useI18n()
  const { lines, removeLine, totals, count } = useCart()

  return (
    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <h2 className="text-lg font-bold text-foreground">{t("order.summary")}</h2>

      {count === 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t("order.cartEmpty")}</p>
      ) : (
        <>
          <ul className="mt-4 flex flex-col divide-y divide-border">
            {lines.map((l) => (
              <li key={l.key} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{t(l.nameKey)}</p>
                  <p className="text-sm text-muted-foreground">
                    {l.descLabel ?? t(l.descKey ?? "")}
                    {l.kind === "hourly" && ` · ${l.qty} ${t("inv.hoursUnit")} × ${lineUnit(l)} €`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{lineTotal(l)} €</span>
                  <button
                    type="button"
                    onClick={() => removeLine(l.key)}
                    aria-label={t("order.remove")}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("order.subtotal")}</span>
              <span className="font-semibold text-foreground">{totals.subtotal} €</span>
            </div>
            <div className="flex justify-between text-accent">
              <span>{t("order.taxCredit")}</span>
              <span className="font-semibold">− {totals.taxCredit} €</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between border-t border-border pt-2">
              <span className="font-bold text-foreground">{t("order.totalNet")}</span>
              <span className="text-2xl font-extrabold text-foreground">{totals.net} €</span>
            </div>
          </div>

          <Button size="lg" className="mt-5 w-full" onClick={onContinue}>
            {t("order.continue")}
          </Button>
        </>
      )}
    </div>
  )
}
