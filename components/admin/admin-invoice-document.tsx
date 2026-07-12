"use client"

import { forwardRef } from "react"
import type { CartTotals } from "@/components/order/cart-context"
import { InvoiceDocument } from "@/components/order/invoice-document"
import type { InvoiceData, InvoiceCustomer } from "@/components/order/invoice-document"

export interface AdminInvoiceItem {
  description: string
  qty: number
  unitPrice: number
  amount: number
}

export interface AdminInvoice {
  number: string
  createdAt: Date
  clientName: string
  clientEmail: string
  clientPhone: string
  clientAddress: string
  clientCity?: string
  clientZip?: string
  items: AdminInvoiceItem[]
  subtotal: number
  taxCredit: number
  total: number
  notes: string
}

interface Props {
  invoice: AdminInvoice
  lang: "fr" | "en" | "ar"
  t: (key: string) => string
}

// Convert admin invoice to the format expected by InvoiceDocument
function convertToInvoiceData(invoice: AdminInvoice): InvoiceData {
  const customer: InvoiceCustomer = {
    name: invoice.clientName,
    phone: invoice.clientPhone,
    email: invoice.clientEmail,
    address: invoice.clientAddress,
    zip: invoice.clientZip || "",
    city: invoice.clientCity || "",
    notes: invoice.notes,
  }

  // Convert admin items to CartLine format
  const lines: any[] = invoice.items.map((item, idx) => ({
    key: `admin-item-${idx}`,
    nameKey: "dummy",
    name: item.description,
    kind: "fixed" as const,
    qty: item.qty,
    unitPrice: item.unitPrice,
  }))

  const totals: CartTotals = {
    subtotal: invoice.subtotal,
    taxCredit: invoice.taxCredit,
    net: invoice.total,
  }

  const date = new Date(invoice.createdAt)
  const dateStr = date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

  return {
    number: invoice.number,
    date: dateStr,
    customer,
    lines,
    totals,
  }
}

export const AdminInvoiceDocument = forwardRef<HTMLDivElement, Props>(
  function AdminInvoiceDocument({ invoice, lang, t }, ref) {
    const data = convertToInvoiceData(invoice)
    const dir = lang === "ar" ? "rtl" : "ltr"

    return (
      <InvoiceDocument data={data} lang={lang as any} dir={dir} t={t} ref={ref} />
    )
  }
)

AdminInvoiceDocument.displayName = "AdminInvoiceDocument"
