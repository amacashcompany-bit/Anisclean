"use client"

import { forwardRef } from "react"
import type { CartLine, CartTotals } from "@/components/order/cart-context"
import { lineUnit, lineTotal } from "@/components/order/cart-context"
import { site } from "@/lib/site"
import type { Lang } from "@/lib/i18n/translations"

export interface InvoiceCustomer {
  name: string
  phone: string
  email: string
  address: string
  zip: string
  city: string
  notes: string
}

export interface InvoiceData {
  number: string
  date: string
  customer: InvoiceCustomer
  lines: CartLine[]
  totals: CartTotals
}

interface Props {
  data: InvoiceData
  lang: Lang
  dir: "rtl" | "ltr"
  t: (key: string) => string
}

const C = {
  ink: "#1e2a44",
  sub: "#5b6678",
  accent: "#1f74c4",
  line: "#e2e8f0",
  soft: "#f1f5f9",
  white: "#ffffff",
  amber: "#b45309",
}

/** Invoice rendered with inline hex styles so html2canvas captures it correctly (no oklch). */
export const InvoiceDocument = forwardRef<HTMLDivElement, Props>(function InvoiceDocument({ data, lang, dir, t }, ref) {
  const { customer, lines, totals } = data
  const localeName = (l: CartLine) => `${t(l.nameKey)}${l.descLabel ? ` — ${l.descLabel}` : l.descKey ? ` — ${t(l.descKey)}` : ""}`

  return (
    <div
      ref={ref}
      dir={dir}
      style={{
        width: 720,
        background: C.white,
        color: C.ink,
        fontFamily:
          lang === "ar"
            ? "var(--font-cairo), Inter, Arial, sans-serif"
            : "Inter, Arial, sans-serif",
        padding: 40,
        boxSizing: "border-box",
        textAlign: dir === "rtl" ? "right" : "left",
      }}
    >
      {/* Header with Zyncleen Branding */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, gap: 16 }}>
        {/* Left: Company Info */}
        <div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#0d2240", letterSpacing: -0.5 }}>
            zyn<span style={{ color: "#22d3ee" }}>cleen</span>
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.sub, marginTop: 3, letterSpacing: 0.5, textTransform: "uppercase" }}>
            Entreprise individuelle
          </div>
          <div style={{ fontSize: 11, color: C.sub, marginTop: 10, lineHeight: 1.6 }}>
            2 rue de pommard<br />
            21800 Dijon<br />
            FR
          </div>
        </div>

        {/* Right: Invoice Metadata */}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.sub, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Facture N°
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.ink, marginTop: 2 }}>{data.number}</div>
          
          <div style={{ fontSize: 12, fontWeight: 600, color: C.sub, marginTop: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Date d&apos;émission
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginTop: 2 }}>{data.date}</div>

          <div style={{ fontSize: 12, fontWeight: 600, color: C.sub, marginTop: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Règlement
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginTop: 2 }}>À réception</div>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, padding: "16px 0", marginBottom: 20 }} />

      {/* Bill To Section */}
      <div style={{ display: "flex", gap: 40, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Facturé à
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginTop: 8 }}>{customer.name}</div>
          {customer.address && (
            <div style={{ fontSize: 11, color: C.sub, marginTop: 4 }}>{customer.address}</div>
          )}
          {customer.zip && customer.city && (
            <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>
              {customer.zip} {customer.city}
            </div>
          )}
          {customer.phone && (
            <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>France</div>
          )}
        </div>
      </div>

      {/* Items Table - Matching PDF format */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 0, marginBottom: 20 }}>
        <thead>
          <tr style={{ borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
            <th style={{ padding: "10px 0", fontSize: 12, fontWeight: 700, textAlign: "left", color: C.sub, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Désignation
            </th>
            <th style={{ padding: "10px 0", fontSize: 12, fontWeight: 700, textAlign: "center", color: C.sub, textTransform: "uppercase", letterSpacing: 0.5, width: 60 }}>
              Quantité
            </th>
            <th style={{ padding: "10px 0", fontSize: 12, fontWeight: 700, textAlign: "center", color: C.sub, textTransform: "uppercase", letterSpacing: 0.5, width: 70 }}>
              Unité
            </th>
            <th style={{ padding: "10px 0", fontSize: 12, fontWeight: 700, textAlign: "center", color: C.sub, textTransform: "uppercase", letterSpacing: 0.5, width: 60 }}>
              TVA
            </th>
            <th style={{ padding: "10px 0", fontSize: 12, fontWeight: 700, textAlign: "right", color: C.sub, textTransform: "uppercase", letterSpacing: 0.5, width: 100 }}>
              Montant HT
            </th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l) => (
            <tr key={l.key} style={{ borderBottom: `1px solid ${C.line}` }}>
              <td style={{ padding: "12px 0", fontSize: 12, color: C.ink }}>{localeName(l)}</td>
              <td style={{ padding: "12px 0", fontSize: 12, textAlign: "center", color: C.ink }}>
                {l.qty.toFixed(2)}
              </td>
              <td style={{ padding: "12px 0", fontSize: 12, textAlign: "center", color: C.ink }}>
                {l.kind === "hourly" ? "h" : "forfait"}
              </td>
              <td style={{ padding: "12px 0", fontSize: 12, textAlign: "center", color: C.ink }}>
                0%
              </td>
              <td style={{ padding: "12px 0", fontSize: 12, textAlign: "right", color: C.ink, fontWeight: 600 }}>
                {lineTotal(l)} €
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Section - Matching PDF */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 32, marginTop: 24, marginBottom: 24 }}>
        <div style={{ width: 200 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
            <span style={{ fontWeight: 600, color: C.sub }}>Total HT</span>
            <span style={{ fontWeight: 700, color: C.ink }}>{totals.subtotal} €</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, paddingTop: 8, borderTop: `1px solid ${C.line}`, color: C.ink }}>
            <span>Total TTC</span>
            <span>{totals.net} €</span>
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div style={{ background: C.soft, padding: 12, borderRadius: 6, marginBottom: 20, fontSize: 11 }}>
        <div style={{ fontWeight: 600, color: C.ink, marginBottom: 4 }}>Moyens de paiement</div>
        <div style={{ color: C.sub, lineHeight: 1.6 }}>
          IBAN : FR6730002039400000058107N70<br />
          BIC : CRLYFRPP
        </div>
      </div>

      {/* Legal Text */}
      <div style={{ fontSize: 10, color: C.sub, lineHeight: 1.6, marginBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>
          En cas de retard de paiement, une pénalité de 3 fois le taux d&apos;intérêt légal sera appliquée, à laquelle s&apos;ajoutera une indemnité forfaitaire pour frais de recouvrement de 40€.
        </div>
        <div>TVA non applicable, art. 293 B du CGI</div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 12, fontSize: 9, color: C.sub, textAlign: "center" }}>
        Facture et devis créés avec, la facturation électronique conforme et 100% gratuite
      </div>
    </div>
  )
})

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "6px 0",
        fontSize: 13,
        color: accent ? C.accent : C.ink,
      }}
    >
      <span>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  )
}
