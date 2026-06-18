import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { FloatingContact } from "@/components/floating-contact"
import { WorkGallery } from "@/components/work-gallery"
import { getRealisationsPublic } from "@/lib/db/admin-actions"

export default async function RealisationsPage() {
  const items = await getRealisationsPublic()
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-background pt-16">
        <WorkGallery items={items} />
      </main>
      <SiteFooter />
      <FloatingContact />
    </>
  )
}
