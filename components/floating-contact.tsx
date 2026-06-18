import { Phone, MessageCircle } from "lucide-react"
import { site } from "@/lib/site"

export function FloatingContact() {
  return (
    <div className="fixed bottom-20 end-4 z-50 flex flex-col gap-3 lg:bottom-5 lg:end-5">
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
