import { getSiteSettings } from "@/lib/db/admin-actions"
import { AdminSettingsClient } from "@/components/admin/settings-client"

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings()
  return <AdminSettingsClient settings={settings} />
}
