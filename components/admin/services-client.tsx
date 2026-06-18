"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/components/providers/i18n-provider"
import {
  upsertServiceOverride,
  deleteServiceOverride,
  createCustomService,
  updateCustomService,
  deleteCustomService,
} from "@/lib/db/admin-actions"
import { services } from "@/lib/services"
import type { serviceOverrides, customServices } from "@/lib/db/schema"
import type { InferSelectModel } from "drizzle-orm"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import {
  Wrench,
  Pencil,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Tag,
  Layers,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Override = InferSelectModel<typeof serviceOverrides>
type CustomService = InferSelectModel<typeof customServices>

interface CustomPackageRow {
  id: string
  label: string
  price: string
}

interface Props {
  overrides: Override[]
  customServicesList: CustomService[]
}

export function AdminServicesClient({ overrides, customServicesList }: Props) {
  const { t } = useI18n()
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  // ── Built-in override state ──────────────────────────────────────────────
  const [editingBuiltin, setEditingBuiltin] = useState<string | null>(null)
  const [builtinForm, setBuiltinForm] = useState({
    nameOverride: "",
    descOverride: "",
    hourlyRate: "",
    fromLabel: "",
    active: true,
  })

  function getOverride(id: string) {
    return overrides.find((o) => o.id === id)
  }

  function openBuiltinEdit(serviceId: string) {
    const svc = services.find((s) => s.id === serviceId)
    const ovr = getOverride(serviceId)
    setBuiltinForm({
      nameOverride: ovr?.nameOverride ?? "",
      descOverride: ovr?.descOverride ?? "",
      hourlyRate: String(ovr?.data?.hourlyRate ?? svc?.hourly?.rate ?? ""),
      fromLabel: ovr?.data?.fromLabel ?? svc?.fromLabel ?? "",
      active: ovr?.data?.active !== false,
    })
    setEditingBuiltin(serviceId)
  }

  function handleBuiltinSave() {
    if (!editingBuiltin) return
    startTransition(async () => {
      await upsertServiceOverride(
        editingBuiltin,
        builtinForm.nameOverride || null,
        builtinForm.descOverride || null,
        {
          hourlyRate: builtinForm.hourlyRate ? Number(builtinForm.hourlyRate) : undefined,
          fromLabel: builtinForm.fromLabel || undefined,
          active: builtinForm.active,
        }
      )
      setEditingBuiltin(null)
      router.refresh()
    })
  }

  function handleBuiltinReset(id: string) {
    startTransition(async () => {
      await deleteServiceOverride(id)
      router.refresh()
    })
  }

  // ── Custom service state ─────────────────────────────────────────────────
  const [customDialog, setCustomDialog] = useState<"create" | string | null>(null)
  const [customForm, setCustomForm] = useState({
    name: "",
    description: "",
    fromLabel: "",
    hourlyRate: "",
    hourlyLabel: "l'heure",
    packagesTitle: "",
    taxEligible: false,
    active: true,
    sortOrder: "0",
  })
  const [packages, setPackages] = useState<CustomPackageRow[]>([])

  function openCreateCustom() {
    setCustomForm({
      name: "",
      description: "",
      fromLabel: "",
      hourlyRate: "",
      hourlyLabel: "l'heure",
      packagesTitle: "",
      taxEligible: false,
      active: true,
      sortOrder: String(customServicesList.length),
    })
    setPackages([])
    setCustomDialog("create")
  }

  function openEditCustom(svc: CustomService) {
    setCustomForm({
      name: svc.name,
      description: svc.description ?? "",
      fromLabel: svc.fromLabel ?? "",
      hourlyRate: svc.hourlyRate != null ? String(svc.hourlyRate) : "",
      hourlyLabel: svc.hourlyLabel ?? "l'heure",
      packagesTitle: svc.packagesTitle ?? "",
      taxEligible: svc.taxEligible,
      active: svc.active,
      sortOrder: String(svc.sortOrder),
    })
    setPackages(
      (svc.packages ?? []).map((p) => ({ id: p.id, label: p.label, price: String(p.price) }))
    )
    setCustomDialog(svc.id)
  }

  function addPackageRow() {
    setPackages((prev) => [...prev, { id: `pkg-${Date.now()}`, label: "", price: "" }])
  }

  function removePackageRow(idx: number) {
    setPackages((prev) => prev.filter((_, i) => i !== idx))
  }

  function updatePackageRow(idx: number, field: "label" | "price", value: string) {
    setPackages((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)))
  }

  function handleCustomSave() {
    startTransition(async () => {
      const pkgs = packages
        .filter((p) => p.label.trim())
        .map((p) => ({ id: p.id, label: p.label.trim(), price: Number(p.price) || 0 }))

      const payload = {
        name: customForm.name,
        description: customForm.description || undefined,
        icon: "Wrench",
        hourlyRate: customForm.hourlyRate ? Number(customForm.hourlyRate) : undefined,
        hourlyLabel: customForm.hourlyLabel || undefined,
        packages: pkgs.length ? pkgs : undefined,
        packagesTitle: customForm.packagesTitle || undefined,
        fromLabel: customForm.fromLabel || undefined,
        taxEligible: customForm.taxEligible,
        active: customForm.active,
        sortOrder: Number(customForm.sortOrder) || 0,
      }

      if (customDialog === "create") {
        await createCustomService(payload)
      } else if (typeof customDialog === "string") {
        await updateCustomService(customDialog, payload)
      }
      setCustomDialog(null)
      router.refresh()
    })
  }

  function handleDeleteCustom(id: string) {
    startTransition(async () => {
      await deleteCustomService(id)
      router.refresh()
    })
  }

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary">
          <Layers className="size-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold font-heading text-foreground">
            {t("admin.services.title")}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Gérez les tarifs et créez de nouveaux services
          </p>
        </div>
      </div>

      <Tabs defaultValue="builtin">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="builtin" className="flex-1 sm:flex-none gap-2">
            <Wrench className="size-3.5" />
            Services existants
            <Badge variant="secondary" className="ml-1 text-xs">{services.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex-1 sm:flex-none gap-2">
            <Plus className="size-3.5" />
            Mes services
            <Badge variant="secondary" className="ml-1 text-xs">{customServicesList.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* ── Built-in services ── */}
        <TabsContent value="builtin" className="mt-5">
          <p className="text-sm text-muted-foreground mb-4">
            Modifiez les prix et descriptions des services intégrés. Un point cyan indique un service personnalisé.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {services.map((svc) => {
              const ovr = getOverride(svc.id)
              const isActive = ovr?.data?.active !== false
              const isModified = !!ovr
              const Icon = svc.icon
              return (
                <Card
                  key={svc.id}
                  className={cn(
                    "relative transition-shadow hover:shadow-md border-border/70",
                    !isActive && "opacity-55"
                  )}
                >
                  {isModified && (
                    <span className="absolute top-3 right-3 size-2 rounded-full bg-accent" title="Modifié" />
                  )}
                  <CardHeader className="flex flex-row items-start gap-3 pb-2">
                    <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10 text-primary shrink-0">
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <CardTitle className="text-sm leading-snug">
                        {ovr?.nameOverride ?? t(svc.nameKey)}
                      </CardTitle>
                      <CardDescription className="text-xs line-clamp-2 mt-0.5">
                        {ovr?.descOverride ?? t(svc.descKey)}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Tag className="size-3 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">
                          {ovr?.data?.fromLabel ?? svc.fromLabel}
                        </span>
                        {svc.taxEligible && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-accent/40 text-accent">
                            -50%
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {ovr && (
                          <AlertDialog>
                            <AlertDialogTrigger className="inline-flex items-center justify-center size-7 rounded-md text-muted-foreground hover:bg-accent transition-colors" title="Réinitialiser">
                              <RotateCcw className="size-3.5" />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Réinitialiser ce service ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Les valeurs par défaut seront restaurées.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleBuiltinReset(svc.id)}>
                                  Réinitialiser
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        <Button variant="ghost" size="icon" className="size-7" onClick={() => openBuiltinEdit(svc.id)}>
                          <Pencil className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* ── Custom services ── */}
        <TabsContent value="custom" className="mt-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Créez vos propres services avec des tarifs personnalisés.
            </p>
            <Button onClick={openCreateCustom} size="sm" className="gap-2 shrink-0">
              <Plus className="size-4" />
              Nouveau service
            </Button>
          </div>

          {customServicesList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border rounded-xl text-center gap-3">
              <div className="flex items-center justify-center size-12 rounded-xl bg-muted text-muted-foreground">
                <Wrench className="size-6" />
              </div>
              <p className="text-sm font-medium text-foreground">Aucun service personnalisé</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Créez des services supplémentaires qui apparaîtront sur la page des tarifs.
              </p>
              <Button onClick={openCreateCustom} variant="outline" size="sm" className="mt-2 gap-2">
                <Plus className="size-4" />
                Créer un service
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {customServicesList.map((svc) => (
                <Card
                  key={svc.id}
                  className={cn(
                    "relative transition-shadow hover:shadow-md border-border/70",
                    !svc.active && "opacity-55"
                  )}
                >
                  <CardHeader className="flex flex-row items-start gap-3 pb-2">
                    <div className="flex items-center justify-center size-9 rounded-lg bg-accent/15 text-accent shrink-0">
                      <Wrench className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm leading-snug">{svc.name}</CardTitle>
                        {!svc.active && (
                          <Badge variant="outline" className="text-[10px]">Inactif</Badge>
                        )}
                      </div>
                      {svc.description && (
                        <CardDescription className="text-xs line-clamp-2 mt-0.5">
                          {svc.description}
                        </CardDescription>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        {svc.fromLabel && (
                          <div className="flex items-center gap-1">
                            <Tag className="size-3 text-muted-foreground" />
                            <span className="text-sm font-semibold text-foreground">{svc.fromLabel}</span>
                          </div>
                        )}
                        {svc.hourlyRate && (
                          <span className="text-xs text-muted-foreground">{svc.hourlyRate} €/h</span>
                        )}
                        {(svc.packages ?? []).length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {(svc.packages ?? []).length} forfait{(svc.packages ?? []).length > 1 ? "s" : ""}
                          </span>
                        )}
                        {svc.taxEligible && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-accent/40 text-accent">
                            -50%
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="size-7" onClick={() => openEditCustom(svc)}>
                          <Pencil className="size-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger className="inline-flex items-center justify-center size-7 rounded-md text-destructive hover:bg-destructive/10 transition-colors">
                            <Trash2 className="size-3.5" />
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer ce service ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                &quot;{svc.name}&quot; sera supprimé définitivement.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCustom(svc.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
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
        </TabsContent>
      </Tabs>

      {/* ── Built-in edit dialog ── */}
      <Dialog open={!!editingBuiltin} onOpenChange={(o) => !o && setEditingBuiltin(null)}>
        <DialogContent className="sm:max-w-md">
          {editingBuiltin && (() => {
            const svc = services.find((s) => s.id === editingBuiltin)!
            return (
              <>
                <DialogHeader>
                  <DialogTitle>Modifier : {t(svc.nameKey)}</DialogTitle>
                  <DialogDescription>Les champs vides conservent les valeurs par défaut.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-2">
                  <div className="flex flex-col gap-1.5">
                    <Label>Nom (override)</Label>
                    <Input
                      placeholder={t(svc.nameKey)}
                      value={builtinForm.nameOverride}
                      onChange={(e) => setBuiltinForm(f => ({ ...f, nameOverride: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Description (override)</Label>
                    <Textarea
                      rows={2}
                      placeholder={t(svc.descKey)}
                      value={builtinForm.descOverride}
                      onChange={(e) => setBuiltinForm(f => ({ ...f, descOverride: e.target.value }))}
                    />
                  </div>
                  {svc.hourly && (
                    <div className="flex flex-col gap-1.5">
                      <Label>Tarif horaire (€/h)</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder={String(svc.hourly.rate)}
                        value={builtinForm.hourlyRate}
                        onChange={(e) => setBuiltinForm(f => ({ ...f, hourlyRate: e.target.value }))}
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <Label>Libellé &quot;à partir de&quot;</Label>
                    <Input
                      placeholder={svc.fromLabel}
                      value={builtinForm.fromLabel}
                      onChange={(e) => setBuiltinForm(f => ({ ...f, fromLabel: e.target.value }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Service actif</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Visible sur la page des tarifs</p>
                    </div>
                    <Switch
                      checked={builtinForm.active}
                      onCheckedChange={(v) => setBuiltinForm(f => ({ ...f, active: v }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditingBuiltin(null)}>Annuler</Button>
                  <Button onClick={handleBuiltinSave} disabled={pending}>Enregistrer</Button>
                </DialogFooter>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* ── Custom create / edit dialog ── */}
      <Dialog open={customDialog !== null} onOpenChange={(o) => !o && setCustomDialog(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {customDialog === "create" ? "Nouveau service" : "Modifier le service"}
            </DialogTitle>
            <DialogDescription>
              Définissez le nom, la description, les tarifs et les forfaits.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label>Nom du service <span className="text-destructive">*</span></Label>
              <Input
                placeholder="Ex: Nettoyage de piscine"
                value={customForm.name}
                onChange={(e) => setCustomForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Description</Label>
              <Textarea
                rows={2}
                placeholder="Courte description du service…"
                value={customForm.description}
                onChange={(e) => setCustomForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Tarif horaire (€)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="30"
                  value={customForm.hourlyRate}
                  onChange={(e) => setCustomForm(f => ({ ...f, hourlyRate: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Libellé horaire</Label>
                <Input
                  placeholder="l'heure"
                  value={customForm.hourlyLabel}
                  onChange={(e) => setCustomForm(f => ({ ...f, hourlyLabel: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Prix affiché &quot;à partir de&quot;</Label>
              <Input
                placeholder="30 €/h"
                value={customForm.fromLabel}
                onChange={(e) => setCustomForm(f => ({ ...f, fromLabel: e.target.value }))}
              />
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Forfaits</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Prix fixes par type de prestation</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addPackageRow} className="gap-1.5">
                  <Plus className="size-3.5" />
                  Ajouter
                </Button>
              </div>

              {packages.length > 0 && (
                <div className="flex flex-col gap-2 mt-1">
                  <div className="grid grid-cols-[1fr_100px_32px] gap-2 text-xs text-muted-foreground px-1">
                    <span>Libellé (ex: Studio / T1)</span>
                    <span>Prix (€)</span>
                    <span />
                  </div>
                  {packages.map((pkg, idx) => (
                    <div key={pkg.id} className="grid grid-cols-[1fr_100px_32px] gap-2 items-center">
                      <Input
                        placeholder="T2"
                        value={pkg.label}
                        onChange={(e) => updatePackageRow(idx, "label", e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={pkg.price}
                        onChange={(e) => updatePackageRow(idx, "price", e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => removePackageRow(idx)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex flex-col gap-1.5 mt-1">
                    <Label className="text-xs">Titre de la section forfaits</Label>
                    <Input
                      placeholder="Ex: Nettoyage de printemps"
                      value={customForm.packagesTitle}
                      onChange={(e) => setCustomForm(f => ({ ...f, packagesTitle: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-accent" />
                  <div>
                    <Label>Crédit d&apos;impôt -50%</Label>
                    <p className="text-xs text-muted-foreground">Éligible au crédit d&apos;impôt domicile</p>
                  </div>
                </div>
                <Switch
                  checked={customForm.taxEligible}
                  onCheckedChange={(v) => setCustomForm(f => ({ ...f, taxEligible: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Service actif</Label>
                  <p className="text-xs text-muted-foreground">Visible sur la page des tarifs</p>
                </div>
                <Switch
                  checked={customForm.active}
                  onCheckedChange={(v) => setCustomForm(f => ({ ...f, active: v }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCustomDialog(null)}>Annuler</Button>
            <Button onClick={handleCustomSave} disabled={pending || !customForm.name.trim()}>
              {customDialog === "create" ? "Créer le service" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
