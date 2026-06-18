"use client"

import { useState, useRef, useTransition } from "react"
import Image from "next/image"
import { ImagePlus, Pencil, Trash2, Eye, EyeOff, GripVertical, Upload, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  createRealisation,
  updateRealisation,
  deleteRealisation,
} from "@/lib/db/admin-actions"

type Realisation = {
  id: number
  title: string
  tag: string | null
  beforeUrl: string
  afterUrl: string
  published: boolean
  sortOrder: number
  createdAt: Date
}

type FormState = {
  title: string
  tag: string
  published: boolean
  beforeUrl: string
  afterUrl: string
  beforePreview: string
  afterPreview: string
}

const DEFAULT_FORM: FormState = {
  title: "",
  tag: "",
  published: true,
  beforeUrl: "",
  afterUrl: "",
  beforePreview: "",
  afterPreview: "",
}

function ImageUploadField({
  label,
  preview,
  onFile,
  onClear,
  loading,
}: {
  label: string
  preview: string
  onFile: (file: File) => void
  onClear: () => void
  loading: boolean
}) {
  const ref = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-colors overflow-hidden",
          preview ? "border-transparent h-40" : "border-border hover:border-primary/50 h-40 bg-muted/30"
        )}
        onClick={() => !preview && ref.current?.click()}
      >
        {preview ? (
          <>
            <Image src={preview} alt={label} fill className="object-cover rounded-xl" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClear() }}
              className="absolute top-2 right-2 size-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors z-10"
            >
              <X className="size-3.5" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            {loading ? (
              <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            ) : (
              <>
                <Upload className="size-7 opacity-50" />
                <span className="text-xs font-medium">Cliquer pour uploader</span>
                <span className="text-[10px] opacity-60">JPG, PNG, WEBP — max 8 Mo</span>
              </>
            )}
          </div>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
          e.target.value = ""
        }}
      />
    </div>
  )
}

// Drag-handle slider for before/after preview
function BeforeAfterSlider({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50)
  const trackRef = useRef<HTMLDivElement>(null)

  function handlePointer(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function handleMove(e: React.PointerEvent) {
    if (e.buttons === 0) return
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    setPos(pct)
  }

  return (
    <div ref={trackRef} className="relative aspect-[4/3] w-full overflow-hidden rounded-xl cursor-col-resize select-none" onPointerDown={handlePointer} onPointerMove={handleMove}>
      {/* After (full width behind) */}
      <Image src={after} alt="Après" fill className="object-cover" />
      {/* Before (clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <Image src={before} alt="Avant" fill className="object-cover" />
      </div>
      {/* Divider */}
      <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 rounded-full bg-white shadow-md flex items-center justify-center">
          <GripVertical className="size-4 text-foreground" />
        </div>
      </div>
      {/* Labels */}
      <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-0.5 text-xs font-bold text-white uppercase tracking-wide">Avant</span>
      <span className="absolute bottom-3 right-3 rounded-md bg-primary/90 px-2 py-0.5 text-xs font-bold text-white uppercase tracking-wide">Après</span>
    </div>
  )
}

export function RealisationsClient({ items: initial }: { items: Realisation[] }) {
  const [items, setItems] = useState(initial)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Realisation | null>(null)
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [uploadingBefore, setUploadingBefore] = useState(false)
  const [uploadingAfter, setUploadingAfter] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  function openCreate() {
    setEditing(null)
    setForm(DEFAULT_FORM)
    setError("")
    setDialogOpen(true)
  }

  function openEdit(item: Realisation) {
    setEditing(item)
    setForm({
      title: item.title,
      tag: item.tag ?? "",
      published: item.published,
      beforeUrl: item.beforeUrl,
      afterUrl: item.afterUrl,
      beforePreview: item.beforeUrl,
      afterPreview: item.afterUrl,
    })
    setError("")
    setDialogOpen(true)
  }

  async function uploadImage(file: File, side: "before" | "after") {
    if (side === "before") setUploadingBefore(true)
    else setUploadingAfter(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload-image", { method: "POST", body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Upload failed")
      const url: string = json.url
      if (side === "before") setForm((f) => ({ ...f, beforeUrl: url, beforePreview: url }))
      else setForm((f) => ({ ...f, afterUrl: url, afterPreview: url }))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      if (side === "before") setUploadingBefore(false)
      else setUploadingAfter(false)
    }
  }

  async function handleSave() {
    if (!form.title.trim()) { setError("Le titre est requis"); return }
    if (!form.beforeUrl) { setError("L'image Avant est requise"); return }
    if (!form.afterUrl) { setError("L'image Après est requise"); return }
    setSaving(true)
    setError("")
    try {
      if (editing) {
        await updateRealisation(editing.id, {
          title: form.title.trim(),
          tag: form.tag.trim() || undefined,
          beforeUrl: form.beforeUrl,
          afterUrl: form.afterUrl,
          published: form.published,
        })
        setItems((prev) => prev.map((i) => i.id === editing.id ? { ...i, ...form, tag: form.tag || null } : i))
      } else {
        const row = await createRealisation({
          title: form.title.trim(),
          tag: form.tag.trim() || undefined,
          beforeUrl: form.beforeUrl,
          afterUrl: form.afterUrl,
          published: form.published,
        })
        setItems((prev) => [row, ...prev])
      }
      setDialogOpen(false)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  function handleTogglePublish(item: Realisation) {
    startTransition(async () => {
      await updateRealisation(item.id, { published: !item.published })
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, published: !i.published } : i))
    })
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      await deleteRealisation(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
    })
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary">
            <ImagePlus className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground font-heading">Réalisations</h1>
            <p className="text-sm text-muted-foreground">{items.length} photo{items.length !== 1 ? "s" : ""} avant/après</p>
          </div>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="size-4" />
          Ajouter
        </Button>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border py-20 text-center">
          <div className="size-14 rounded-2xl bg-muted flex items-center justify-center">
            <ImagePlus className="size-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Aucune réalisation</p>
            <p className="text-sm text-muted-foreground mt-1">Ajoutez vos premières photos avant/après</p>
          </div>
          <Button onClick={openCreate} variant="outline" className="gap-2 mt-2">
            <Plus className="size-4" /> Ajouter une réalisation
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className={cn("overflow-hidden border-border/70 transition-shadow hover:shadow-md", !item.published && "opacity-60")}>
              <BeforeAfterSlider before={item.beforeUrl} after={item.afterUrl} />
              <CardContent className="p-3 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{item.title}</p>
                    {item.tag && (
                      <Badge variant="secondary" className="mt-1 text-[10px] rounded-full">{item.tag}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleTogglePublish(item)}
                      disabled={isPending}
                      className={cn("size-7 rounded-lg flex items-center justify-center transition-colors", item.published ? "text-green-600 hover:bg-green-50" : "text-muted-foreground hover:bg-muted")}
                      title={item.published ? "Masquer" : "Publier"}
                    >
                      {item.published ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                    </button>
                    <button
                      onClick={() => openEdit(item)}
                      className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                      title="Modifier"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger className="size-7 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors" title="Supprimer">
                        <Trash2 className="size-3.5" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer la réalisation ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            &ldquo;{item.title}&rdquo; sera supprimé définitivement.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">{editing ? "Modifier la réalisation" : "Nouvelle réalisation"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-5 py-2">
            {/* Title + Tag */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="title">Titre <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  placeholder="ex : Cuisine après ménage"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tag">Tag / Service</Label>
                <Input
                  id="tag"
                  placeholder="ex : Ménage, Vitres…"
                  value={form.tag}
                  onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
                />
              </div>
            </div>

            {/* Image upload — before/after side by side */}
            <div className="grid sm:grid-cols-2 gap-4">
              <ImageUploadField
                label="Photo Avant *"
                preview={form.beforePreview}
                loading={uploadingBefore}
                onFile={(f) => uploadImage(f, "before")}
                onClear={() => setForm((f) => ({ ...f, beforeUrl: "", beforePreview: "" }))}
              />
              <ImageUploadField
                label="Photo Après *"
                preview={form.afterPreview}
                loading={uploadingAfter}
                onFile={(f) => uploadImage(f, "after")}
                onClear={() => setForm((f) => ({ ...f, afterUrl: "", afterPreview: "" }))}
              />
            </div>

            {/* Live before/after preview */}
            {form.beforePreview && form.afterPreview && (
              <div className="flex flex-col gap-2">
                <Label className="text-sm text-muted-foreground">Aperçu du slider</Label>
                <BeforeAfterSlider before={form.beforePreview} after={form.afterPreview} />
              </div>
            )}

            {/* Published toggle */}
            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Publié</p>
                <p className="text-xs text-muted-foreground">Visible sur la page Réalisations</p>
              </div>
              <Switch
                checked={form.published}
                onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving || uploadingBefore || uploadingAfter}>
              {saving ? "Enregistrement…" : editing ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
