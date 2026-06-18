import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { FloatingContact } from "@/components/floating-contact"
import { WorkGallery } from "@/components/work-gallery"

export default function RealisationsPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-background pt-16">
        <WorkGallery />
      </main>
      <SiteFooter />
      <FloatingContact />
    </>
  )
}
