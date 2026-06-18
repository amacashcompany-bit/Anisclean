import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { FloatingContact } from "@/components/floating-contact"
import { OrderPageContent } from "@/components/order/order-page-content"

export default function CommandePage() {
  return (
    <>
      <SiteHeader />
      <OrderPageContent />
      <SiteFooter />
      <FloatingContact />
    </>
  )
}
