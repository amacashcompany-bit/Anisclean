"use client"

import { useState, useTransition } from "react"
import { MapPin, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Save, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  createServiceLocation,
  updateServiceLocation,
  deleteServiceLocation,
} from "@/lib/db/admin-actions"

type Location = {
  id: number
  name: string
  lat: number
  lng: number
  active: boolean
  sortOrder: number
}

type Props = { locations: Location[] }

const EMPTY_FORM = { name: "", lat: "", lng: "" }

export function AdminLocationsClient({ locations: initial }: Props) {
  const [locations, setLocations] = useState<Location[]>(initial)
  const [search, setSearch] = useState("")
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState(EMPTY_FORM)
  const [isPending, startTransition] = useTransition()

  const filtered = locations.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()),
  )

  function startEdit(loc: Location) {
    setEditId(loc.id)
    setForm({ name: loc.name, lat: String(loc.lat), lng: String(loc.lng) })
  }

  function cancelEdit() {
    setEditId(null)
    setForm(EMPTY_FORM)
  }

  function handleSaveEdit(loc: Location) {
    const lat = parseFloat(form.lat)
    const lng = parseFloat(form.lng)
    if (!form.name.trim() || isNaN(lat) || isNaN(lng)) return
    startTransition(async () => {
      await updateServiceLocation(loc.id, { name: form.name.trim(), lat, lng })
      setLocations((prev) =>
        prev.map((l) => (l.id === loc.id ? { ...l, name: form.name.trim(), lat, lng } : l)),
      )
      setEditId(null)
    })
  }

  function handleToggle(loc: Location) {
    startTransition(async () => {
      await updateServiceLocation(loc.id, { active: !loc.active })
      setLocations((prev) =>
        prev.map((l) => (l.id === loc.id ? { ...l, active: !l.active } : l)),
      )
    })
  }

  function handleDelete(id: number) {
    if (!confirm("Supprimer cette commune ?")) return
    startTransition(async () => {
      await deleteServiceLocation(id)
      setLocations((prev) => prev.filter((l) => l.id !== id))
    })
  }

  function handleAdd() {
    const lat = parseFloat(addForm.lat)
    const lng = parseFloat(addForm.lng)
    if (!addForm.name.trim() || isNaN(lat) || isNaN(lng)) return
    startTransition(async () => {
      const row = await createServiceLocation({
        name: addForm.name.trim(),
        lat,
        lng,
        sortOrder: locations.length,
      })
      setLocations((prev) => [...prev, row])
      setAddForm(EMPTY_FORM)
      setShowAdd(false)
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Zones d&apos;intervention</h1>
        <p className="text-sm text-muted-foreground">
          Gérez les communes affichées sur la carte de la page d&apos;accueil.
        </p>
      </div>

      {/* Top bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher une commune..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setShowAdd((v) => !v)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Ajouter une commune
        </Button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Nouvelle commune</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label>Nom</Label>
              <Input
                placeholder="ex: Dijon"
                value={addForm.name}
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Latitude</Label>
              <Input
                placeholder="ex: 47.3220"
                value={addForm.lat}
                onChange={(e) => setAddForm((f) => ({ ...f, lat: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Longitude</Label>
              <Input
                placeholder="ex: 5.0415"
                value={addForm.lng}
                onChange={(e) => setAddForm((f) => ({ ...f, lng: e.target.value }))}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={handleAdd} disabled={isPending} size="sm" className="gap-2">
              <Save className="h-4 w-4" /> Enregistrer
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setShowAdd(false); setAddForm(EMPTY_FORM) }}>
              <X className="h-4 w-4" /> Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-3 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{locations.length}</span> communes au total ·
        <span className="font-medium text-green-600">{locations.filter((l) => l.active).length}</span> actives
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-left">
              <th className="px-4 py-3 font-semibold text-foreground">Commune</th>
              <th className="hidden px-4 py-3 font-semibold text-foreground md:table-cell">Latitude</th>
              <th className="hidden px-4 py-3 font-semibold text-foreground md:table-cell">Longitude</th>
              <th className="px-4 py-3 font-semibold text-foreground">Statut</th>
              <th className="px-4 py-3 text-right font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-muted-foreground">
                  Aucune commune trouvée
                </td>
              </tr>
            )}
            {filtered.map((loc) => (
              <tr key={loc.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                {editId === loc.id ? (
                  <>
                    <td className="px-4 py-2">
                      <Input
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        className="h-8 text-sm"
                      />
                    </td>
                    <td className="hidden px-4 py-2 md:table-cell">
                      <Input
                        value={form.lat}
                        onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
                        className="h-8 text-sm"
                      />
                    </td>
                    <td className="hidden px-4 py-2 md:table-cell">
                      <Input
                        value={form.lng}
                        onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
                        className="h-8 text-sm"
                      />
                    </td>
                    <td className="px-4 py-2" />
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" onClick={() => handleSaveEdit(loc)} disabled={isPending} className="h-8 gap-1.5">
                          <Save className="h-3.5 w-3.5" /> Sauver
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-8">
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <MapPin className={cn("h-4 w-4 shrink-0", loc.active ? "text-accent" : "text-muted-foreground")} />
                        <span className="font-medium text-foreground">{loc.name}</span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 font-mono text-muted-foreground md:table-cell">{loc.lat.toFixed(4)}</td>
                    <td className="hidden px-4 py-3 font-mono text-muted-foreground md:table-cell">{loc.lng.toFixed(4)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={loc.active ? "default" : "secondary"} className="text-xs">
                        {loc.active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleToggle(loc)}
                          disabled={isPending}
                          title={loc.active ? "Désactiver" : "Activer"}
                        >
                          {loc.active
                            ? <ToggleRight className="h-4 w-4 text-green-600" />
                            : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(loc)} disabled={isPending}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(loc.id)} disabled={isPending}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
