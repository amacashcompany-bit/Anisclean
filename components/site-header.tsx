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

// Wave / Z logo mark
function ZyncleanMark({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="#0ea5e9" />
      {/* Water droplet shape */}
      <path
        d="M20 7 C20 7 28 16 28 21.5 C28 25.6 24.4 29 20 29 C15.6 29 12 25.6 12 21.5 C12 16 20 7 20 7Z"
        fill="white"
        fillOpacity="0.25"
      />
      {/* Z letterform */}
      <path
        d="M14 15.5 H26 L14 24.5 H26"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
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
          <ZyncleanMark size={38} />
          <span className="flex flex-col leading-none">
            <span className="flex items-baseline text-[1.25rem] font-black tracking-tight">
              <span className="text-white">zyn</span>
              <span style={{ color: "#38bdf8" }}>cleen</span>
            </span>
            <span className="text-[0.52rem] font-semibold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.45)" }}>
              SYNC. CLEAN. LIVE.
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
              onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Lang + theme — force white text inside */}
          <div className="[&_button]:text-white/75 [&_button:hover]:bg-white/10 [&_button:hover]:text-white [&_.text-xs]:text-white/75">
            <LangThemeControls />
          </div>

          {/* Auth buttons — desktop only */}
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1.5 text-white transition hover:bg-white/20 focus:outline-none">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-sky-500 text-[10px] font-bold text-white">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="max-w-[80px] truncate text-sm font-medium">{user.name?.split(" ")[0] ?? user.email}</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/compte")} className="flex cursor-pointer items-center gap-2">
                    <User className="h-4 w-4" /> Mon compte
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/compte?tab=wallet")} className="flex cursor-pointer items-center gap-2">
                    <Wallet className="h-4 w-4" /> Portefeuille
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/compte?tab=history")} className="flex cursor-pointer items-center gap-2">
                    <History className="h-4 w-4" /> Mes services
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive"
                    onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/" } } })}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button render={<Link href="/sign-in" />} variant="ghost" size="sm" className="text-white/75 hover:bg-white/10 hover:text-white">
                  Connexion
                </Button>
                <Button render={<Link href="/sign-up" />} size="sm" className="bg-sky-500 font-semibold text-white hover:bg-sky-400">
                  S&apos;inscrire
                </Button>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            type="button"
            className="ml-1 inline-flex items-center justify-center rounded-lg p-2 text-white/75 transition hover:bg-white/10 hover:text-white"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fermer" : "Menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-white/10 md:hidden" style={{ background: "#091a2f" }}>
          <nav className="mx-auto flex max-w-7xl flex-col gap-0.5 px-4 py-3" aria-label="Navigation mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium transition"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                {t(link.key)}
              </Link>
            ))}

            <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3">
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-3 pb-1">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-sky-500 text-xs font-bold text-white">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <p className="text-xs text-white/50">{user.email}</p>
                    </div>
                  </div>
                  <Link href="/compte" onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
                    <User className="h-4 w-4" /> Mon compte
                  </Link>
                  <Link href="/compte?tab=wallet" onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
                    <Wallet className="h-4 w-4" /> Portefeuille
                  </Link>
                  <Link href="/compte?tab=history" onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
                    <History className="h-4 w-4" /> Mes services
                  </Link>
                  <button
                    onClick={() => { setOpen(false); signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/" } } }) }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-400 hover:bg-white/10"
                  >
                    <LogOut className="h-4 w-4" /> Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Button render={<Link href="/sign-in" onClick={() => setOpen(false)} />} variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
                    Connexion
                  </Button>
                  <Button render={<Link href="/sign-up" onClick={() => setOpen(false)} />} className="bg-sky-500 font-semibold text-white hover:bg-sky-400">
                    S&apos;inscrire
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
