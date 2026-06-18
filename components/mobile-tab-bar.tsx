"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Images, ClipboardList, Phone, X, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { site } from "@/lib/site"
import { useI18n } from "@/components/providers/i18n-provider"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"

export function MobileTabBar() {
  const { t } = useI18n()
  const pathname = usePathname()
  const [callOpen, setCallOpen] = useState(false)

  // The admin area has its own navigation; hide the public tab bar there.
  if (pathname.startsWith("/admin")) {
    return null
  }

  const tabs = [
    { key: "nav.home", href: "/", icon: Home, active: pathname === "/" },
    { key: "nav.work", href: "/realisations", icon: Images, active: pathname.startsWith("/realisations") },
    { key: "nav.order", href: "/commande", icon: ClipboardList, active: pathname.startsWith("/commande"), primary: true },
  ]

  return (
    <>
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

          {/* Call button — opens a bottom sheet with the number */}
          <button
            type="button"
            onClick={() => setCallOpen(true)}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[0.7rem] font-medium text-muted-foreground transition-colors"
            aria-label={t("common.call")}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl">
              <Phone className="h-5 w-5" />
            </span>
            {t("common.call")}
          </button>
        </div>
      </nav>

      {/* Call drawer */}
      <Drawer open={callOpen} onOpenChange={setCallOpen}>
        <DrawerContent>
          <DrawerHeader className="text-center pb-2">
            <DrawerTitle className="text-xl font-bold">{t("common.call")}</DrawerTitle>
            <DrawerDescription className="text-muted-foreground text-sm">
              {t("contact.hoursValue")}
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-col items-center gap-4 px-6 pb-8">
            {/* Big phone number display */}
            <p className="text-3xl font-extrabold tracking-tight text-foreground">
              {site.phoneDisplay}
            </p>

            {/* Tap-to-call */}
            <a
              href={site.phoneHref}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground shadow-md transition-opacity active:opacity-80"
              onClick={() => setCallOpen(false)}
            >
              <Phone className="h-5 w-5" />
              {site.phoneDisplay}
            </a>

            {/* WhatsApp option */}
            <a
              href={site.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-6 py-4 text-lg font-semibold text-white shadow-md transition-opacity active:opacity-80"
              onClick={() => setCallOpen(false)}
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp
            </a>

            <DrawerClose asChild>
              <button
                type="button"
                className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"
              >
                <X className="h-4 w-4" />
                {t("admin.cancel")}
              </button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
