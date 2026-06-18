"use client"

import { useState } from "react"
import { CreditCard, Building2, Smartphone, ChevronRight, Lock, Check, ArrowLeft, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/components/providers/i18n-provider"
import type { InvoiceData } from "@/components/order/invoice-document"
import type { CartLine, CartTotals } from "@/components/order/cart-context"
import { lineUnit, lineTotal } from "@/components/order/cart-context"
import { saveOrder } from "@/lib/db/admin-actions"

type Method = "card" | "transfer" | "paypal"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  invoiceData: Omit<InvoiceData, "number" | "date"> & { number: string; date: string }
  lines: CartLine[]
  totals: CartTotals
  lang: string
  onSuccess: (invoice: InvoiceData) => void
}

const METHODS: { id: Method; icon: React.ReactNode; labelKey: string; descKey: string }[] = [
  {
    id: "card",
    icon: <CreditCard className="size-5" />,
    labelKey: "pay.methodCard",
    descKey: "pay.methodCardDesc",
  },
  {
    id: "transfer",
    icon: <Building2 className="size-5" />,
    labelKey: "pay.methodTransfer",
    descKey: "pay.methodTransferDesc",
  },
  {
    id: "paypal",
    icon: <Smartphone className="size-5" />,
    labelKey: "pay.methodPaypal",
    descKey: "pay.methodPaypalDesc",
  },
]

const emptyCard = { number: "", name: "", expiry: "", cvv: "" }

function formatCardNumber(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim()
}

function formatExpiry(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 4)
  if (digits.length >= 3) return `${digits.slice(0, 2)} / ${digits.slice(2)}`
  return digits
}

export function PaymentMethodDialog({ open, onOpenChange, invoiceData, lines, totals, lang, onSuccess }: Props) {
  const { t } = useI18n()
  const [step, setStep] = useState<"pick" | "card" | "transfer" | "paypal" | "processing">("pick")
  const [selected, setSelected] = useState<Method | null>(null)
  const [card, setCard] = useState(emptyCard)
  const [cardError, setCardError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleClose(v: boolean) {
    if (!loading) {
      onOpenChange(v)
      if (!v) {
        setStep("pick")
        setSelected(null)
        setCard(emptyCard)
        setCardError(null)
      }
    }
  }

  function handleSelectMethod(method: Method) {
    setSelected(method)
    setStep(method)
  }

  async function finaliseOrder(method: Method) {
    setLoading(true)
    setStep("processing")
    try {
      await saveOrder({
        reference: invoiceData.number,
        name: invoiceData.customer.name,
        phone: invoiceData.customer.phone,
        email: invoiceData.customer.email,
        address: invoiceData.customer.address,
        postalCode: invoiceData.customer.zip,
        city: invoiceData.customer.city,
        notes: invoiceData.customer.notes,
        items: lines.map((l) => ({
          serviceId: l.serviceId,
          serviceLabel: l.nameKey,
          optionLabel: l.descLabel ?? l.descKey ?? "",
          detail: "",
          qty: l.qty,
          unitPrice: lineUnit(l),
          amount: lineTotal(l),
        })),
        subtotal: totals.subtotal,
        taxCredit: totals.taxCredit,
        total: totals.net,
        lang,
        paymentMethod: method,
      })
      onSuccess(invoiceData)
      handleClose(false)
    } catch {
      setStep(method)
    } finally {
      setLoading(false)
    }
  }

  function handleCardSubmit(e: React.FormEvent) {
    e.preventDefault()
    const digits = card.number.replace(/\s/g, "")
    if (digits.length < 16) return setCardError(t("pay.errCardNumber"))
    if (!card.name.trim()) return setCardError(t("pay.errCardName"))
    const exp = card.expiry.replace(/\s/g, "")
    if (exp.length < 5) return setCardError(t("pay.errCardExpiry"))
    if (card.cvv.length < 3) return setCardError(t("pay.errCardCvv"))
    setCardError(null)
    finaliseOrder("card")
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Lock className="size-4 text-accent" />
            {t("pay.title")}
          </DialogTitle>
        </DialogHeader>

        {/* Order summary strip */}
        <div className="rounded-xl border border-border bg-muted/40 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("order.totalNet")}</span>
            <span className="text-xl font-extrabold text-foreground">{totals.net} €</span>
          </div>
          {totals.taxCredit > 0 && (
            <p className="mt-1 text-xs text-accent">
              {t("pay.creditNote")} {totals.taxCredit} €
            </p>
          )}
        </div>

        {/* STEP: pick method */}
        {step === "pick" && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">{t("pay.chooseMethod")}</p>
            {METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSelectMethod(m.id)}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-accent hover:bg-accent/5"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  {m.icon}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{t(m.labelKey)}</p>
                  <p className="text-xs text-muted-foreground">{t(m.descKey)}</p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}

        {/* STEP: card */}
        {step === "card" && (
          <form onSubmit={handleCardSubmit} className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setStep("pick")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" /> {t("pay.back")}
            </button>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="cn">{t("pay.cardNumber")}</Label>
                <Input
                  id="cn"
                  placeholder="1234 5678 9012 3456"
                  value={card.number}
                  inputMode="numeric"
                  onChange={(e) => setCard((c) => ({ ...c, number: formatCardNumber(e.target.value) }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="cname">{t("pay.cardName")}</Label>
                <Input
                  id="cname"
                  placeholder={t("pay.cardNamePh")}
                  value={card.name}
                  onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="exp">{t("pay.expiry")}</Label>
                  <Input
                    id="exp"
                    placeholder="MM / AA"
                    value={card.expiry}
                    inputMode="numeric"
                    onChange={(e) => setCard((c) => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    inputMode="numeric"
                    maxLength={4}
                    value={card.cvv}
                    onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                  />
                </div>
              </div>
            </div>
            {cardError && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{cardError}</p>
            )}
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="size-3" /> {t("pay.secure")}
            </p>
            <Button type="submit" size="lg" className="w-full">
              {t("pay.payNow")} · {totals.net} €
            </Button>
          </form>
        )}

        {/* STEP: bank transfer */}
        {step === "transfer" && (
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setStep("pick")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" /> {t("pay.back")}
            </button>
            <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm space-y-2">
              <p className="font-semibold text-foreground">{t("pay.transferDetails")}</p>
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-muted-foreground">
                <span className="font-medium text-foreground">IBAN</span>
                <span>FR76 3000 4028 3700 0100 0787 943</span>
                <span className="font-medium text-foreground">BIC</span>
                <span>BNPAFRPPXXX</span>
                <span className="font-medium text-foreground">{t("pay.transferRef")}</span>
                <span className="font-mono text-accent">{invoiceData.number}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{t("pay.transferNote")}</p>
            <Button size="lg" className="w-full" onClick={() => finaliseOrder("transfer")}>
              <Check className="size-4 mr-2" />
              {t("pay.confirmTransfer")}
            </Button>
          </div>
        )}

        {/* STEP: paypal */}
        {step === "paypal" && (
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setStep("pick")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" /> {t("pay.back")}
            </button>
            <div className="rounded-xl border border-border bg-muted/40 p-4 text-center text-sm space-y-2">
              <p className="text-2xl font-bold" style={{ color: "#003087" }}>Pay<span style={{ color: "#009cde" }}>Pal</span></p>
              <p className="text-muted-foreground">{t("pay.paypalDesc")}</p>
              <p className="font-semibold text-foreground">{invoiceData.customer.email || t("pay.paypalEmail")}</p>
            </div>
            <Button size="lg" className="w-full" onClick={() => finaliseOrder("paypal")}>
              {t("pay.payNow")} · {totals.net} €
            </Button>
          </div>
        )}

        {/* STEP: processing */}
        {step === "processing" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <Loader2 className="size-10 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">{t("pay.processing")}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
