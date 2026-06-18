"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useI18n } from "@/components/providers/i18n-provider"

const faqs = ["1", "2", "3", "4"]

export function FaqSection() {
  const { t } = useI18n()

  return (
    <section id="faq" className="bg-secondary/40 py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-sm font-medium text-accent">
            {t("faq.badge")}
          </span>
          <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {t("faq.title")}
          </h2>
        </div>

        <Accordion className="w-full">
          {faqs.map((n) => (
            <AccordionItem key={n} value={`item-${n}`} className="border-border">
              <AccordionTrigger className="text-start text-base font-semibold text-foreground hover:no-underline">
                {t(`faq.q${n}`)}
              </AccordionTrigger>
              <AccordionContent className="text-pretty leading-relaxed text-muted-foreground">
                {t(`faq.a${n}`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
