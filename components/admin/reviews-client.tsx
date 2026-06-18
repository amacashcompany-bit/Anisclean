"use client"

import { useState, useTransition } from "react"
import { Star, Check, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { approveReview, deleteReview } from "@/lib/db/admin-actions"
import { useI18n } from "@/components/providers/i18n-provider"
import { toast } from "sonner"

type Review = {
  id: number
  name: string
  city: string | null
  rating: number
  text: string
  approved: boolean
  createdAt: Date
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className="size-3.5"
          fill={n <= rating ? "#fbbf24" : "none"}
          stroke={n <= rating ? "#fbbf24" : "currentColor"}
        />
      ))}
    </div>
  )
}

export function ReviewsClient({ initialReviews }: { initialReviews: Review[] }) {
  const { t } = useI18n()
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [isPending, startTransition] = useTransition()

  const [tab, setTab] = useState<"all" | "pending" | "approved">("all")

  const filtered = reviews.filter((r) => {
    if (tab === "pending") return !r.approved
    if (tab === "approved") return r.approved
    return true
  })

  function handleApprove(id: number) {
    startTransition(async () => {
      await approveReview(id)
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, approved: true } : r)))
      toast.success(t("admin.reviews.approved"))
    })
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      await deleteReview(id)
      setReviews((prev) => prev.filter((r) => r.id !== id))
      toast.success(t("admin.delete"))
    })
  }

  const tabs: { key: "all" | "pending" | "approved"; label: string; count: number }[] = [
    { key: "all", label: t("admin.actions"), count: reviews.length },
    { key: "pending", label: t("admin.reviews.pending"), count: reviews.filter((r) => !r.approved).length },
    { key: "approved", label: t("admin.reviews.approved"), count: reviews.filter((r) => r.approved).length },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t("admin.reviews.title")}</h1>
        <Badge variant="secondary">{reviews.length} total</Badge>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-border bg-muted/30 p-1 w-fit">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            type="button"
            onClick={() => setTab(tb.key)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === tb.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tb.label}
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs">{tb.count}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">{t("admin.noData")}</p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.name")}</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="hidden md:table-cell">Avis</TableHead>
                <TableHead className="hidden sm:table-cell">{t("admin.date")}</TableHead>
                <TableHead>{t("admin.status")}</TableHead>
                <TableHead className="text-right">{t("admin.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{review.name}</p>
                      {review.city && (
                        <p className="text-xs text-muted-foreground">{review.city}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StarDisplay rating={review.rating} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-xs">
                    <p className="line-clamp-2 text-sm text-muted-foreground">{review.text}</p>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={review.approved ? "default" : "secondary"}>
                      {review.approved ? t("admin.reviews.approved") : t("admin.reviews.pending")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {!review.approved && (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleApprove(review.id)}
                          title={t("admin.reviews.approve")}
                          className="inline-flex items-center justify-center size-7 rounded-lg text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                        >
                          <Check className="size-3.5" />
                        </button>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger
                          className="inline-flex items-center justify-center size-7 rounded-lg text-destructive hover:bg-accent transition-colors"
                          title={t("admin.delete")}
                        >
                          <Trash2 className="size-3.5" />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("admin.delete")}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("admin.reviews.deleteConfirm")}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("admin.cancel")}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(review.id)}>
                              {t("admin.delete")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
