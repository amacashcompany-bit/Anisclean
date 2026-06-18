"use client"

import { useState } from "react"
import { CreditCard, Send, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/providers/i18n-provider"
import { useCart } from "@/components/order/cart-context"
import { lineUnit, lineTotal } from "@/components/order/cart-context"
import { InvoicePreviewDialog } from "@/components/order/invoice-preview-dialog"
import { PaymentMethodDialog } from "@/components/order/payment-method-dialog"
import type { InvoiceData } from "@/components/order/invoice-document"
import { saveOrder } from "@/lib/db/admin-actions"

const empty = { name: "", phone: "", email: "", address: "", zip: "", city: "", notes: "" }

export function OrderForm() {
  const { t, lang } = useI18n()
  const { lines, totals, count } = useCart()

  const [form, setForm] = useState(empty)
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // invoice preview (after "send order")
  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [invoiceOpen, setInvoiceOpen] = useState(false)

  // payment dialog (after "pay now")
  const [payInvoiceData, setPayInvoiceData] = useState<InvoiceData | null>(null)
  const [payOpen, setPayOpen] = useState(false)

  const [sending, setSending] = useState(false)

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  function buildInvoiceData(): InvoiceData {
    const now = new Date()
    const locale = lang === "ar" ? "ar" : lang === "en" ? "en-US" : "fr-FR"
    const number = `ZC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
      now.getDate(),
    ).padStart(2, "0")}-${String(Math.floor(Math.random() * 9000) + 1000)}`

    return {
      number,
      date: now.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" }),
      customer: { ...form },
      lines: lines.map((l) => ({ ...l })),
      totals: { ...totals },
    }
  }

  function validate() {
    if (count === 0) { setError(t("form.errEmpty")); return false }
    if (!form.name.trim()) { setError(t("form.errName")); return false }
    if (!form.phone.trim()) { setError(t("form.errPhone")); return false }
    if (!consent) { setError(t("form.errConsent")); return false }
    setError(null)
    return true
  }

  /** "Envoyer la commande" — saves to DB immediately, shows invoice */
  async function handleSendOrder(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSending(true)
    const data = buildInvoiceData()
    try {
      await saveOrder({
        reference: data.number,
        name: form.name,
        phone: form.phone,
        email: form.email,
        address: form.address,
        postalCode: form.zip,
        city: form.city,
        notes: form.notes,
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
      })
    } catch {
      // non-blocking — show invoice even if DB fails
    } finally {
      setSending(false)
    }
    setInvoice(data)
    setInvoiceOpen(true)
  }

  /** "Payer maintenant" — opens payment dialog, saves to DB on payment completion */
  function handlePayNow(e: React.MouseEvent) {
    e.preventDefault()
    if (!validate()) return
    setPayInvoiceData(buildInvoiceData())
    setPayOpen(true)
  }

  /** Called by PaymentMethodDialog when payment + save succeed */
  function handlePaySuccess(inv: InvoiceData) {
    setInvoice(inv)
    setInvoiceOpen(true)
  }

  return (
    <>
      <form onSubmit={handleSendOrder} className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <h2 className="text-lg font-bold text-foreground">{t("form.title")}</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="name">
              {t("form.name")} <span className="text-destructive">*</span>
            </Label>
            <Input id="name" value={form.name} onChange={set("name")} placeholder={t("form.namePh")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">
              {t("form.phone")} <span className="text-destructive">*</span>
            </Label>
            <Input id="phone" value={form.phone} onChange={set("phone")} placeholder={t("form.phonePh")} inputMode="tel" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">{t("form.email")}</Label>
            <Input id="email" type="email" value={form.email} onChange={set("email")} placeholder={t("form.emailPh")} />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="address">{t("form.address")}</Label>
            <Input id="address" value={form.address} onChange={set("address")} placeholder={t("form.addressPh")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="zip">{t("form.zip")}</Label>
            <Input id="zip" value={form.zip} onChange={set("zip")} placeholder="21000" inputMode="numeric" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">{t("form.city")}</Label>
            <Input id="city" value={form.city} onChange={set("city")} placeholder={t("form.cityPh")} />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="notes">{t("form.notes")}</Label>
            <Textarea id="notes" rows={3} value={form.notes} onChange={set("notes")} placeholder={t("form.notesPh")} />
          </div>
        </div>

        <label className="mt-4 flex items-start gap-2.5 text-sm leading-relaxed text-foreground">
          <Checkbox checked={consent} onCheckedChange={(v) => setConsent(Boolean(v))} className="mt-0.5" />
          <span>
            {t("form.consent")} <span className="text-destructive">*</span>
          </span>
        </label>

        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
            {error}
          </p>
        )}

        {/* Two action buttons */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="w-full gap-2"
            onClick={handlePayNow}
            disabled={sending}
          >
            <CreditCard className="size-4" />
            {t("pay.payNowBtn")}
          </Button>
          <Button
            type="submit"
            size="lg"
            className="w-full gap-2"
            disabled={sending}
          >
            {sending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            {sending ? t("pay.sending") : t("pay.sendOrderBtn")}
          </Button>
        </div>

        <p className="mt-3 text-center text-xs text-muted-foreground">{t("pay.hint")}</p>
      </form>

      {/* Invoice dialog — shown after "Send order" or after payment */}
      <InvoicePreviewDialog open={invoiceOpen} onOpenChange={setInvoiceOpen} data={invoice} />

      {/* Payment dialog — shown after "Pay now" */}
      {payInvoiceData && (
        <PaymentMethodDialog
          open={payOpen}
          onOpenChange={setPayOpen}
          invoiceData={payInvoiceData}
          lines={lines}
          totals={totals}
          lang={lang}
          onSuccess={handlePaySuccess}
        />
      )}
    </>
  )
}
