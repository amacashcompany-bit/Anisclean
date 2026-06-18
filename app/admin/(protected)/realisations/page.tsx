import { getRealisations } from "@/lib/db/admin-actions"
import { RealisationsClient } from "@/components/admin/realisations-client"

export default async function AdminRealisationsPage() {
  const items = await getRealisations()
  return <RealisationsClient items={items} />
}
