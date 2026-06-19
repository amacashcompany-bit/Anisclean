"use client"

import { Moon, Sun } from "lucide-react"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useI18n } from "@/components/providers/i18n-provider"
import { LANGS } from "@/lib/i18n/translations"
import { cn } from "@/lib/utils"

export function LangThemeControls() {
  const { lang, setLang } = useI18n()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <div className="flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Language"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-1.5 px-2",
          )}
        >
          <span className="text-base leading-none">{LANGS.find((l) => l.code === lang)?.flag}</span>
          <span className="text-xs font-semibold uppercase">{lang}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {LANGS.map((l) => (
            <DropdownMenuItem
              key={l.code}
              onClick={() => setLang(l.code)}
              className={cn("gap-2", l.code === lang ? "font-semibold text-primary" : "")}
            >
              <span className="text-base leading-none">{l.flag}</span>
              {l.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="icon"
        className="size-9"
        aria-label="Toggle theme"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      >
        {mounted && resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>
    </div>
  )
}
