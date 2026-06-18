"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import {
  CreditCard,
  Building2,
  ChevronRight,
  Lock,
  Check,
  ArrowLeft,
  Loader2,
  ExternalLink,
  Smartphone,
  Link2,
  Copy,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/providers/i18n-provider"
import type { InvoiceData } from "@/components/order/invoice-document"
import type { CartLine, CartTotals } from "@/components/order/cart-context"
import { lineUnit, lineTotal } from "@/components/order/cart-context"
import { saveOrder } from "@/lib/db/admin-actions"
import { PAYMENT_CONFIG } from "@/lib/payment-config"

// ─── Types ────────────────────────────────────────────────────────────────────

type Method = "card" | "paypal" | "wero" | "link" | "transfer"
type Step = "pick" | Method | "processing"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  invoiceData: Omit<InvoiceData, "number" | "date"> & { number: string; date: string }
  lines: CartLine[]
  totals: CartTotals
  lang: string
  onSuccess: (invoice: InvoiceData) => void
}

// ─── Method list ──────────────────────────────────────────────────────────────

const METHODS: { id: Method; labelKey: string; descKey: string; icon: React.ReactNode }[] = [
  {
    id: "card",
    labelKey: "pay.methodCard",
    descKey: "pay.methodCardDesc",
    icon: <CreditCard className="size-5" />,
  },
  {
    id: "paypal",
    labelKey: "pay.methodPaypal",
    descKey: "pay.methodPaypalDesc",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
        <path d="M7.5 21.75H4.125l.75-4.5H7.5a4.5 4.5 0 0 0 4.5-4.5v-.375A4.125 4.125 0 0 0 7.875 8.25H4.5L6 2.25h5.625c3.728 0 6.375 2.85 6 6.375C17.25 12.375 14.25 15.75 10.5 16.5H7.875L7.5 21.75Z" fill="#009cde" />
        <path d="M11.25 18H7.875L8.25 15h3a3 3 0 0 0 3-3v-.375A2.625 2.625 0 0 0 11.625 9H9L10.5 3h4.125c3.375 0 5.625 2.625 5.25 5.625C19.5 12 17.25 14.625 14.25 15.375H11.625L11.25 18Z" fill="#003087" />
      </svg>
    ),
  },
  {
    id: "wero",
    labelKey: "pay.methodWero",
    descKey: "pay.methodWeroDesc",
    icon: (
      <svg viewBox="0 0 40 40" className="size-5" aria-hidden>
        <circle cx="20" cy="20" r="20" fill="#6C2BD9" />
        <text x="50%" y="57%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="sans-serif">W</text>
      </svg>
    ),
  },
  {
    id: "link",
    labelKey: "pay.methodLink",
    descKey: "pay.methodLinkDesc",
    icon: <Link2 className="size-5" />,
  },
  {
    id: "transfer",
    labelKey: "pay.methodTransfer",
    descKey: "pay.methodTransferDesc",
    icon: <Building2 className="size-5" />,
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function PaymentMethodDialog({
  open,
  onOpenChange,
  invoiceData,
  lines,
  totals,
  lang,
  onSuccess,
}: Props) {
  const { t } = useI18n()
  const [step, setStep] = useState<Step>("pick")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const ref = invoiceData.number
  const amount = totals.net

  // ── Helpers ────────────────────────────────────────────────────────────────

  function reset() {
    setStep("pick")
    setLoading(false)
    setCopied(null)
  }

  function handleClose(v: boolean) {
    if (!loading) {
      onOpenChange(v)
      if (!v) reset()
    }
  }

  async function persistOrder(method: Method) {
    setLoading(true)
    setStep("processing")
    try {
      await saveOrder({
        reference: ref,
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
    } catch {
      // non-blocking — still show invoice
    } finally {
      setLoading(false)
    }
    onSuccess(invoiceData)
    handleClose(false)
  }

  function handleRedirectAndSave(url: string | null, method: Method) {
    if (url) window.open(url, "_blank", "noopener,noreferrer")
    persistOrder(method)
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  // ── URL builders ──────────────────────────────────────────────────────────

  function paypalUrl(): string | null {
    const u = PAYMENT_CONFIG.paypalUsername
    if (!u || u === "REPLACE_ME") return null
    return `https://www.paypal.com/paypalme/${u}/${amount}EUR`
  }

  function weroUrl(): string | null {
    const p = PAYMENT_CONFIG.weroPhone
    if (!p) return null
    return `https://wero.app/send?phone=${encodeURIComponent(p)}&amount=${amount}&message=${encodeURIComponent(ref)}&currency=EUR`
  }

  function stripeUrl(): string | null {
    const base = PAYMENT_CONFIG.stripeLinkUrl
    if (!base || base.includes("REPLACE_ME")) return null
    return `${base}?client_reference_id=${encodeURIComponent(ref)}`
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Lock className="size-4 text-accent" />
            {t("pay.title")}
          </DialogTitle>
        </DialogHeader>

        {/* Order summary strip */}
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("order.totalNet")}</span>
            <span className="text-xl font-extrabold text-foreground">{amount} €</span>
          </div>
          {totals.taxCredit > 0 && (
            <p className="mt-0.5 text-xs text-accent">{t("pay.creditNote")} {totals.taxCredit} €</p>
          )}
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">{ref}</p>
        </div>

        {/* ── PICK ────────────────────────────────────────────────────── */}
        {step === "pick" && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">{t("pay.chooseMethod")}</p>
            {METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setStep(m.id)}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-accent hover:bg-accent/5 active:scale-[0.99]"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  {m.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{t(m.labelKey)}</p>
                  <p className="text-xs text-muted-foreground">{t(m.descKey)}</p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}

        {/* ── CARD ────────────────────────────────────────────────────── */}
        {step === "card" && (
          <div className="flex flex-col gap-4">
            <BackBtn label={t("pay.back")} onClick={() => setStep("pick")} />
            <div className="rounded-xl border border-border bg-muted/40 p-5 flex flex-col items-center gap-3 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-accent/10">
                <CreditCard className="size-7 text-accent" />
              </span>
              <div>
                <p className="font-semibold text-foreground">{t("pay.methodCard")}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{t("pay.cardRedirectDesc")}</p>
              </div>
              <AmountBadge amount={amount} ref_={ref} />
              <SecureBadge label={t("pay.secure")} />
            </div>
            <Button size="lg" className="w-full gap-2" onClick={() => handleRedirectAndSave(stripeUrl(), "card")}>
              <ExternalLink className="size-4" />
              {t("pay.payNow")} · {amount} €
            </Button>
            {!stripeUrl() && <NotConfigured label={t("pay.notConfigured")} />}
          </div>
        )}

        {/* ── PAYPAL ──────────────────────────────────────────────────── */}
        {step === "paypal" && (
          <div className="flex flex-col gap-4">
            <BackBtn label={t("pay.back")} onClick={() => setStep("pick")} />
            <div className="rounded-xl border border-border bg-muted/40 p-5 flex flex-col items-center gap-3 text-center">
              {/* Official PayPal wordmark via SVG */}
              <svg viewBox="0 0 100 28" className="h-9" aria-label="PayPal">
                <text x="0" y="22" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="24">
                  <tspan fill="#003087">Pay</tspan><tspan fill="#009cde">Pal</tspan>
                </text>
              </svg>
              <p className="text-sm text-muted-foreground">{t("pay.paypalRedirectDesc")}</p>
              <AmountBadge amount={amount} ref_={ref} />
            </div>
            <Button
              size="lg"
              className="w-full gap-2 text-white"
              style={{ background: "#0070ba" }}
              onClick={() => handleRedirectAndSave(paypalUrl(), "paypal")}
            >
              <ExternalLink className="size-4" />
              {t("pay.payNow")} · {amount} €
            </Button>
            {!paypalUrl() && <NotConfigured label={t("pay.notConfigured")} />}
          </div>
        )}

        {/* ── WERO ─────────────────────────────────────────────────────── */}
        {step === "wero" && (
          <div className="flex flex-col gap-4">
            <BackBtn label={t("pay.back")} onClick={() => setStep("pick")} />
            <div className="rounded-xl border border-border bg-muted/40 p-5 flex flex-col items-center gap-4 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl" style={{ background: "#6C2BD9" }}>
                <svg viewBox="0 0 40 40" className="size-8" aria-hidden>
                  <text x="50%" y="57%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold" fontFamily="sans-serif">W</text>
                </svg>
              </span>
              <div>
                <p className="font-semibold text-foreground">{t("pay.methodWero")}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{t("pay.weroDesc")}</p>
              </div>
              {/* QR code so mobile users can scan it from another device */}
              {weroUrl() && (
                <div className="rounded-xl border border-border bg-white p-3">
                  <QRCodeSVG value={weroUrl()!} size={160} level="M" includeMargin={false} />
                  <p className="mt-2 text-xs text-muted-foreground">{t("pay.weroScanQr")}</p>
                </div>
              )}
              {/* Copyable reference */}
              <div className="w-full flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm">
                <span className="text-muted-foreground">{t("pay.transferRef")}</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-accent">{ref}</span>
                  <CopyBtn text={ref} id="ref" copied={copied} onCopy={copyText} />
                </div>
              </div>
            </div>
            <Button
              size="lg"
              className="w-full gap-2 text-white"
              style={{ background: "#6C2BD9" }}
              onClick={() => handleRedirectAndSave(weroUrl(), "wero")}
            >
              <Smartphone className="size-4" />
              {t("pay.weroOpenApp")} · {amount} €
            </Button>
            {!weroUrl() && <NotConfigured label={t("pay.notConfigured")} />}
          </div>
        )}

        {/* ── STRIPE LINK ──────────────────────────────────────────────── */}
        {step === "link" && (
          <div className="flex flex-col gap-4">
            <BackBtn label={t("pay.back")} onClick={() => setStep("pick")} />
            <div className="rounded-xl border border-border bg-muted/40 p-5 flex flex-col items-center gap-3 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-accent/10">
                <Link2 className="size-7 text-accent" />
              </span>
              <div>
                <p className="font-semibold text-foreground">{t("pay.methodLink")}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{t("pay.linkDesc")}</p>
              </div>
              <AmountBadge amount={amount} ref_={ref} />
              <SecureBadge label={t("pay.secure")} />
            </div>
            <Button size="lg" className="w-full gap-2" onClick={() => handleRedirectAndSave(stripeUrl(), "link")}>
              <ExternalLink className="size-4" />
              {t("pay.payNow")} · {amount} €
            </Button>
            {!stripeUrl() && <NotConfigured label={t("pay.notConfigured")} />}
          </div>
        )}

        {/* ── BANK TRANSFER ────────────────────────────────────────────── */}
        {step === "transfer" && (
          <div className="flex flex-col gap-4">
            <BackBtn label={t("pay.back")} onClick={() => setStep("pick")} />
            <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
              <p className="font-semibold text-sm text-foreground">{t("pay.transferDetails")}</p>
              <div className="space-y-1.5">
                {(
                [
                  { label: t("pay.transferBeneficiary"), value: PAYMENT_CONFIG.beneficiary, key: "ben", hi: false },
                  { label: "IBAN", value: PAYMENT_CONFIG.iban, key: "iban", hi: false },
                  { label: "BIC", value: PAYMENT_CONFIG.bic, key: "bic", hi: false },
                  { label: t("pay.transferBank"), value: PAYMENT_CONFIG.bankName, key: "bank", hi: false },
                  { label: t("pay.transferRef"), value: ref, key: "ref", hi: true },
                  { label: t("pay.transferAmount"), value: `${amount} €`, key: "amt", hi: true },
                ] as { label: string; value: string; key: string; hi: boolean }[]
              ).map((row) => (
                  <div key={row.key} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2">
                    <span className="text-xs text-muted-foreground shrink-0">{row.label}</span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`font-mono text-xs truncate ${row.hi ? "font-semibold text-accent" : "text-foreground"}`}>
                        {row.value}
                      </span>
                      <CopyBtn text={row.value} id={row.key} copied={copied} onCopy={copyText} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{t("pay.transferNote")}</p>
            <Button size="lg" className="w-full gap-2" onClick={() => persistOrder("transfer")}>
              <Check className="size-4" />
              {t("pay.confirmTransfer")}
            </Button>
          </div>
        )}

        {/* ── PROCESSING ───────────────────────────────────────────────── */}
        {step === "processing" && (
          <div className="flex flex-col items-center gap-4 py-10">
            <Loader2 className="size-10 animate-spin text-accent" />
            <p className="text-sm font-medium text-foreground">{t("pay.processing")}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Small shared sub-components ─────────────────────────────────────────────

function BackBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-3.5" /> {label}
    </button>
  )
}

function AmountBadge({ amount, ref_ }: { amount: number; ref_: string }) {
  return (
    <div className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm font-mono text-foreground">
      {amount} € — {ref_}
    </div>
  )
}

function SecureBadge({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Lock className="size-3" /> {label}
    </div>
  )
}

function CopyBtn({
  text,
  id,
  copied,
  onCopy,
}: {
  text: string
  id: string
  copied: string | null
  onCopy: (text: string, id: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onCopy(text, id)}
      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      title="Copier"
    >
      {copied === id ? <Check className="size-3.5 text-accent" /> : <Copy className="size-3.5" />}
    </button>
  )
}

function NotConfigured({ label }: { label: string }) {
  return (
    <p className="text-center text-xs text-muted-foreground">{label}</p>
  )
}
