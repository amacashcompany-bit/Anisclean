"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, User, LogOut, Wallet, History, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { site, navLinks } from "@/lib/site"
import { useI18n } from "@/components/providers/i18n-provider"
import { LangThemeControls } from "@/components/lang-theme-controls"
import { useSession, signOut } from "@/lib/auth-client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Anisclean logo mark
function AniscleanMark({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="#0ea5e9" />
      {/* Water droplet shape */}
      <path
        d="M20 7 C20 7 28 16 28 21.5 C28 25.6 24.4 29 20 29 C15.6 29 12 25.6 12 21.5 C12 16 20 7 20 7Z"
        fill="white"
        fillOpacity="0.25"
      />
      {/* A letterform */}
      <path
        d="M20 10 L12 28 H16 L17.5 24 H22.5 L24 28 H28 L20 10ZM18.5 21 L20 15.5 L21.5 21 H18.5Z"
        fill="white"
      />
    </svg>
  )
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { t } = useI18n()
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10" style={{ background: "#0d2240" }}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 md:px-6">

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <AniscleanMark size={38} />
          <span className="flex flex-col leading-none">
            <span className="flex items-baseline text-[1.25rem] font-black tracking-tight">
              <span className="text-white">anis</span>
              <span style={{ color: "#38bdf8" }}>clean</span>
            </span>
            <span className="text-[0.52rem] font-semibold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.45)" }}>
              CLEAN. FRESH. SHINE.
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 xl:flex" aria-label="Navigation principale">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors"
              style={{ color: "rgba(255,255,255,0.65)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <LangThemeControls />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-sky-500 text-sm font-bold text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-sky-500 text-xs font-bold text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name ?? "Utilisateur"}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/compte")}>
                  <User className="mr-2 h-4 w-4" /> Mon compte
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/compte?tab=wallet")}>
                  <Wallet className="mr-2 h-4 w-4" /> Portefeuille
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/compte?tab=history")}>
                  <History className="mr-2 h-4 w-4" /> Historique
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut().then(() => router.refresh())} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              className="hidden sm:flex bg-sky-500 hover:bg-sky-600 text-white"
              onClick={() => router.push("/sign-in")}
            >
              {t("nav.account")}
            </Button>
          )}

          {/* Mobile hamburger */}
          <button
            className="xl:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav overlay */}
      {open && (
        <div className="xl:hidden border-t border-white/10" style={{ background: "#0d2240" }}>
          <nav className="flex flex-col p-4 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                onClick={() => setOpen(false)}
              >
                {t(link.key)}
              </Link>
            ))}
            {!user && (
              <Button
                className="mt-2 w-full bg-sky-500 hover:bg-sky-600 text-white"
                onClick={() => { setOpen(false); router.push("/sign-in") }}
              >
                {t("nav.account")}
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}