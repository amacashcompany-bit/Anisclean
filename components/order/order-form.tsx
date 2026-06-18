"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/providers/i18n-provider"
import { useCart } from "@/components/order/cart-context"
import { InvoicePreviewDialog } from "@/components/order/invoice-preview-dialog"
import type { InvoiceData } from "@/components/order/invoice-document"

const empty = { name: "", phone: "", email: "", address: "", zip: "", city: "", notes: "" }

export function OrderForm() {
  const { t, lang } = useI18n()
  const { lines, totals, count } = useCart()

  const [form, setForm] = useState(empty)
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [open, setOpen] = useState(false)

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (count === 0) return setError(t("form.errEmpty"))
    if (!form.name.trim()) return setError(t("form.errName"))
    if (!form.phone.trim()) return setError(t("form.errPhone"))
    if (!consent) return setError(t("form.errConsent"))
    setError(null)

    const now = new Date()
    const locale = lang === "ar" ? "ar" : lang === "en" ? "en-US" : "fr-FR"
    const number = `RC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
      now.getDate(),
    ).padStart(2, "0")}-${String(Math.floor(Math.random() * 9000) + 1000)}`

    setInvoice({
      number,
      date: now.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" }),
      customer: { ...form },
      lines: lines.map((l) => ({ ...l })),
      totals: { ...totals },
    })
    setOpen(true)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-5 md:p-6">
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
          <Input id="zip" value={form.zip} onChange={set("zip")} placeholder="30000" inputMode="numeric" />
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

      <Button type="submit" size="lg" className="mt-5 w-full">
        {t("form.submit")}
      </Button>

      <InvoicePreviewDialog open={open} onOpenChange={setOpen} data={invoice} />
    </form>
  )
}
