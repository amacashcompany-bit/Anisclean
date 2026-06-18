"use client"

import { useState } from "react"
import { Sparkles, Menu, X, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { site, navLinks } from "@/lib/site"

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <a href="#accueil" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-extrabold uppercase tracking-tight text-foreground">{site.name}</span>
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {site.tagline}
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigation principale">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button asChild variant="outline" className="gap-2 bg-transparent">
            <a href={site.phoneHref}>
              <Phone className="h-4 w-4" />
              {site.phoneDisplay}
            </a>
          </Button>
          <Button asChild>
            <a href="#contact">Demander un devis</a>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4" aria-label="Navigation mobile">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <Button asChild variant="outline" className="mt-2 gap-2 bg-transparent">
              <a href={site.phoneHref} onClick={() => setOpen(false)}>
                <Phone className="h-4 w-4" />
                {site.phoneDisplay}
              </a>
            </Button>
            <Button asChild className="mt-1">
              <a href="#contact" onClick={() => setOpen(false)}>
                Demander un devis
              </a>
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
