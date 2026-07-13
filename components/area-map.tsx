"use client"

import { useEffect, useRef } from "react"
import { MapContainer, TileLayer, Circle, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const center: [number, number] = [47.322, 5.0415]

const communes = [
  { name: "Dijon", coords: [47.322, 5.0415] as [number, number], pop: 156000 },
  { name: "Quetigny", coords: [47.316, 5.106] as [number, number], pop: 9600 },
  { name: "Chenôve", coords: [47.291, 5.004] as [number, number], pop: 14400 },
  { name: "Talant", coords: [47.337, 4.998] as [number, number], pop: 12400 },
  { name: "Fontaine-lès-Dijon", coords: [47.343, 5.019] as [number, number], pop: 8900 },
  { name: "Saint-Apollinaire", coords: [47.332, 5.085] as [number, number], pop: 7200 },
  { name: "Ruffey-lès-Echirey", coords: [47.366, 5.081] as [number, number], pop: 1200 },
  { name: "Daix", coords: [47.351, 4.999] as [number, number], pop: 1700 },
  { name: "Prenois", coords: [47.376, 4.901] as [number, number], pop: 440 },
  { name: "Flavignerot", coords: [47.345, 4.941] as [number, number], pop: 190 },
  { name: "Corcelles-les-Monts", coords: [47.314, 4.968] as [number, number], pop: 720 },
  { name: "Plombières-lès-Dijon", coords: [47.338, 4.972] as [number, number], pop: 4200 },
  { name: "Hauteville-lès-Dijon", coords: [47.352, 4.996] as [number, number], pop: 520 },
  { name: "Longvic", coords: [47.288, 5.064] as [number, number], pop: 6400 },
  { name: "Ouges", coords: [47.274, 5.076] as [number, number], pop: 1100 },
  { name: "Bressey-sur-Tille", coords: [47.313, 5.187] as [number, number], pop: 720 },
  { name: "Chevigny-Saint-Sauveur", coords: [47.302, 5.135] as [number, number], pop: 10800 },
  { name: "Sennecey-lès-Dijon", coords: [47.290, 5.156] as [number, number], pop: 2100 },
  { name: "Marsannay-la-Côte", coords: [47.279, 4.99] as [number, number], pop: 5200 },
  { name: "Nuits-Saint-Georges", coords: [47.138, 4.951] as [number, number], pop: 5500 },
  { name: "Gevrey-Chambertin", coords: [47.228, 4.967] as [number, number], pop: 3100 },
  { name: "Beaune", coords: [47.026, 4.84] as [number, number], pop: 21500 },
]

export function AreaMap() {
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    // Fix Leaflet default icon issue in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    })
  }, [])

  // Custom home icon
  const homeIcon = L.divIcon({
    className: "custom-home-marker",
    html: `<div style="background:#0d9488;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })

  return (
    <MapContainer
      center={center}
      zoom={11}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", borderRadius: "inherit" }}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Service zone circle */}
      <Circle
        center={center}
        radius={30000}
        pathOptions={{
          color: "#0d9488",
          fillColor: "#0d9488",
          fillOpacity: 0.08,
          weight: 2,
          dashArray: "6 6",
        }}
      />

      {/* Home base marker */}
      <Marker position={center} icon={homeIcon}>
        <Popup>
          <div style={{ fontWeight: 700, color: "#0d9488" }}>Anisclean — Base Dijon</div>
        </Popup>
      </Marker>

      {/* Commune markers */}
      {communes.map((c) => (
        <Marker
          key={c.name}
          position={c.coords}
          icon={L.divIcon({
            className: "custom-commune-marker",
            html: `<div style="background:#0d9488;width:8px;height:8px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.2);opacity:0.7;"></div>`,
            iconSize: [8, 8],
            iconAnchor: [4, 4],
          })}
        >
          <Popup>
            <div style={{ fontWeight: 600 }}>{c.name}</div>
            <div style={{ fontSize: 12, color: "#666" }}>{c.pop.toLocaleString()} habitants</div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}