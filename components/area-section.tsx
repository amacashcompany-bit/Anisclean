"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { MapPin, Navigation, X, Phone, ChevronRight, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/providers/i18n-provider"
import { site } from "@/lib/site"

const CENTER: [number, number] = [47.322047, 5.04148]
const RADIUS_KM = 30

const COMMUNES: { name: string; coords: [number, number] }[] = [
  { name: "Dijon",               coords: [47.3220, 5.0415] },
  { name: "Chenôve",             coords: [47.2927, 5.0178] },
  { name: "Marsannay-la-Côte",   coords: [47.2706, 5.0111] },
  { name: "Longvic",             coords: [47.2948, 5.0607] },
  { name: "Quetigny",            coords: [47.3200, 5.1050] },
  { name: "Saint-Apollinaire",   coords: [47.3380, 5.0890] },
  { name: "Talant",              coords: [47.3378, 5.0178] },
  { name: "Fontaine-lès-Dijon",  coords: [47.3497, 5.0353] },
  { name: "Plombières-lès-Dijon",coords: [47.3608, 5.0097] },
  { name: "Ahuy",                coords: [47.3700, 5.0481] },
  { name: "Bressey-sur-Tille",   coords: [47.2780, 5.1550] },
  { name: "Genlis",              coords: [47.2441, 5.2110] },
  { name: "Sombernon",           coords: [47.3370, 4.7820] },
  { name: "Nuits-Saint-Georges", coords: [47.1133, 4.9540] },
  { name: "Beaune",              coords: [47.0200, 4.8397] },
  { name: "Is-sur-Tille",        coords: [47.5200, 5.1100] },
  { name: "Gevrey-Chambertin",   coords: [47.2268, 4.9724] },
  { name: "Auxonne",             coords: [47.1983, 5.3870] },
]

const MapComponent = dynamic(() => import("./area-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-secondary/30">
      <Loader2 className="h-8 w-8 animate-spin text-accent" />
    </div>
  ),
})

export function AreaSection() {
  const { t } = useI18n()
  const [selected, setSelected] = useState<{ name: string; coords: [number, number] } | null>(null)
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    if (!query.trim()) return COMMUNES
    const q = query.toLowerCase()
    return COMMUNES.filter((c) => c.name.toLowerCase().includes(q))
  }, [query])

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  function pickCommune(c: { name: string; coords: [number, number] }) {
    setSelected(c)
    setQuery(c.name)
    setOpen(false)
  }

  function clearSearch() {
    setQuery("")
    setSelected(null)
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <section id="zone" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">

        {/* Header */}
        <div className="mb-8 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-sm font-medium text-accent">
              <MapPin className="h-3.5 w-3.5" />
              {t("area.badge")}
            </span>
            <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              {t("area.title")}
            </h2>
            <p className="max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
              {t("area.desc")}
            </p>
          </div>
          <Button render={<Link href="/commande" />} size="lg" className="shrink-0">
            {t("nav.order")}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {/* Search bar above the map */}
        <div className="relative mb-3 z-10">
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-md ring-0 transition-all focus-within:ring-2 focus-within:ring-accent/40">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
              onFocus={() => setOpen(true)}
              placeholder={t("area.searchPlaceholder")}
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button onClick={clearSearch} className="rounded-full p-0.5 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Dropdown suggestions */}
          {open && filtered.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-60 overflow-y-auto rounded-2xl border border-border bg-card shadow-xl"
            >
              {filtered.map((c) => (
                <button
                  key={c.name}
                  onMouseDown={() => pickCommune(c)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-accent/8 ${
                    selected?.name === c.name ? "bg-accent/10 font-semibold text-accent" : "text-foreground"
                  }`}
                >
                  <MapPin className="h-4 w-4 shrink-0 text-accent" />
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {open && query.trim() && filtered.length === 0 && (
            <div
              ref={dropdownRef}
              className="absolute left-0 right-0 top-full z-50 mt-1.5 rounded-2xl border border-border bg-card px-4 py-4 text-center text-sm text-muted-foreground shadow-xl"
            >
              {t("area.noResults")}
            </div>
          )}
        </div>

        {/* Map container */}
        <div className="relative overflow-hidden rounded-2xl border border-border shadow-2xl" style={{ height: 520 }}>
          <MapComponent
            center={CENTER}
            radiusKm={RADIUS_KM}
            communes={COMMUNES}
            selected={selected}
            onSelect={(c) => { setSelected(c); if (c) setQuery(c.name) }}
          />

          {/* Selected commune panel */}
          {selected && (
            <div className="absolute bottom-4 left-1/2 z-[1000] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur-md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{selected.name}</p>
                    <p className="text-sm text-muted-foreground">{t("area.badge")}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelected(null); setQuery("") }}
                  className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selected.coords[0]},${selected.coords[1]}&travelmode=driving`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Navigation className="h-4 w-4" />
                  {t("area.navigate")}
                </a>
                <a
                  href={site.phoneHref}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent/10"
                >
                  <Phone className="h-4 w-4" />
                  {t("area.callUs")}
                </a>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="absolute left-3 top-3 z-[1000] flex flex-col gap-1.5 rounded-xl border border-border bg-card/90 px-3 py-2 text-xs backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-accent/80" />
              <span className="text-muted-foreground">{t("area.legend.zone")}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-primary" />
              <span className="text-muted-foreground">{t("area.legend.commune")}</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
