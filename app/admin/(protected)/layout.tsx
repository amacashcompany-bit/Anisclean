import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { AdminSidebar, AdminMobileNav } from "@/components/admin/admin-sidebar"
import { bootstrapAdminSchema } from "@/lib/db/admin-actions"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect("/admin/login")
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((session.user as any).role !== "admin") {
    redirect("/")
  }

  // Idempotent schema bootstrap on first admin page load
  try {
    await bootstrapAdminSchema()
  } catch {
    // already exists or non-critical
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">
        <AdminSidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <AdminMobileNav />
    </div>
  )
}
