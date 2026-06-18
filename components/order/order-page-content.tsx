"use client"

import { useRef } from "react"
import { services } from "@/lib/services"
import { useI18n } from "@/components/providers/i18n-provider"
import { CartProvider, useCart } from "@/components/order/cart-context"
import { ServiceBuilderCard } from "@/components/order/service-builder-card"
import { CartSummary } from "@/components/order/cart-summary"
import { OrderForm } from "@/components/order/order-form"

function MobileBar({ onContinue }: { onContinue: () => void }) {
  const { t } = useI18n()
  const { count, totals } = useCart()
  if (count === 0) return null
  return (
    <button
      type="button"
      onClick={onContinue}
      className="fixed inset-x-0 bottom-16 z-40 flex items-center justify-between gap-4 border-t border-border bg-primary px-5 py-4 text-primary-foreground shadow-lg lg:hidden"
    >
      <span className="flex items-center gap-2">
        <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-primary-foreground/20 px-2 text-sm font-bold">
          {count}
        </span>
        <span className="text-sm font-medium">{t("order.items")}</span>
      </span>
      <span className="text-lg font-extrabold">{totals.net} €</span>
    </button>
  )
}

function Inner() {
  const { t } = useI18n()
  const formRef = useRef<HTMLDivElement>(null)
  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })

  return (
    <main className="bg-secondary/30 pb-40 lg:pb-16">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <div className="max-w-2xl">
          <h1 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {t("order.title")}
          </h1>
          <p className="mt-3 text-pretty text-lg leading-relaxed text-muted-foreground">{t("order.subtitle")}</p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-5">
            {services.map((service) => (
              <ServiceBuilderCard key={service.id} service={service} />
            ))}
          </div>

          <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
            <CartSummary onContinue={scrollToForm} />
          </div>
        </div>

        <div ref={formRef} className="mt-10 scroll-mt-24">
          <OrderForm />
        </div>
      </div>

      <MobileBar onContinue={scrollToForm} />
    </main>
  )
}

export function OrderPageContent() {
  return (
    <CartProvider>
      <Inner />
    </CartProvider>
  )
}
