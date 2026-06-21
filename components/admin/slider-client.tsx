"use client"

import { useState, useTransition, useRef } from "react"
import Image from "next/image"
import {
  Plus, Trash2, Save, X, GripVertical, Eye, EyeOff,
  Upload, Sparkles, ChevronUp, ChevronDown, Pencil
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  createSliderSlide,
  updateSliderSlide,
  deleteSliderSlide,
  reorderSliderSlides,
} from "@/lib/db/admin-actions"

type Slide = {
  id: number
  imageUrl: string
  labelFr: string
  labelEn: string
  labelAr: string
  tag: string
  ctaLabelFr: string | null
  ctaLabelEn: string | null
  ctaLabelAr: string | null
  ctaHref: string | null
  active: boolean
  sortOrder: number
}

const TAG_OPTIONS = ["service", "france", "before", "after", "promo"]
const TAG_COLORS: Record<string, string> = {
  service: "bg-primary text-primary-foreground",
  france:  "bg-red-600 text-white",
  before:  "bg-zinc-700 text-white",
  after:   "bg-teal-600 text-white",
  promo:   "bg-amber-400 text-black",
}

const EMPTY_FORM = {
  imageUrl: "", labelFr: "", labelEn: "", labelAr: "",
  tag: "service", ctaLabelFr: "", ctaLabelEn: "", ctaLabelAr: "", ctaHref: "",
}

export function AdminSliderClient({ slides: initial }: { slides: Slide[] }) {
  const [slides, setSlides] = useState<Slide[]>(initial)
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM })
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ ...EMPTY_FORM })
  const [uploading, setUploading] = useState(false)
  const [addUploading, setAddUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [isPending, startTransition] = useTransition()
  const editFileRef = useRef<HTMLInputElement>(null)
  const addFileRef  = useRef<HTMLInputElement>(null)

  /* ── upload helper ─────────────────────────────────── */
  async function uploadFile(file: File, onUrl: (url: string) => void, setLoading: (v: boolean) => void) {
    setLoading(true)
    try {
      const fd = new FormData(); fd.append("file", file)
      const res = await fetch("/api/upload-image", { method: "POST", body: fd })
      const { url } = await res.json()
      onUrl(url)
    } finally { setLoading(false) }
  }

  /* ── AI generate helper ────────────────────────────── */
  async function generateImage(prompt: string, onUrl: (url: string) => void) {
    setGenerating(true)
    try {
      const res = await fetch("/api/generate-service-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })
      const { url } = await res.json()
      onUrl(url)
    } finally { setGenerating(false) }
  }

  /* ── reorder ──────────────────────────────────────── */
  function move(id: number, dir: -1 | 1) {
    const arr = [...slides]
    const idx = arr.findIndex((s) => s.id === id)
    const swap = idx + dir
    if (swap < 0 || swap >= arr.length) return
    ;[arr[idx], arr[swap]] = [arr[swap], arr[idx]]
    setSlides(arr)
    startTransition(async () => { await reorderSliderSlides(arr.map((s) => s.id)) })
  }

  /* ── toggle active ────────────────────────────────── */
  function toggleActive(slide: Slide) {
    startTransition(async () => {
      await updateSliderSlide(slide.id, { active: !slide.active })
      setSlides((prev) => prev.map((s) => s.id === slide.id ? { ...s, active: !s.active } : s))
    })
  }

  /* ── edit ─────────────────────────────────────────── */
  function startEdit(s: Slide) {
    setEditId(s.id)
    setEditForm({
      imageUrl: s.imageUrl, labelFr: s.labelFr, labelEn: s.labelEn, labelAr: s.labelAr,
      tag: s.tag, ctaLabelFr: s.ctaLabelFr ?? "", ctaLabelEn: s.ctaLabelEn ?? "",
      ctaLabelAr: s.ctaLabelAr ?? "", ctaHref: s.ctaHref ?? "",
    })
  }

  function saveEdit(id: number) {
    startTransition(async () => {
      await updateSliderSlide(id, {
        imageUrl: editForm.imageUrl,
        labelFr: editForm.labelFr, labelEn: editForm.labelEn, labelAr: editForm.labelAr,
        tag: editForm.tag,
        ctaLabelFr: editForm.ctaLabelFr || null,
        ctaLabelEn: editForm.ctaLabelEn || null,
        ctaLabelAr: editForm.ctaLabelAr || null,
        ctaHref: editForm.ctaHref || null,
      } as Parameters<typeof updateSliderSlide>[1])
      setSlides((prev) => prev.map((s) => s.id === id ? { ...s, ...editForm, ctaLabelFr: editForm.ctaLabelFr || null, ctaLabelEn: editForm.ctaLabelEn || null, ctaLabelAr: editForm.ctaLabelAr || null, ctaHref: editForm.ctaHref || null } : s))
      setEditId(null)
    })
  }

  /* ── delete ───────────────────────────────────────── */
  function handleDelete(id: number) {
    if (!confirm("Supprimer cette slide ?")) return
    startTransition(async () => {
      await deleteSliderSlide(id)
      setSlides((prev) => prev.filter((s) => s.id !== id))
    })
  }

  /* ── add ──────────────────────────────────────────── */
  function handleAdd() {
    if (!addForm.imageUrl) return
    startTransition(async () => {
      const row = await createSliderSlide({
        ...addForm,
        ctaLabelFr: addForm.ctaLabelFr || undefined,
        ctaLabelEn: addForm.ctaLabelEn || undefined,
        ctaLabelAr: addForm.ctaLabelAr || undefined,
        ctaHref: addForm.ctaHref || undefined,
        sortOrder: slides.length,
      })
      setSlides((prev) => [...prev, row])
      setAddForm({ ...EMPTY_FORM })
      setShowAdd(false)
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Gestion du slider</h1>
        <p className="text-sm text-muted-foreground">
          Ajoutez, modifiez, réorganisez et activez/désactivez les slides de la page d&apos;accueil.
        </p>
      </div>

      {/* Add button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowAdd((v) => !v)} className="gap-2">
          <Plus className="h-4 w-4" /> Nouvelle slide
        </Button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
          <h3 className="mb-4 font-semibold text-foreground">Nouvelle slide</h3>
          <SlideForm
            form={addForm} setForm={setAddForm}
            fileRef={addFileRef}
            uploading={addUploading}
            onUpload={(f) => uploadFile(f, (url) => setAddForm((prev) => ({ ...prev, imageUrl: url })), setAddUploading)}
            aiPrompt={aiPrompt} setAiPrompt={setAiPrompt}
            generating={generating}
            onGenerate={() => generateImage(aiPrompt || addForm.labelFr || "cleaning service", (url) => setAddForm((p) => ({ ...p, imageUrl: url })))}
          />
          <div className="mt-4 flex gap-2">
            <Button onClick={handleAdd} disabled={isPending || !addForm.imageUrl} size="sm" className="gap-2">
              <Save className="h-4 w-4" /> Enregistrer
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setShowAdd(false); setAddForm({ ...EMPTY_FORM }) }}>
              <X className="h-4 w-4" /> Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{slides.length}</span> slides ·{" "}
        <span className="font-medium text-green-600">{slides.filter((s) => s.active).length}</span> actives
      </p>

      {/* Slides list */}
      <div className="flex flex-col gap-3">
        {slides.length === 0 && (
          <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
            Aucune slide. Cliquez sur &quot;Nouvelle slide&quot; pour commencer.
          </div>
        )}
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={cn(
              "overflow-hidden rounded-xl border border-border bg-card transition-opacity",
              !slide.active && "opacity-50",
            )}
          >
            {editId === slide.id ? (
              <div className="p-5">
                <SlideForm
                  form={editForm} setForm={setEditForm}
                  fileRef={editFileRef}
                  uploading={uploading}
                  onUpload={(f) => uploadFile(f, (url) => setEditForm((p) => ({ ...p, imageUrl: url })), setUploading)}
                  aiPrompt={aiPrompt} setAiPrompt={setAiPrompt}
                  generating={generating}
                  onGenerate={() => generateImage(aiPrompt || editForm.labelFr || "cleaning service", (url) => setEditForm((p) => ({ ...p, imageUrl: url })))}
                />
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => saveEdit(slide.id)} disabled={isPending} size="sm" className="gap-2">
                    <Save className="h-4 w-4" /> Sauver
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditId(null)}>
                    <X className="h-4 w-4" /> Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3">
                {/* Thumbnail */}
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary">
                  <Image src={slide.imageUrl} alt={slide.labelFr || "slide"} fill className="object-cover" sizes="96px" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", TAG_COLORS[slide.tag] ?? "bg-secondary text-foreground")}>
                      {slide.tag}
                    </span>
                    <Badge variant={slide.active ? "default" : "secondary"} className="text-xs">
                      {slide.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="truncate text-sm font-medium text-foreground">{slide.labelFr || slide.labelEn || "—"}</p>
                  {slide.ctaHref && (
                    <p className="truncate text-xs text-muted-foreground">{slide.ctaHref}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => move(slide.id, -1)} disabled={idx === 0 || isPending}>
                      <ChevronUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => move(slide.id, 1)} disabled={idx === slides.length - 1 || isPending}>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toggleActive(slide)} disabled={isPending} title={slide.active ? "Désactiver" : "Activer"}>
                      {slide.active ? <Eye className="h-3.5 w-3.5 text-green-600" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(slide)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(slide.id)} disabled={isPending}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Reusable slide form ─────────────────────────────────────────────────── */
function SlideForm({
  form, setForm, fileRef, uploading, onUpload, aiPrompt, setAiPrompt, generating, onGenerate,
}: {
  form: Record<string, string>
  setForm: React.Dispatch<React.SetStateAction<Record<string, string>>>
  fileRef: React.RefObject<HTMLInputElement | null>
  uploading: boolean
  onUpload: (f: File) => void
  aiPrompt: string
  setAiPrompt: (v: string) => void
  generating: boolean
  onGenerate: () => void
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Image picker */}
      <div className="flex flex-col gap-2">
        <Label>Image</Label>
        <div className="flex flex-wrap gap-2">
          {form.imageUrl && (
            <div className="relative h-20 w-32 overflow-hidden rounded-lg border border-border">
              <Image src={form.imageUrl} alt="preview" fill className="object-cover" sizes="128px" />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Button
              type="button" variant="outline" size="sm" className="gap-2"
              onClick={() => fileRef.current?.click()} disabled={uploading}
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Envoi..." : "Depuis la galerie"}
            </Button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f) }}
            />
            <div className="flex gap-2">
              <Input
                placeholder="Décrire l'image à générer avec l'IA..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="h-8 text-xs"
              />
              <Button type="button" variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={onGenerate} disabled={generating}>
                <Sparkles className="h-3.5 w-3.5" />
                {generating ? "Génération..." : "IA"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tag */}
      <div className="flex flex-col gap-1.5">
        <Label>Type de slide</Label>
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map((t) => (
            <button
              key={t} type="button"
              onClick={() => setForm((f) => ({ ...f, tag: t }))}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold transition-all",
                form.tag === t ? TAG_COLORS[t] : "bg-secondary text-muted-foreground hover:bg-secondary/80",
              )}
            >{t}</button>
          ))}
        </div>
      </div>

      {/* Labels */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label>Titre FR</Label>
          <Input value={form.labelFr} onChange={(e) => setForm((f) => ({ ...f, labelFr: e.target.value }))} placeholder="Titre en français" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Titre EN</Label>
          <Input value={form.labelEn} onChange={(e) => setForm((f) => ({ ...f, labelEn: e.target.value }))} placeholder="Title in English" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Titre AR</Label>
          <Input value={form.labelAr} onChange={(e) => setForm((f) => ({ ...f, labelAr: e.target.value }))} placeholder="العنوان بالعربية" dir="rtl" />
        </div>
      </div>

      {/* CTA */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label>Bouton CTA FR</Label>
          <Input value={form.ctaLabelFr} onChange={(e) => setForm((f) => ({ ...f, ctaLabelFr: e.target.value }))} placeholder="ex: Réserver maintenant" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Lien du bouton</Label>
          <Input value={form.ctaHref} onChange={(e) => setForm((f) => ({ ...f, ctaHref: e.target.value }))} placeholder="ex: /commande" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Bouton CTA EN</Label>
          <Input value={form.ctaLabelEn} onChange={(e) => setForm((f) => ({ ...f, ctaLabelEn: e.target.value }))} placeholder="ex: Book now" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Bouton CTA AR</Label>
          <Input value={form.ctaLabelAr} onChange={(e) => setForm((f) => ({ ...f, ctaLabelAr: e.target.value }))} placeholder="مثال: احجز الآن" dir="rtl" />
        </div>
      </div>
    </div>
  )
}
