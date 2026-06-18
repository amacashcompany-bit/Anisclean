"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/components/providers/i18n-provider"
import {
  upsertServiceOverride,
  deleteServiceOverride,
} from "@/lib/db/admin-actions"
import { services } from "@/lib/services"
import type { serviceOverrides } from "@/lib/db/schema"
import type { InferSelectModel } from "drizzle-orm"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
import { Wrench, Pencil, RotateCcw } from "lucide-react"

type Override = InferSelectModel<typeof serviceOverrides>

interface Props {
  overrides: Override[]
}

export function AdminServicesClient({ overrides }: Props) {
  const { t } = useI18n()
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState({
    nameOverride: "",
    descOverride: "",
    hourlyRate: "",
    fromLabel: "",
    active: true,
  })

  function getOverride(id: string) {
    return overrides.find((o) => o.id === id)
  }

  function openEdit(serviceId: string) {
    const svc = services.find((s) => s.id === serviceId)
    const ovr = getOverride(serviceId)
    setForm({
      nameOverride: ovr?.nameOverride ?? "",
      descOverride: ovr?.descOverride ?? "",
      hourlyRate: String(ovr?.data?.hourlyRate ?? svc?.hourly?.rate ?? ""),
      fromLabel: ovr?.data?.fromLabel ?? svc?.fromLabel ?? "",
      active: ovr?.data?.active !== false,
    })
    setEditing(serviceId)
  }

  function handleSave() {
    if (!editing) return
    startTransition(async () => {
      await upsertServiceOverride(
        editing,
        form.nameOverride || null,
        form.descOverride || null,
        {
          hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
          fromLabel: form.fromLabel || undefined,
          active: form.active,
        }
      )
      setEditing(null)
      router.refresh()
    })
  }

  function handleReset(id: string) {
    startTransition(async () => {
      await deleteServiceOverride(id)
      router.refresh()
    })
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Wrench className="size-6 text-primary" />
        <h1 className="text-2xl font-semibold">{t("admin.services.title")}</h1>
      </div>

      {/* Service cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {services.map((svc) => {
          const ovr = getOverride(svc.id)
          const isActive = ovr?.data?.active !== false
          const Icon = svc.icon
          return (
            <Card key={svc.id} className={!isActive ? "opacity-50" : ""}>
              <CardHeader className="flex flex-row items-start gap-3 pb-2">
                <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm">
                    {ovr?.nameOverride ?? t(svc.nameKey)}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2 mt-0.5">
                    {ovr?.descOverride ?? t(svc.descKey)}
                  </CardDescription>
                </div>
                {!isActive && <Badge variant="outline" className="shrink-0">Inactif</Badge>}
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-muted-foreground">Prix : </span>
                  <span className="font-semibold">{ovr?.data?.fromLabel ?? svc.fromLabel}</span>
                </div>
                <div className="flex items-center gap-1">
                  {ovr && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                          <RotateCcw className="size-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Réinitialiser</AlertDialogTitle>
                          <AlertDialogDescription>{t("admin.services.resetConfirm")}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("admin.cancel")}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleReset(svc.id)}>
                            {t("admin.confirm")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(svc.id)}>
                    <Pencil className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          {editing && (() => {
            const svc = services.find((s) => s.id === editing)!
            return (
              <>
                <DialogHeader>
                  <DialogTitle>Modifier : {t(svc.nameKey)}</DialogTitle>
                  <DialogDescription>Les champs vides utilisent les valeurs par défaut.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-2">
                  <div className="flex flex-col gap-1.5">
                    <Label>{t("admin.services.nameOverride")}</Label>
                    <Input
                      placeholder={t(svc.nameKey)}
                      value={form.nameOverride}
                      onChange={(e) => setForm(f => ({ ...f, nameOverride: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>{t("admin.services.descOverride")}</Label>
                    <Textarea
                      rows={2}
                      placeholder={t(svc.descKey)}
                      value={form.descOverride}
                      onChange={(e) => setForm(f => ({ ...f, descOverride: e.target.value }))}
                    />
                  </div>
                  {svc.hourly && (
                    <div className="flex flex-col gap-1.5">
                      <Label>{t("admin.services.hourlyRate")}</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder={String(svc.hourly.rate)}
                        value={form.hourlyRate}
                        onChange={(e) => setForm(f => ({ ...f, hourlyRate: e.target.value }))}
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <Label>{t("admin.services.fromLabel")}</Label>
                    <Input
                      placeholder={svc.fromLabel}
                      value={form.fromLabel}
                      onChange={(e) => setForm(f => ({ ...f, fromLabel: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>{t("admin.services.active")}</Label>
                    <Switch
                      checked={form.active}
                      onCheckedChange={(checked) => setForm(f => ({ ...f, active: checked }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditing(null)}>{t("admin.cancel")}</Button>
                  <Button onClick={handleSave} disabled={pending}>{t("admin.save")}</Button>
                </DialogFooter>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
