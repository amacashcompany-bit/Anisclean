"use client"

import { useState, useRef, useLayoutEffect } from "react"
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

const TABS = [
  { key: "nav.home",  href: "/",           icon: Home,          match: (p: string) => p === "/" },
  { key: "nav.work",  href: "/realisations", icon: Images,       match: (p: string) => p.startsWith("/realisations") },
  { key: "nav.order", href: "/commande",   icon: ClipboardList, match: (p: string) => p.startsWith("/commande"), primary: true },
]

export function MobileTabBar() {
  const { t } = useI18n()
  const pathname = usePathname()
  const [callOpen, setCallOpen] = useState(false)

  // refs to each tab button so we can measure position for the sliding pill
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number } | null>(null)

  const activeIdx = TABS.findIndex((tab) => tab.match(pathname))

  useLayoutEffect(() => {
    const el = tabRefs.current[activeIdx]
    if (!el) return
    const parent = el.parentElement
    if (!parent) return
    const parentRect = parent.getBoundingClientRect()
    const rect = el.getBoundingClientRect()
    setPillStyle({
      left: rect.left - parentRect.left,
      width: rect.width,
    })
  }, [activeIdx, pathname])

  if (pathname.startsWith("/admin")) return null

  return (
    <>
      <nav
        aria-label="Navigation mobile"
        className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Glass card */}
        <div
          className="mx-4 mb-3 rounded-2xl border border-border/60 bg-background/90 shadow-xl backdrop-blur-xl"
          style={{ boxShadow: "0 -2px 32px rgba(0,0,0,0.08), 0 4px 24px rgba(0,0,0,0.06)" }}
        >
          <div className="relative flex items-stretch justify-around px-1">

            {/* Sliding active pill */}
            {pillStyle && activeIdx !== -1 && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-1.5 rounded-xl"
                style={{
                  left: pillStyle.left + 4,
                  width: pillStyle.width - 8,
                  background: TABS[activeIdx]?.primary
                    ? "oklch(0.36 0.08 255)"
                    : "oklch(0.36 0.08 255 / 0.1)",
                  transition: "left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                }}
              />
            )}

            {TABS.map((tab, i) => {
              const Icon = tab.icon
              const isActive = tab.match(pathname)
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  ref={(el) => { tabRefs.current[i] = el }}
                  className={cn(
                    "relative z-10 flex flex-1 flex-col items-center justify-center gap-0.5 py-3 text-[0.65rem] font-semibold tracking-wide transition-colors duration-200",
                    isActive && tab.primary ? "text-white" : "",
                    isActive && !tab.primary ? "text-primary" : "",
                    !isActive ? "text-muted-foreground" : "",
                  )}
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  <span
                    className="flex items-center justify-center transition-transform duration-300"
                    style={{
                      transform: isActive ? "scale(1.18) translateY(-1px)" : "scale(1) translateY(0px)",
                      transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                    }}
                  >
                    <Icon
                      className="h-5 w-5"
                      strokeWidth={isActive ? 2.5 : 1.8}
                    />
                  </span>
                  <span
                    style={{
                      opacity: isActive ? 1 : 0.7,
                      transform: isActive ? "scale(1.05)" : "scale(1)",
                      transition: "opacity 0.2s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                    }}
                  >
                    {t(tab.key)}
                  </span>
                </Link>
              )
            })}

            {/* Call button */}
            <button
              type="button"
              onClick={() => setCallOpen(true)}
              className="relative z-10 flex flex-1 flex-col items-center justify-center gap-0.5 py-3 text-[0.65rem] font-semibold tracking-wide text-muted-foreground transition-colors duration-200 active:text-primary"
              style={{ WebkitTapHighlightColor: "transparent" }}
              aria-label={t("common.call")}
            >
              <span
                className="flex items-center justify-center"
                style={{
                  transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                }}
              >
                <Phone className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <span style={{ opacity: 0.7 }}>{t("common.call")}</span>
            </button>

          </div>
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
            <p className="text-3xl font-extrabold tracking-tight text-foreground">
              {site.phoneDisplay}
            </p>
            <a
              href={site.phoneHref}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground shadow-md transition-opacity active:opacity-80"
              onClick={() => setCallOpen(false)}
            >
              <Phone className="h-5 w-5" />
              {site.phoneDisplay}
            </a>
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
