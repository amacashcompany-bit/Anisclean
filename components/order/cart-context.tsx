"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import { MATERIAL_SURCHARGE } from "@/lib/services"

export type LineKind = "hourly" | "package"

export interface CartLine {
  /** unique key in the cart */
  key: string
  serviceId: string
  nameKey: string
  /** descriptor: translation key for hourly, plain label for packages */
  descKey?: string
  descLabel?: string
  kind: LineKind
  baseRate: number
  material: boolean
  qty: number
  taxEligible: boolean
}

export interface CartTotals {
  subtotal: number
  taxCredit: number
  net: number
}

export function lineUnit(line: CartLine) {
  return line.kind === "hourly" && line.material ? line.baseRate + MATERIAL_SURCHARGE : line.baseRate
}

export function lineTotal(line: CartLine) {
  return lineUnit(line) * line.qty
}

interface CartCtx {
  lines: CartLine[]
  addLine: (line: CartLine) => void
  removeLine: (key: string) => void
  setQty: (key: string, qty: number) => void
  toggleMaterial: (key: string) => void
  has: (key: string) => boolean
  clear: () => void
  count: number
  totals: CartTotals
}

const Ctx = createContext<CartCtx | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])

  const addLine = (line: CartLine) =>
    setLines((prev) => (prev.some((l) => l.key === line.key) ? prev : [...prev, line]))

  const removeLine = (key: string) => setLines((prev) => prev.filter((l) => l.key !== key))

  const setQty = (key: string, qty: number) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, qty: Math.max(1, qty) } : l)))

  const toggleMaterial = (key: string) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, material: !l.material } : l)))

  const has = (key: string) => lines.some((l) => l.key === key)
  const clear = () => setLines([])

  const totals = useMemo<CartTotals>(() => {
    let subtotal = 0
    let eligible = 0
    for (const l of lines) {
      const total = lineTotal(l)
      subtotal += total
      if (l.taxEligible) eligible += total
    }
    const taxCredit = Math.round(eligible / 2)
    return { subtotal, taxCredit, net: subtotal - taxCredit }
  }, [lines])

  return (
    <Ctx.Provider
      value={{ lines, addLine, removeLine, setQty, toggleMaterial, has, clear, count: lines.length, totals }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useCart() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
