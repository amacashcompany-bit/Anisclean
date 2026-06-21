import { getCustomServicesPublic } from "@/lib/db/admin-actions"
import { ServicesSectionClient } from "@/components/services-section-client"

export async function ServicesSection() {
  let customServices: Awaited<ReturnType<typeof getCustomServicesPublic>> = []
  try {
    customServices = await getCustomServicesPublic()
  } catch {
    // DB not ready — fall back to built-in only
  }

  return <ServicesSectionClient customServices={customServices} />
}
