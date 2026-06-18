import { getServiceOverrides } from "@/lib/db/admin-actions"
import { AdminServicesClient } from "@/components/admin/services-client"

export default async function AdminServicesPage() {
  const overrides = await getServiceOverrides()
  return <AdminServicesClient overrides={overrides} />
}
