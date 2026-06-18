"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { translations, type Lang } from "@/lib/i18n/translations"

type I18nContextType = {
  lang: Lang
  dir: "ltr" | "rtl"
  setLang: (lang: Lang) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr")

  useEffect(() => {
    const stored = typeof window !== "undefined" ? (localStorage.getItem("lang") as Lang | null) : null
    if (stored && translations[stored]) setLangState(stored)
  }, [])

  const dir: "ltr" | "rtl" = lang === "ar" ? "rtl" : "ltr"

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir
  }, [lang, dir])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    if (typeof window !== "undefined") localStorage.setItem("lang", l)
  }, [])

  const t = useCallback(
    (key: string) => translations[lang][key] ?? translations.fr[key] ?? key,
    [lang],
  )

  return <I18nContext.Provider value={{ lang, dir, setLang, t }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within I18nProvider")
  return ctx
}
