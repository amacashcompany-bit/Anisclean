"use client"

import React, { useState, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/components/providers/i18n-provider"
import {
  createInvoice,
  deleteInvoice,
  markInvoiceSent,
  updateInvoice,
} from "@/lib/db/admin-actions"
import type { invoices } from "@/lib/db/schema"
import { AdminInvoiceDocument } from "@/components/admin/admin-invoice-document"
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

  async function handleDownload(inv?: Invoice) {
    // Use provided invoice or fallback to viewing state
    const invoiceToDownload = inv || viewing
    if (!invoiceToDownload) return

    // If a specific invoice was passed (from table row action), temporarily set it as viewing for ref
    const wasViewing = viewing
    if (inv) setViewing(inv)

    setDownloading(invoiceToDownload.id)
    try {
      // Wait a tick for React to render the invoice if we just set it
      await new Promise((resolve) => setTimeout(resolve, 50))

      if (!printRef.current) return

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ])
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const imgWidth = pageWidth - 40
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight)
      pdf.save(`Facture_${invoiceToDownload.number}_Anisclean.pdf`)
    } catch (error) {
      console.error("[v0] PDF generation error:", error)
    } finally {
      setDownloading(null)
      // Restore viewing state if we changed it
      if (inv && wasViewing !== inv) setViewing(wasViewing)
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
                            <AlertDialogTrigger className="inline-flex items-center justify-center size-7 rounded-md text-destructive hover:bg-accent hover:text-destructive transition-colors">
                              <Trash2 className="size-3.5" />
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
              <div ref={printRef} className="bg-white">
                <AdminInvoiceDocument invoice={viewing as any} lang="fr" t={(key) => key} />
              </div>
              <DialogFooter className="flex-wrap gap-2">
                <Button variant="outline" className="gap-2" onClick={() => handleDownload()} disabled={downloading === viewing.id}>
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