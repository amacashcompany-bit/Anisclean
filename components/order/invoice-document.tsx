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
  accent: "#1f8a8a",
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
        fontFamily: "Inter, Arial, sans-serif",
        padding: 40,
        boxSizing: "border-box",
        textAlign: dir === "rtl" ? "right" : "left",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>
            {site.name}
          </div>
          <div style={{ fontSize: 12, color: C.sub, marginTop: 4 }}>{t("brand.tagline")}</div>
          <div style={{ fontSize: 12, color: C.sub, marginTop: 8, lineHeight: 1.6 }}>
            {site.phoneDisplay}
            <br />
            {site.email}
          </div>
        </div>
        <div style={{ textAlign: dir === "rtl" ? "left" : "right" }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.accent }}>{t("inv.title")}</div>
          <div style={{ fontSize: 13, color: C.sub, marginTop: 8 }}>
            {t("inv.number")}: <b style={{ color: C.ink }}>{data.number}</b>
          </div>
          <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>
            {t("inv.date")}: <b style={{ color: C.ink }}>{data.date}</b>
          </div>
        </div>
      </div>

      {/* Billed to */}
      <div style={{ marginTop: 28, background: C.soft, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: 1 }}>
          {t("inv.billedTo")}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, marginTop: 6 }}>{customer.name}</div>
        <div style={{ fontSize: 13, color: C.sub, marginTop: 2, lineHeight: 1.6 }}>
          {customer.phone}
          {customer.email ? ` · ${customer.email}` : ""}
          {customer.address ? <br /> : null}
          {[customer.address, customer.zip, customer.city].filter(Boolean).join(", ")}
        </div>
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 24, fontSize: 13 }}>
        <thead>
          <tr style={{ background: C.ink, color: C.white }}>
            <th style={{ padding: "10px 12px", textAlign: dir === "rtl" ? "right" : "left" }}>{t("inv.service")}</th>
            <th style={{ padding: "10px 12px", textAlign: "center", width: 60 }}>{t("inv.qty")}</th>
            <th style={{ padding: "10px 12px", textAlign: dir === "rtl" ? "left" : "right", width: 90 }}>
              {t("inv.unit")}
            </th>
            <th style={{ padding: "10px 12px", textAlign: dir === "rtl" ? "left" : "right", width: 100 }}>
              {t("inv.amount")}
            </th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l) => (
            <tr key={l.key} style={{ borderBottom: `1px solid ${C.line}` }}>
              <td style={{ padding: "10px 12px" }}>{localeName(l)}</td>
              <td style={{ padding: "10px 12px", textAlign: "center" }}>
                {l.qty}
                {l.kind === "hourly" ? ` ${t("inv.hoursUnit")}` : ""}
              </td>
              <td style={{ padding: "10px 12px", textAlign: dir === "rtl" ? "left" : "right" }}>{lineUnit(l)} €</td>
              <td style={{ padding: "10px 12px", textAlign: dir === "rtl" ? "left" : "right", fontWeight: 700 }}>
                {lineTotal(l)} €
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: "flex", justifyContent: dir === "rtl" ? "flex-start" : "flex-end", marginTop: 20 }}>
        <div style={{ width: 280 }}>
          <Row label={t("inv.subtotal")} value={`${totals.subtotal} €`} />
          <Row label={t("inv.taxCredit")} value={`− ${totals.taxCredit} €`} accent />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
              padding: "12px 14px",
              background: C.accent,
              color: C.white,
              borderRadius: 10,
            }}
          >
            <span style={{ fontWeight: 700 }}>{t("inv.totalDue")}</span>
            <span style={{ fontWeight: 800, fontSize: 18 }}>{totals.net} €</span>
          </div>
        </div>
      </div>

      {customer.notes ? (
        <div style={{ marginTop: 20, fontSize: 12, color: C.sub }}>
          <b style={{ color: C.ink }}>{t("form.notes")}:</b> {customer.notes}
        </div>
      ) : null}

      <div style={{ marginTop: 28, borderTop: `1px solid ${C.line}`, paddingTop: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{t("inv.thanks")}</div>
        <div style={{ fontSize: 11, color: C.sub, marginTop: 6, lineHeight: 1.6 }}>{t("inv.note")}</div>
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
