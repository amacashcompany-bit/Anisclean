"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Images, ClipboardList, Phone } from "lucide-react"
import { cn } from "@/lib/utils"
import { site } from "@/lib/site"
import { useI18n } from "@/components/providers/i18n-provider"

export function MobileTabBar() {
  const { t } = useI18n()
  const pathname = usePathname()

  const tabs = [
    { key: "nav.home", href: "/", icon: Home, active: pathname === "/" },
    { key: "nav.work", href: "/realisations", icon: Images, active: pathname.startsWith("/realisations") },
    { key: "nav.order", href: "/commande", icon: ClipboardList, active: pathname.startsWith("/commande"), primary: true },
  ]

  return (
    <nav
      aria-label="Navigation mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[0.7rem] font-medium transition-colors",
                tab.active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                  tab.primary && tab.active && "bg-primary text-primary-foreground",
                  tab.primary && !tab.active && "bg-primary/10 text-primary",
                  !tab.primary && tab.active && "bg-primary/10",
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              {t(tab.key)}
            </Link>
          )
        })}
        <a
          href={site.phoneHref}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[0.7rem] font-medium text-muted-foreground transition-colors"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl">
            <Phone className="h-5 w-5" />
          </span>
          {t("common.call")}
        </a>
      </div>
    </nav>
  )
}
