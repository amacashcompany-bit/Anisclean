"use client"

import { useEffect, useRef } from "react"
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix Leaflet default icon paths broken by webpack
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

// Custom SVG pin icon for communes
function makePin(active: boolean) {
  const color = active ? "#0d9488" : "#1e3a5f"
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#00000040"/>
      </filter>
      <ellipse cx="14" cy="34" rx="5" ry="2" fill="#00000020"/>
      <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0z"
        fill="${color}" filter="url(#s)"/>
      <circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/>
    </svg>
  `
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -38],
  })
}

// Home-base star icon for Dijon centre
const homeIcon = L.divIcon({
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="48" viewBox="0 0 38 48">
      <filter id="s2">
        <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#00000050"/>
      </filter>
      <path d="M19 0C8.51 0 0 8.51 0 19c0 12.89 19 29 19 29S38 31.89 38 19C38 8.51 29.49 0 19 0z"
        fill="#0d9488" filter="url(#s2)"/>
      <circle cx="19" cy="19" r="10" fill="white" opacity="0.95"/>
      <text x="19" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0d9488">Z</text>
    </svg>
  `,
  className: "",
  iconSize: [38, 48],
  iconAnchor: [19, 48],
  popupAnchor: [0, -50],
})

// Fly-to helper when selected changes
function FlyTo({ coords, center }: { coords: [number, number] | null; center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    // Guard: map must be fully initialised before calling flyTo
    if (!map || !map.getContainer()) return
    try {
      const target = coords ?? center
      // Validate coords are real numbers before flying
      if (!Number.isFinite(target[0]) || !Number.isFinite(target[1])) return
      if (coords) {
        map.flyTo(target, 13, { duration: 1.2, easeLinearity: 0.25 })
      } else {
        map.flyTo(target, 10, { duration: 1.0 })
      }
    } catch {
      // Swallow any residual Leaflet init errors
    }
  }, [coords, map, center])
  return null
}

interface Props {
  center: [number, number]
  radiusKm: number
  communes: { name: string; coords: [number, number] }[]
  selected: { name: string; coords: [number, number] } | null
  onSelect: (c: { name: string; coords: [number, number] } | null) => void
}

export default function AreaMap({ center, radiusKm, communes, selected, onSelect }: Props) {
  return (
    <MapContainer
      center={center}
      zoom={10}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
      scrollWheelZoom={false}
    >
      {/* Uber-style dark tile layer */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        maxZoom={19}
      />

      {/* Service radius circle — outer glow */}
      <Circle
        center={center}
        radius={radiusKm * 1000 * 1.05}
        pathOptions={{
          color: "#0d9488",
          fillColor: "#0d9488",
          fillOpacity: 0.04,
          weight: 0,
        }}
      />
      {/* Service radius circle — border */}
      <Circle
        center={center}
        radius={radiusKm * 1000}
        pathOptions={{
          color: "#0d9488",
          fillColor: "#0d9488",
          fillOpacity: 0.08,
          weight: 2,
          dashArray: "8 6",
        }}
      />

      {/* Home base marker */}
      <Marker position={center} icon={homeIcon}>
        <Popup>
          <div style={{ fontWeight: 700, color: "#0d9488" }}>Zyncleen — Base Dijon</div>
        </Popup>
      </Marker>

      {/* Commune markers */}
      {communes.map((c) => (
        <Marker
          key={c.name}
          position={c.coords}
          icon={makePin(selected?.name === c.name)}
          eventHandlers={{ click: () => onSelect(c) }}
        >
          <Popup>
            <div style={{ fontWeight: 600 }}>{c.name}</div>
          </Popup>
        </Marker>
      ))}

      {/* Fly animation */}
      <FlyTo coords={selected ? selected.coords : null} center={center} />
    </MapContainer>
  )
}
