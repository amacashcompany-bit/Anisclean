"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  CalendarDays,
  Wrench,
  Users,
  Settings,
  ArrowLeft,
  ShieldCheck,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/components/providers/i18n-provider"
import { signOut } from "@/lib/auth-client"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

const navItems = [
  { key: "admin.nav.dashboard", href: "/admin", icon: LayoutDashboard },
  { key: "admin.nav.orders", href: "/admin/orders", icon: ShoppingCart },
  { key: "admin.nav.invoices", href: "/admin/invoices", icon: FileText },
  { key: "admin.nav.schedule", href: "/admin/schedule", icon: CalendarDays },
  { key: "admin.nav.services", href: "/admin/services", icon: Wrench },
  { key: "admin.nav.reviews", href: "/admin/reviews", icon: Star },
  { key: "admin.nav.users", href: "/admin/users", icon: Users },
  { key: "admin.nav.settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { t } = useI18n()

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  return (
    <aside className="flex flex-col h-full w-64 border-r border-border bg-sidebar">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="flex items-center justify-center size-9 rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-sidebar-foreground leading-tight">
            {t("admin.title")}
          </p>
          <p className="text-xs text-muted-foreground">Sanadclean</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 py-4 flex-1 overflow-y-auto">
        {navItems.map(({ key, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive(href)
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {t(key)}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 flex flex-col gap-1">
        <Separator className="mb-3" />
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <ArrowLeft className="size-4 shrink-0" />
          {t("admin.nav.back")}
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="justify-start gap-3 px-3 text-muted-foreground hover:text-destructive"
          onClick={() => signOut().then(() => (window.location.href = "/"))}
        >
          <svg className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Déconnexion
        </Button>
      </div>
    </aside>
  )
}

// Mobile bottom nav for admin
export function AdminMobileNav() {
  const pathname = usePathname()
  const { t } = useI18n()

  const mobileItems = navItems.slice(0, 5)

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background flex lg:hidden">
      {mobileItems.map(({ key, href, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors",
            isActive(href) ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Icon className="size-5" />
          <span className="truncate">{t(key)}</span>
        </Link>
      ))}
    </nav>
  )
}
