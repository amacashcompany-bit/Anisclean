import { getInvoices } from "@/lib/db/admin-actions"
import { AdminInvoicesClient } from "@/components/admin/invoices-client"

export default async function AdminInvoicesPage() {
  const invoices = await getInvoices()
  return <AdminInvoicesClient invoices={invoices} />
}
