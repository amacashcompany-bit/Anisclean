import { getServiceOverrides, getCustomServices } from "@/lib/db/admin-actions"
import { AdminServicesClient } from "@/components/admin/services-client"

export default async function AdminServicesPage() {
  const [overrides, customServicesList] = await Promise.all([
    getServiceOverrides(),
    getCustomServices(),
  ])
  return <AdminServicesClient overrides={overrides} customServicesList={customServicesList} />
}
