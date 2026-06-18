"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/components/providers/i18n-provider"
import { updateOrderStatus, deleteOrder, createInvoice } from "@/lib/db/admin-actions"
import type { orders } from "@/lib/db/schema"
import type { InferSelectModel } from "drizzle-orm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ShoppingCart, Trash2, FileText, Eye, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

type Order = InferSelectModel<typeof orders>

type Status = "new" | "confirmed" | "in_progress" | "completed" | "canceled"

interface Props {
  orders: Order[]
}

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  new: "outline",
  confirmed: "secondary",
  in_progress: "secondary",
  completed: "default",
  canceled: "destructive",
}

export function AdminOrdersClient({ orders }: Props) {
  const { t } = useI18n()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  function statusLabel(s: string) {
    const map: Record<string, string> = {
      new: t("admin.orders.new"),
      confirmed: t("admin.orders.confirmed"),
      in_progress: t("admin.orders.in_progress"),
      completed: t("admin.orders.completed"),
      canceled: t("admin.orders.canceled"),
    }
    return map[s] ?? s
  }

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      o.name.toLowerCase().includes(q) ||
      o.reference.toLowerCase().includes(q) ||
      (o.phone ?? "").includes(q) ||
      (o.email ?? "").toLowerCase().includes(q)
    const matchStatus = filterStatus === "all" || o.status === filterStatus
    return matchSearch && matchStatus
  })

  function handleStatusChange(orderId: number, status: Status) {
    startTransition(async () => {
      await updateOrderStatus(orderId, status)
      router.refresh()
    })
  }

  function handleDelete(orderId: number) {
    startTransition(async () => {
      await deleteOrder(orderId)
      router.refresh()
    })
  }

  async function handleCreateInvoice(order: Order) {
    startTransition(async () => {
      await createInvoice({
        orderId: order.id,
        clientName: order.name,
        clientEmail: order.email ?? undefined,
        clientPhone: order.phone,
        clientAddress: [order.address, order.postalCode, order.city].filter(Boolean).join(", "),
        items: order.items.map((it) => ({
          description: `${it.serviceLabel} — ${it.optionLabel}`,
          qty: it.qty,
          unitPrice: it.unitPrice,
          amount: it.amount,
        })),
        subtotal: order.subtotal,
        taxCredit: order.taxCredit,
        total: order.total,
      })
      router.push("/admin/invoices")
    })
  }

  const statuses: Status[] = ["new", "confirmed", "in_progress", "completed", "canceled"]

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ShoppingCart className="size-6 text-primary" />
        <h1 className="text-2xl font-semibold">{t("admin.orders.title")}</h1>
        <Badge variant="secondary" className="ml-auto">{orders.length}</Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={t("admin.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={(v) => v && setFilterStatus(v)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table card */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-12">{t("admin.noData")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">{t("admin.orders.reference")}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">{t("admin.orders.client")}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">{t("admin.orders.services")}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">{t("admin.total")}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">{t("admin.status")}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">{t("admin.date")}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-right">{t("admin.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs">{order.reference}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{order.name}</p>
                        <p className="text-xs text-muted-foreground">{order.phone}</p>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="text-xs text-muted-foreground truncate">
                          {order.items.map((i) => i.serviceLabel).join(", ")}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-semibold">{order.total.toFixed(2)} €</td>
                      <td className="px-4 py-3">
                        <Select
                          value={order.status}
                          onValueChange={(v) => v && handleStatusChange(order.id, v as Status)}
                          disabled={pending}
                        >
                          <SelectTrigger className="h-7 text-xs w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map((s) => (
                              <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => setSelectedOrder(order)}
                            title={t("admin.edit")}
                          >
                            <Eye className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => handleCreateInvoice(order)}
                            disabled={pending}
                            title={t("admin.orders.createInvoice")}
                          >
                            <FileText className="size-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger className="inline-flex items-center justify-center size-7 rounded-md text-destructive hover:bg-accent hover:text-destructive transition-colors">
                              <Trash2 className="size-3.5" />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t("admin.delete")}</AlertDialogTitle>
                                <AlertDialogDescription>{t("admin.orders.deleteConfirm")}</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t("admin.cancel")}</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDelete(order.id)}
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

      {/* Order detail sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={(o) => !o && setSelectedOrder(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedOrder && (
            <>
              <SheetHeader>
                <SheetTitle>Commande {selectedOrder.reference}</SheetTitle>
                <SheetDescription>
                  {new Date(selectedOrder.createdAt).toLocaleDateString("fr-FR")}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-5">
                {/* Client info */}
                <Card>
                  <CardHeader><CardTitle className="text-sm">{t("admin.orders.client")}</CardTitle></CardHeader>
                  <CardContent className="flex flex-col gap-1 text-sm">
                    <p className="font-medium">{selectedOrder.name}</p>
                    <p className="text-muted-foreground">{selectedOrder.phone}</p>
                    {selectedOrder.email && <p className="text-muted-foreground">{selectedOrder.email}</p>}
                    {selectedOrder.address && (
                      <p className="text-muted-foreground">
                        {[selectedOrder.address, selectedOrder.postalCode, selectedOrder.city].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {selectedOrder.notes && <p className="text-muted-foreground italic">{selectedOrder.notes}</p>}
                  </CardContent>
                </Card>

                {/* Items */}
                <Card>
                  <CardHeader><CardTitle className="text-sm">{t("admin.orders.services")}</CardTitle></CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <div>
                          <p className="font-medium">{item.serviceLabel}</p>
                          <p className="text-xs text-muted-foreground">{item.optionLabel} × {item.qty}</p>
                        </div>
                        <p className="font-semibold">{item.amount.toFixed(2)} €</p>
                      </div>
                    ))}
                    <Separator className="my-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span>{selectedOrder.subtotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Crédit d&apos;impôt (−50%)</span>
                      <span>−{selectedOrder.taxCredit.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>{t("admin.total")}</span>
                      <span>{selectedOrder.total.toFixed(2)} €</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Status change */}
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium">{t("admin.status")}</p>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(v) => {
                      if (!v) return
                      handleStatusChange(selectedOrder.id, v as Status)
                      setSelectedOrder({ ...selectedOrder, status: v })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["new", "confirmed", "in_progress", "completed", "canceled"] as Status[]).map((s) => (
                        <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  onClick={() => handleCreateInvoice(selectedOrder)}
                  disabled={pending}
                  className="gap-2"
                >
                  <FileText className="size-4" />
                  {t("admin.orders.createInvoice")}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
