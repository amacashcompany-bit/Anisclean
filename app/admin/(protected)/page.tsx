import { getAnalytics, getOrders } from "@/lib/db/admin-actions"
import { AdminDashboardClient } from "@/components/admin/dashboard-client"

export default async function AdminDashboardPage() {
  const [analytics, orders] = await Promise.all([
    getAnalytics(),
    getOrders(),
  ])

  return <AdminDashboardClient analytics={analytics} recentOrders={orders.slice(0, 8)} />
}
