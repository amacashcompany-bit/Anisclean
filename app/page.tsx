import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { CreditSimulatorSection } from "@/components/credit-simulator-section"
import { ProcessSection } from "@/components/process-section"
import { AreaSection } from "@/components/area-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { FaqSection } from "@/components/faq-section"
import { SiteFooter } from "@/components/site-footer"
import { FloatingContact } from "@/components/floating-contact"

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <ServicesSection />
        <CreditSimulatorSection />
        <ProcessSection />
        <AreaSection />
        <TestimonialsSection />
        <FaqSection />
      </main>
      <SiteFooter />
      <FloatingContact />
    </div>
  )
}
