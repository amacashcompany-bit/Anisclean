"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/components/providers/i18n-provider"
import {
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "@/lib/db/admin-actions"
import type { appointments } from "@/lib/db/schema"
import type { InferSelectModel } from "drizzle-orm"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Separator } from "@/components/ui/separator"
import { CalendarDays, Plus, ChevronLeft, ChevronRight, Trash2, Pencil, RefreshCw } from "lucide-react"

type Appointment = InferSelectModel<typeof appointments>

interface Props {
  appointments: Appointment[]
}

const DAYS_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
]

const STATUS_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  scheduled: "secondary",
  completed: "default",
  canceled: "destructive",
}

type ApptStatus = "scheduled" | "completed" | "canceled"
type ApptType = "one_time" | "recurring"

function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

export function AdminScheduleClient({ appointments }: Props) {
  const { t } = useI18n()
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  // Calendar state
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  // Modal
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Appointment | null>(null)

  // Form
  const emptyForm = {
    clientName: "",
    clientPhone: "",
    serviceLabel: "",
    date: isoDate(now.getFullYear(), now.getMonth(), now.getDate()),
    startTime: "",
    endTime: "",
    notes: "",
    type: "one_time" as ApptType,
    freq: "weekly" as "weekly" | "biweekly" | "monthly",
  }
  const [form, setForm] = useState(emptyForm)

  function statusLabel(s: string) {
    const m: Record<string, string> = {
      scheduled: t("admin.schedule.scheduled"),
      completed: t("admin.schedule.completed"),
      canceled: t("admin.schedule.canceled"),
    }
    return m[s] ?? s
  }

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  function appointmentsOnDay(day: number) {
    const d = isoDate(year, month, day)
    return appointments.filter((a) => a.date === d)
  }

  function openCreate(day?: number) {
    setForm({
      ...emptyForm,
      date: day ? isoDate(year, month, day) : emptyForm.date,
    })
    setCreating(true)
  }

  function openEdit(appt: Appointment) {
    setForm({
      clientName: appt.clientName,
      clientPhone: appt.clientPhone ?? "",
      serviceLabel: appt.serviceLabel,
      date: appt.date,
      startTime: appt.startTime ?? "",
      endTime: appt.endTime ?? "",
      notes: appt.notes ?? "",
      type: appt.type as ApptType,
      freq: (appt.recurringRule?.freq ?? "weekly") as "weekly" | "biweekly" | "monthly",
    })
    setEditing(appt)
  }

  function handleSave() {
    startTransition(async () => {
      const recurringRule = form.type === "recurring" ? { freq: form.freq } : undefined
      if (editing) {
        await updateAppointment(editing.id, {
          clientName: form.clientName,
          clientPhone: form.clientPhone || undefined,
          serviceLabel: form.serviceLabel,
          date: form.date,
          startTime: form.startTime || undefined,
          endTime: form.endTime || undefined,
          notes: form.notes || undefined,
          type: form.type,
          recurringRule,
        })
        setEditing(null)
      } else {
        await createAppointment({
          clientName: form.clientName,
          clientPhone: form.clientPhone || undefined,
          serviceLabel: form.serviceLabel,
          date: form.date,
          startTime: form.startTime || undefined,
          endTime: form.endTime || undefined,
          notes: form.notes || undefined,
          type: form.type,
          recurringRule,
        })
        setCreating(false)
      }
      router.refresh()
    })
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      await deleteAppointment(id)
      router.refresh()
    })
  }

  function handleStatusChange(appt: Appointment, status: ApptStatus) {
    startTransition(async () => {
      await updateAppointment(appt.id, { status })
      router.refresh()
    })
  }

  const isFormOpen = creating || !!editing

  // Group recurring appointments
  const recurringAppts = appointments.filter((a) => a.type === "recurring")

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <CalendarDays className="size-6 text-primary" />
        <h1 className="text-2xl font-semibold">{t("admin.schedule.title")}</h1>
        <Button size="sm" className="ml-auto gap-2" onClick={() => openCreate()}>
          <Plus className="size-4" />
          {t("admin.schedule.newAppt")}
        </Button>
      </div>

      {/* Calendar */}
      <Card>
        <CardContent className="pt-4">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="size-4" />
            </Button>
            <p className="font-semibold text-base">
              {MONTHS_FR[month]} {year}
            </p>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="size-4" />
            </Button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS_FR.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-muted/20 min-h-[70px]" />
            ))}
            {/* Day cells */}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const dayAppts = appointmentsOnDay(day)
              const isToday =
                day === now.getDate() &&
                month === now.getMonth() &&
                year === now.getFullYear()
              return (
                <div
                  key={day}
                  className="bg-card min-h-[70px] p-1 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => openCreate(day)}
                >
                  <div className={`text-xs font-medium mb-1 size-5 flex items-center justify-center rounded-full ${isToday ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
                    {day}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {dayAppts.slice(0, 2).map((a) => (
                      <div
                        key={a.id}
                        className="text-[10px] leading-tight rounded px-1 py-0.5 bg-primary/10 text-primary truncate cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); openEdit(a) }}
                      >
                        {a.startTime ? `${a.startTime} ` : ""}{a.clientName}
                      </div>
                    ))}
                    {dayAppts.length > 2 && (
                      <div className="text-[10px] text-muted-foreground px-1">+{dayAppts.length - 2}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Appointments list */}
      <Card>
        <CardContent className="p-0">
          <div className="px-4 py-3 border-b border-border">
            <p className="font-semibold text-sm">Tous les rendez-vous ({appointments.length})</p>
          </div>
          {appointments.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-12">{t("admin.noData")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-2 font-medium text-muted-foreground">{t("admin.schedule.date")}</th>
                    <th className="px-4 py-2 font-medium text-muted-foreground">{t("admin.schedule.client")}</th>
                    <th className="px-4 py-2 font-medium text-muted-foreground">{t("admin.schedule.service")}</th>
                    <th className="px-4 py-2 font-medium text-muted-foreground">{t("admin.schedule.type")}</th>
                    <th className="px-4 py-2 font-medium text-muted-foreground">{t("admin.status")}</th>
                    <th className="px-4 py-2 font-medium text-muted-foreground text-right">{t("admin.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a) => (
                    <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-2.5">
                        <p>{new Date(a.date).toLocaleDateString("fr-FR")}</p>
                        {a.startTime && <p className="text-xs text-muted-foreground">{a.startTime}{a.endTime ? ` – ${a.endTime}` : ""}</p>}
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="font-medium">{a.clientName}</p>
                        {a.clientPhone && <p className="text-xs text-muted-foreground">{a.clientPhone}</p>}
                      </td>
                      <td className="px-4 py-2.5">{a.serviceLabel}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          {a.type === "recurring" && <RefreshCw className="size-3 text-muted-foreground" />}
                          <span className="text-xs">
                            {a.type === "recurring" ? t("admin.schedule.recurring") : t("admin.schedule.one_time")}
                          </span>
                          {a.type === "recurring" && a.recurringRule && (
                            <span className="text-xs text-muted-foreground">
                              ({t(`admin.schedule.freq.${a.recurringRule.freq}`)})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <Select
                          value={a.status}
                          onValueChange={(v) => v && handleStatusChange(a, v as ApptStatus)}
                          disabled={pending}
                        >
                          <SelectTrigger className="h-7 text-xs w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scheduled">{t("admin.schedule.scheduled")}</SelectItem>
                            <SelectItem value="completed">{t("admin.schedule.completed")}</SelectItem>
                            <SelectItem value="canceled">{t("admin.schedule.canceled")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="size-7" onClick={() => openEdit(a)}>
                            <Pencil className="size-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger className="inline-flex items-center justify-center size-7 rounded-lg text-destructive hover:bg-accent transition-colors">
                              <Trash2 className="size-3.5" />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t("admin.delete")}</AlertDialogTitle>
                                <AlertDialogDescription>{t("admin.schedule.deleteConfirm")}</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t("admin.cancel")}</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDelete(a.id)}
                                >
                                  {t("admin.delete")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recurring rules summary */}
      {recurringAppts.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw className="size-4 text-primary" />
              <p className="font-semibold text-sm">Règles récurrentes ({recurringAppts.length})</p>
            </div>
            <div className="flex flex-col gap-2">
              {recurringAppts.map((a) => (
                <div key={a.id} className="flex items-center gap-3 text-sm bg-muted/30 px-3 py-2 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{a.clientName} — {a.serviceLabel}</p>
                    {a.recurringRule && (
                      <p className="text-xs text-muted-foreground">
                        {t(`admin.schedule.freq.${a.recurringRule.freq}`)}
                      </p>
                    )}
                  </div>
                  <Badge variant={STATUS_BADGE[a.status]}>{statusLabel(a.status)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={isFormOpen} onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null) } }}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? t("admin.edit") : t("admin.schedule.newAppt")}</DialogTitle>
            <DialogDescription>Renseignez les détails du rendez-vous.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label>{t("admin.schedule.client")} *</Label>
                <Input value={form.clientName} onChange={(e) => setForm(f => ({ ...f, clientName: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>{t("admin.phone")}</Label>
                <Input value={form.clientPhone} onChange={(e) => setForm(f => ({ ...f, clientPhone: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>{t("admin.schedule.service")} *</Label>
                <Input value={form.serviceLabel} onChange={(e) => setForm(f => ({ ...f, serviceLabel: e.target.value }))} />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label>{t("admin.schedule.date")} *</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Début</Label>
                <Input type="time" value={form.startTime} onChange={(e) => setForm(f => ({ ...f, startTime: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Fin</Label>
                <Input type="time" value={form.endTime} onChange={(e) => setForm(f => ({ ...f, endTime: e.target.value }))} />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label>{t("admin.schedule.type")}</Label>
                <Select value={form.type} onValueChange={(v) => v && setForm(f => ({ ...f, type: v as ApptType }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_time">{t("admin.schedule.one_time")}</SelectItem>
                    <SelectItem value="recurring">{t("admin.schedule.recurring")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.type === "recurring" && (
                <div className="col-span-2 flex flex-col gap-1.5">
                  <Label>Fréquence</Label>
                  <Select value={form.freq} onValueChange={(v) => v && setForm(f => ({ ...f, freq: v as typeof form.freq }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">{t("admin.schedule.freq.weekly")}</SelectItem>
                      <SelectItem value="biweekly">{t("admin.schedule.freq.biweekly")}</SelectItem>
                      <SelectItem value="monthly">{t("admin.schedule.freq.monthly")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label>{t("admin.notes")}</Label>
                <Textarea rows={2} value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreating(false); setEditing(null) }}>{t("admin.cancel")}</Button>
            <Button onClick={handleSave} disabled={pending || !form.clientName || !form.serviceLabel || !form.date}>
              {t("admin.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
