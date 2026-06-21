"use client"

import { Phone, MessageCircle } from "lucide-react"
import { usePathname } from "next/navigation"
import { site } from "@/lib/site"

export function FloatingContact() {
  const pathname = usePathname()

  // Hide the bubble while the user is going through the ordering flow
  const isOrdering = pathname.startsWith("/commande")
  if (isOrdering) return null

  return (
    // bottom-24 sits just above the mobile tab bar (h-16 + safe area ~h-8)
    // On desktop (lg) the tab bar is hidden so we drop back to bottom-6
    <div className="fixed bottom-24 end-4 z-50 flex flex-col gap-3 lg:bottom-6 lg:end-6">
      <a
        href={site.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Discuter sur WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
      <a
        href={site.phoneHref}
        aria-label={`Appeler le ${site.phoneDisplay}`}
        className="hidden h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 lg:flex"
      >
        <Phone className="h-7 w-7" />
      </a>
    </div>
  )
}
