import { getAppointments } from "@/lib/db/admin-actions"
import { AdminScheduleClient } from "@/components/admin/schedule-client"

export default async function AdminSchedulePage() {
  const appointments = await getAppointments()
  return <AdminScheduleClient appointments={appointments} />
}
