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
  LogOut,
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
    <aside className="flex flex-col h-full w-64 border-r border-sidebar-border bg-sidebar">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex items-center justify-center size-10 rounded-xl bg-primary text-primary-foreground shadow-sm">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-sidebar-foreground leading-tight font-heading">
            {t("admin.title")}
          </p>
          <p className="text-xs text-muted-foreground">Sanadclean</p>
        </div>
      </div>

      <Separator />

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 py-4 flex-1 overflow-y-auto">
        <p className="px-3 pb-1 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Menu
        </p>
        {navItems.map(({ key, href, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-transform group-hover:scale-110",
                  active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-sidebar-accent-foreground",
                )}
              />
              {t(key)}
            </Link>
          )
        })}
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
          className="justify-start gap-3 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => signOut().then(() => (window.location.href = "/"))}
        >
          <LogOut className="size-4 shrink-0" />
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
    <nav
      className="fixed bottom-0 inset-x-0 z-50 lg:hidden border-t border-border bg-background/85 backdrop-blur-lg shadow-[0_-2px_12px_-4px_rgba(0,0,0,0.12)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch px-2 pt-1.5 pb-1">
        {mobileItems.map(({ key, href, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 py-1"
            >
              <span
                className={cn(
                  "flex items-center justify-center rounded-full px-4 py-1 transition-all",
                  active ? "bg-primary/12 text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className={cn("size-5 transition-transform", active && "scale-110")} />
              </span>
              <span
                className={cn(
                  "text-[0.65rem] font-medium leading-none truncate max-w-full px-1 transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {t(key)}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
