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

const BLUE = "#4A90E2"
const DARK_INK = "#000000"

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
        color: DARK_INK,
        fontFamily:
          lang === "ar"
            ? "var(--font-cairo), Inter, Arial, sans-serif"
            : "Inter, Arial, sans-serif",
        padding: 40,
        boxSizing: "border-box",
        textAlign: dir === "rtl" ? "right" : "left",
      }}
    >
      {/* Header with Zyncleen Branding in Blue */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 16 }}>
        {/* Left: Zyncleen Logo */}
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, color: BLUE, letterSpacing: -0.5 }}>
            Zyncleen
          </div>
        </div>

        {/* Right: Invoice Metadata */}
        <div style={{ textAlign: "right", fontSize: 11 }}>
          <div style={{ color: C.sub, marginBottom: 8 }}>
            <div>Facture N° {data.number}</div>
            <div>Date: {data.date}</div>
          </div>
        </div>
      </div>

      {/* Company Info and Customer Info */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, fontSize: 10 }}>
        {/* Left: Company Info */}
        <div>
          <div style={{ fontWeight: 700, color: DARK_INK, marginBottom: 4 }}>
            Entreprise individuelle Zyncleen
          </div>
          <div style={{ color: C.sub, lineHeight: 1.6 }}>
            2 rue de pommard<br />
            21800 Dijon<br />
            FR
          </div>
        </div>

        {/* Right: Customer Info in Blue */}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700, color: BLUE, marginBottom: 2 }}>
            {customer.name?.toUpperCase() || "CLIENT"}
          </div>
          <div style={{ color: C.sub, lineHeight: 1.6 }}>
            {customer.email && <div>{customer.email}</div>}
            {customer.phone && <div>{customer.phone}</div>}
            {customer.address && <div>{customer.address}</div>}
            {customer.zip && customer.city && <div>{customer.zip} {customer.city}</div>}
            {!customer.address && <div>France</div>}
          </div>
        </div>
      </div>

      {/* Items Table with BLUE Header */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16, marginBottom: 16 }}>
        <thead>
          <tr style={{ background: BLUE }}>
            <th style={{ padding: "10px 8px", fontSize: 10, fontWeight: 700, textAlign: "left", color: C.white, textTransform: "uppercase", letterSpacing: 0.3 }}>
              Désignation
            </th>
            <th style={{ padding: "10px 8px", fontSize: 10, fontWeight: 700, textAlign: "center", color: C.white, textTransform: "uppercase", letterSpacing: 0.3, width: 70 }}>
              Quantité
            </th>
            <th style={{ padding: "10px 8px", fontSize: 10, fontWeight: 700, textAlign: "center", color: C.white, textTransform: "uppercase", letterSpacing: 0.3, width: 60 }}>
              Unité
            </th>
            <th style={{ padding: "10px 8px", fontSize: 10, fontWeight: 700, textAlign: "center", color: C.white, textTransform: "uppercase", letterSpacing: 0.3, width: 80 }}>
              Prix unitaire
            </th>
            <th style={{ padding: "10px 8px", fontSize: 10, fontWeight: 700, textAlign: "center", color: C.white, textTransform: "uppercase", letterSpacing: 0.3, width: 50 }}>
              TVA
            </th>
            <th style={{ padding: "10px 8px", fontSize: 10, fontWeight: 700, textAlign: "right", color: C.white, textTransform: "uppercase", letterSpacing: 0.3, width: 100 }}>
              Montant HT
            </th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l) => (
            <tr key={l.key} style={{ borderBottom: `1px solid #f0f0f0` }}>
              <td style={{ padding: "10px 8px", fontSize: 10, color: DARK_INK }}>{localeName(l)}</td>
              <td style={{ padding: "10px 8px", fontSize: 10, textAlign: "center", color: DARK_INK }}>
                {l.qty.toFixed(2)}
              </td>
              <td style={{ padding: "10px 8px", fontSize: 10, textAlign: "center", color: DARK_INK }}>
                forfait
              </td>
              <td style={{ padding: "10px 8px", fontSize: 10, textAlign: "center", color: DARK_INK }}>
                {lineUnit(l)},00 €
              </td>
              <td style={{ padding: "10px 8px", fontSize: 10, textAlign: "center", color: DARK_INK }}>
                0%
              </td>
              <td style={{ padding: "10px 8px", fontSize: 10, textAlign: "right", color: DARK_INK, fontWeight: 600 }}>
                {lineTotal(l)} €
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Section in BLUE */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, marginBottom: 20 }}>
        <div style={{ width: 250 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 4, paddingBottom: 4, borderBottom: `1px solid #f0f0f0` }}>
            <span style={{ fontWeight: 600, color: C.sub }}>Total HT</span>
            <span style={{ fontWeight: 700, color: BLUE }}>{totals.subtotal} €</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700 }}>
            <span style={{ color: BLUE }}>Total TTC</span>
            <span style={{ color: BLUE }}>{totals.net} €</span>
          </div>
        </div>
      </div>

      {/* IBAN and BIC in BLUE */}
      <div style={{ marginBottom: 16, fontSize: 9, lineHeight: 1.8 }}>
        <div style={{ fontWeight: 700, color: BLUE }}>IBAN : FR6730002039400000058107N70</div>
        <div style={{ fontWeight: 700, color: BLUE }}>BIC : CRLYFRPP</div>
      </div>

      {/* Legal Penalty Text */}
      <div style={{ fontSize: 8, color: C.sub, lineHeight: 1.6, marginBottom: 12 }}>
        <div style={{ marginBottom: 4 }}>
          En cas de retard de paiement, une pénalité de 3 fois le taux d&apos;intérêt légal sera appliquée, à laquelle s&apos;ajoutera une indemnité forfaitaire pour frais de recouvrement de 40€.
        </div>
        <div>TVA non applicable, art. 293 B du CGI</div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid #f0f0f0`, paddingTop: 8, fontSize: 8, color: C.sub, textAlign: "center" }}>
        Facture et devis créés avec Time, la facturation électronique conforme et 100% gratuite
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
