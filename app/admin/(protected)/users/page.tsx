import { getUsers } from "@/lib/db/admin-actions"
import { AdminUsersClient } from "@/components/admin/users-client"

export default async function AdminUsersPage() {
  const users = await getUsers()
  return <AdminUsersClient users={users} />
}
