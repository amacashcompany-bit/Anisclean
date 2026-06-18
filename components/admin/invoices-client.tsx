"use client"

import { useState, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/components/providers/i18n-provider"
import {
  createInvoice,
  deleteInvoice,
  markInvoiceSent,
  updateInvoice,
} from "@/lib/db/admin-actions"
import type { invoices } from "@/lib/db/schema"
import type { InferSelectModel } from "drizzle-orm"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  FileText,
  Plus,
  Trash2,
  Download,
  Send,
  CheckCircle,
  Search,
  X,
} from "lucide-react"
import { getSiteSettings } from "@/lib/db/admin-actions"

type Invoice = InferSelectModel<typeof invoices>

interface Props {
  invoices: Invoice[]
}

const STATUS_BADGE: Record<string, "outline" | "secondary" | "default"> = {
  draft: "outline",
  sent: "secondary",
  paid: "default",
}

export function AdminInvoicesClient({ invoices }: Props) {
  const { t } = useI18n()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [search, setSearch] = useState("")
  const [creating, setCreating] = useState(false)
  const [viewing, setViewing] = useState<Invoice | null>(null)
  const [downloading, setDownloading] = useState<number | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  // New invoice form state
  const [newForm, setNewForm] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
    notes: "",
    itemDesc: "",
    itemQty: "1",
    itemPrice: "",
  })
  const [newItems, setNewItems] = useState<
    { description: string; qty: number; unitPrice: number; amount: number }[]
  >([])

  function statusLabel(s: string) {
    const m: Record<string, string> = {
      draft: t("admin.invoices.draft"),
      sent: t("admin.invoices.sent"),
      paid: t("admin.invoices.paid"),
    }
    return m[s] ?? s
  }

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase()
    return (
      !q ||
      inv.clientName.toLowerCase().includes(q) ||
      inv.number.toLowerCase().includes(q) ||
      (inv.clientEmail ?? "").toLowerCase().includes(q)
    )
  })

  function addItem() {
    const qty = Number(newForm.itemQty) || 1
    const unitPrice = Number(newForm.itemPrice) || 0
    if (!newForm.itemDesc || !unitPrice) return
    setNewItems((prev) => [
      ...prev,
      { description: newForm.itemDesc, qty, unitPrice, amount: qty * unitPrice },
    ])
    setNewForm((f) => ({ ...f, itemDesc: "", itemQty: "1", itemPrice: "" }))
  }

  function removeItem(i: number) {
    setNewItems((prev) => prev.filter((_, idx) => idx !== i))
  }

  const subtotal = newItems.reduce((s, i) => s + i.amount, 0)
  const taxCredit = 0
  const total = subtotal - taxCredit

  function handleCreate() {
    if (!newForm.clientName || newItems.length === 0) return
    startTransition(async () => {
      await createInvoice({
        clientName: newForm.clientName,
        clientEmail: newForm.clientEmail || undefined,
        clientPhone: newForm.clientPhone || undefined,
        clientAddress: newForm.clientAddress || undefined,
        items: newItems,
        subtotal,
        taxCredit,
        total,
        notes: newForm.notes || undefined,
      })
      setCreating(false)
      setNewForm({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        clientAddress: "",
        notes: "",
        itemDesc: "",
        itemQty: "1",
        itemPrice: "",
      })
      setNewItems([])
      router.refresh()
    })
  }

  function handleMarkSent(id: number) {
    startTransition(async () => {
      await markInvoiceSent(id)
      router.refresh()
    })
  }

  function handleMarkPaid(id: number) {
    startTransition(async () => {
      await updateInvoice(id, { status: "paid" })
      router.refresh()
    })
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      await deleteInvoice(id)
      router.refresh()
    })
  }

  async function handleDownload(inv: Invoice) {
    setDownloading(inv.id)
    try {
      const settings = await getSiteSettings()
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF({ unit: "mm", format: "a4" })

      const companyName = settings["companyName"] ?? "Sanadclean"
      const companyAddress = settings["companyAddress"] ?? ""
      const companyPhone = settings["companyPhone"] ?? ""
      const companyEmail = settings["companyEmail"] ?? ""

      // Header
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text("FACTURE", 20, 25)
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(companyName, 140, 20)
      if (companyAddress) doc.text(companyAddress, 140, 26)
      if (companyPhone) doc.text(companyPhone, 140, 32)
      if (companyEmail) doc.text(companyEmail, 140, 38)

      // Invoice meta
      doc.setFontSize(11)
      doc.text(`N° ${inv.number}`, 20, 38)
      doc.text(`Date: ${new Date(inv.createdAt).toLocaleDateString("fr-FR")}`, 20, 44)

      // Bill to
      doc.setFont("helvetica", "bold")
      doc.text("Facturé à :", 20, 56)
      doc.setFont("helvetica", "normal")
      doc.text(inv.clientName, 20, 62)
      if (inv.clientEmail) doc.text(inv.clientEmail, 20, 68)
      if (inv.clientPhone) doc.text(inv.clientPhone, 20, 74)
      if (inv.clientAddress) doc.text(inv.clientAddress, 20, 80)

      // Table header
      const tableTop = 92
      doc.setFillColor(240, 240, 240)
      doc.rect(20, tableTop - 6, 170, 8, "F")
      doc.setFont("helvetica", "bold")
      doc.setFontSize(9)
      doc.text("Prestation", 22, tableTop)
      doc.text("Qté", 120, tableTop)
      doc.text("P.U.", 135, tableTop)
      doc.text("Montant", 160, tableTop)

      // Table rows
      doc.setFont("helvetica", "normal")
      let y = tableTop + 8
      inv.items.forEach((item) => {
        doc.text(item.description.slice(0, 55), 22, y)
        doc.text(String(item.qty), 120, y)
        doc.text(`${item.unitPrice.toFixed(2)} €`, 135, y)
        doc.text(`${item.amount.toFixed(2)} €`, 160, y)
        y += 7
      })

      // Totals
      y += 4
      doc.line(20, y, 190, y)
      y += 6
      doc.text("Sous-total", 120, y)
      doc.text(`${inv.subtotal.toFixed(2)} €`, 160, y)
      if (inv.taxCredit > 0) {
        y += 6
        doc.text("Crédit d'impôt (50 %)", 120, y)
        doc.text(`-${inv.taxCredit.toFixed(2)} €`, 160, y)
      }
      y += 6
      doc.setFont("helvetica", "bold")
      doc.text("TOTAL", 120, y)
      doc.text(`${inv.total.toFixed(2)} €`, 160, y)

      // Notes
      if (inv.notes) {
        y += 14
        doc.setFont("helvetica", "italic")
        doc.setFontSize(8)
        doc.text(inv.notes, 20, y)
      }

      doc.save(`facture-${inv.number}.pdf`)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileText className="size-6 text-primary" />
        <h1 className="text-2xl font-semibold">{t("admin.invoices.title")}</h1>
        <Badge variant="secondary" className="ml-auto">{invoices.length}</Badge>
        <Button size="sm" className="gap-2" onClick={() => setCreating(true)}>
          <Plus className="size-4" />
          {t("admin.invoices.new")}
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={t("admin.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-12">{t("admin.noData")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">{t("admin.invoices.number")}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">{t("admin.invoices.client")}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">{t("admin.total")}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">{t("admin.status")}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">{t("admin.date")}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-right">{t("admin.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => (
                    <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs font-semibold">{inv.number}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{inv.clientName}</p>
                        {inv.clientEmail && <p className="text-xs text-muted-foreground">{inv.clientEmail}</p>}
                      </td>
                      <td className="px-4 py-3 font-semibold">{inv.total.toFixed(2)} €</td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_BADGE[inv.status] ?? "outline"}>
                          {statusLabel(inv.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(inv.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => setViewing(inv)}
                          >
                            <FileText className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => handleDownload(inv)}
                            disabled={downloading === inv.id}
                          >
                            <Download className="size-3.5" />
                          </Button>
                          {inv.status === "draft" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() => handleMarkSent(inv.id)}
                              disabled={pending}
                              title={t("admin.invoices.markSent")}
                            >
                              <Send className="size-3.5" />
                            </Button>
                          )}
                          {inv.status === "sent" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-green-600"
                              onClick={() => handleMarkPaid(inv.id)}
                              disabled={pending}
                              title={t("admin.invoices.markPaid")}
                            >
                              <CheckCircle className="size-3.5" />
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive">
                                <Trash2 className="size-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t("admin.delete")}</AlertDialogTitle>
                                <AlertDialogDescription>{t("admin.invoices.deleteConfirm")}</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t("admin.cancel")}</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDelete(inv.id)}
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

      {/* Create invoice dialog */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("admin.invoices.new")}</DialogTitle>
            <DialogDescription>Remplissez les informations de la facture.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label>{t("admin.name")} *</Label>
                <Input value={newForm.clientName} onChange={(e) => setNewForm(f => ({ ...f, clientName: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>{t("admin.email")}</Label>
                <Input type="email" value={newForm.clientEmail} onChange={(e) => setNewForm(f => ({ ...f, clientEmail: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>{t("admin.phone")}</Label>
                <Input value={newForm.clientPhone} onChange={(e) => setNewForm(f => ({ ...f, clientPhone: e.target.value }))} />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label>Adresse</Label>
                <Input value={newForm.clientAddress} onChange={(e) => setNewForm(f => ({ ...f, clientAddress: e.target.value }))} />
              </div>
            </div>

            <Separator />

            {/* Items */}
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Lignes de prestation</p>
              {newItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm bg-muted/40 px-3 py-2 rounded-md">
                  <span className="flex-1 truncate">{item.description}</span>
                  <span className="text-muted-foreground">{item.qty} × {item.unitPrice} €</span>
                  <span className="font-semibold">{item.amount.toFixed(2)} €</span>
                  <Button variant="ghost" size="icon" className="size-6" onClick={() => removeItem(i)}>
                    <X className="size-3" />
                  </Button>
                </div>
              ))}
              <div className="grid grid-cols-12 gap-2">
                <Input
                  placeholder="Description"
                  className="col-span-5"
                  value={newForm.itemDesc}
                  onChange={(e) => setNewForm(f => ({ ...f, itemDesc: e.target.value }))}
                />
                <Input
                  placeholder="Qté"
                  type="number"
                  min="1"
                  className="col-span-2"
                  value={newForm.itemQty}
                  onChange={(e) => setNewForm(f => ({ ...f, itemQty: e.target.value }))}
                />
                <Input
                  placeholder="Prix €"
                  type="number"
                  min="0"
                  className="col-span-3"
                  value={newForm.itemPrice}
                  onChange={(e) => setNewForm(f => ({ ...f, itemPrice: e.target.value }))}
                />
                <Button variant="outline" size="icon" className="col-span-2" onClick={addItem}>
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>

            {newItems.length > 0 && (
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label>{t("admin.notes")}</Label>
              <Textarea rows={2} value={newForm.notes} onChange={(e) => setNewForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreating(false)}>{t("admin.cancel")}</Button>
            <Button onClick={handleCreate} disabled={pending || !newForm.clientName || newItems.length === 0}>
              {t("admin.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View invoice dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle>Facture {viewing.number}</DialogTitle>
                <DialogDescription>
                  {new Date(viewing.createdAt).toLocaleDateString("fr-FR")} ·{" "}
                  <Badge variant={STATUS_BADGE[viewing.status] ?? "outline"}>{statusLabel(viewing.status)}</Badge>
                </DialogDescription>
              </DialogHeader>
              <div ref={printRef} className="flex flex-col gap-4 py-2">
                <Card>
                  <CardHeader><CardTitle className="text-sm">Client</CardTitle></CardHeader>
                  <CardContent className="text-sm flex flex-col gap-0.5">
                    <p className="font-medium">{viewing.clientName}</p>
                    {viewing.clientEmail && <p className="text-muted-foreground">{viewing.clientEmail}</p>}
                    {viewing.clientPhone && <p className="text-muted-foreground">{viewing.clientPhone}</p>}
                    {viewing.clientAddress && <p className="text-muted-foreground">{viewing.clientAddress}</p>}
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 flex flex-col gap-2 text-sm">
                    {viewing.items.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <div>
                          <p>{item.description}</p>
                          <p className="text-xs text-muted-foreground">{item.qty} × {item.unitPrice.toFixed(2)} €</p>
                        </div>
                        <p className="font-semibold">{item.amount.toFixed(2)} €</p>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>{viewing.total.toFixed(2)} €</span>
                    </div>
                    {viewing.notes && <p className="text-xs text-muted-foreground italic">{viewing.notes}</p>}
                  </CardContent>
                </Card>
              </div>
              <DialogFooter className="flex-wrap gap-2">
                <Button variant="outline" className="gap-2" onClick={() => handleDownload(viewing)} disabled={downloading === viewing.id}>
                  <Download className="size-4" />
                  {t("admin.invoices.download")}
                </Button>
                {viewing.status === "draft" && (
                  <Button className="gap-2" onClick={() => { handleMarkSent(viewing.id); setViewing(null) }}>
                    <Send className="size-4" />
                    {t("admin.invoices.markSent")}
                  </Button>
                )}
                {viewing.status === "sent" && (
                  <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white" onClick={() => { handleMarkPaid(viewing.id); setViewing(null) }}>
                    <CheckCircle className="size-4" />
                    {t("admin.invoices.markPaid")}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
