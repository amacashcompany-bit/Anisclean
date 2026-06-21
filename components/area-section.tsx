import { getServiceLocationsPublic } from "@/lib/db/admin-actions"
import { AreaSectionClient } from "@/components/area-section-client"

export async function AreaSection() {
  let locations: { id: number; name: string; lat: number; lng: number }[] = []
  try {
    locations = await getServiceLocationsPublic()
  } catch {
    // fallback: empty map still renders
  }
  return <AreaSectionClient locations={locations} />
}
