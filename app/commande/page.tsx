export const dynamic = "force-dynamic"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { FloatingContact } from "@/components/floating-contact"
import { OrderPageContent } from "@/components/order/order-page-content"
import { getCustomServicesPublic } from "@/lib/db/admin-actions"

export default async function CommandePage() {
  let customServices: Awaited<ReturnType<typeof getCustomServicesPublic>> = []
  try {
    customServices = await getCustomServicesPublic()
  } catch {
    // DB not ready — fall back to built-in only
  }

  return (
    <>
      <SiteHeader />
      <OrderPageContent customServices={customServices} />
      <SiteFooter />
      <FloatingContact />
    </>
  )
}
