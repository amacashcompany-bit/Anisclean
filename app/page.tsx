export const dynamic = "force-dynamic"

import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { CreditSimulatorSection } from "@/components/credit-simulator-section"
import { ProcessSection } from "@/components/process-section"
import { AreaSection } from "@/components/area-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { FaqSection } from "@/components/faq-section"
import { PhotoSlider } from "@/components/photo-slider"
import { SiteFooter } from "@/components/site-footer"
import { FloatingContact } from "@/components/floating-contact"
import { getApprovedReviews } from "@/lib/db/admin-actions"
import { ensureAdminSchema } from "@/lib/db/ensure-schema"

export default async function Page() {
  // Bootstrap DB tables idempotently on first load
  try {
    await ensureAdminSchema()
  } catch {
    // ignore – runs before tables exist on first deploy
  }

  let reviews: Awaited<ReturnType<typeof getApprovedReviews>> = []
  try {
    reviews = await getApprovedReviews()
  } catch {
    // DB might not be ready yet; silently fall back to empty list
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PhotoSlider />
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <ServicesSection />
        <CreditSimulatorSection />
        <ProcessSection />
        <AreaSection />
        <TestimonialsSection initialReviews={reviews} />
        <FaqSection />
      </main>
      <SiteFooter />
      <FloatingContact />
    </div>
  )
}
