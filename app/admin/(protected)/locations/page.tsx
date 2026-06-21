import { getServiceLocations } from "@/lib/db/admin-actions"
import { AdminLocationsClient } from "@/components/admin/locations-client"

export default async function AdminLocationsPage() {
  const locations = await getServiceLocations()
  return <AdminLocationsClient locations={locations} />
}
