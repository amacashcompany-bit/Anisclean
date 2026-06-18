import { getOrders } from "@/lib/db/admin-actions"
import { AdminOrdersClient } from "@/components/admin/orders-client"

export default async function AdminOrdersPage() {
  const orders = await getOrders()
  return <AdminOrdersClient orders={orders} />
}
