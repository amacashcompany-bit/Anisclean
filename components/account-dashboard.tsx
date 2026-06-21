"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  User, Wallet, History, Star, ArrowDownLeft, ArrowUpRight,
  Gift, RefreshCw, Loader2, TrendingUp, ShieldCheck,
} from "lucide-react"
import { depositToWallet, withdrawFromWallet, redeemLoyaltyPoints } from "@/lib/db/user-actions"
import type { userWallets, walletTransactions, orders } from "@/lib/db/schema"
import type { InferSelectModel } from "drizzle-orm"

type Wallet = InferSelectModel<typeof userWallets>
type Tx = InferSelectModel<typeof walletTransactions>
type Order = InferSelectModel<typeof orders>

interface User {
  id: string
  name?: string | null
  email: string
  role?: string
}

interface Props {
  user: User
  wallet: Wallet
  transactions: Tx[]
  orders: Order[]
  defaultTab: string
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending:    { label: "En attente",   variant: "secondary" },
  confirmed:  { label: "Confirmé",     variant: "default" },
  completed:  { label: "Terminé",      variant: "outline" },
  cancelled:  { label: "Annulé",       variant: "destructive" },
}

const TX_ICONS: Record<string, React.ReactNode> = {
  deposit:         <ArrowDownLeft className="h-4 w-4 text-emerald-500" />,
  withdrawal:      <ArrowUpRight className="h-4 w-4 text-rose-500" />,
  points_earned:   <Star className="h-4 w-4 text-amber-500" />,
  points_redeemed: <Gift className="h-4 w-4 text-sky-500" />,
  refund:          <RefreshCw className="h-4 w-4 text-violet-500" />,
}

function fmt(n: number) { return n.toFixed(2).replace(".", ",") + " €" }
function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
}

export function AccountDashboard({ user, wallet: initialWallet, transactions: initialTxs, orders, defaultTab }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Local optimistic wallet state
  const [wallet, setWallet] = useState(initialWallet)
  const [transactions, setTransactions] = useState(initialTxs)

  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [redeemPts, setRedeemPts] = useState("")
  const [actionError, setActionError] = useState("")

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U"

  function runAction(fn: () => Promise<void>) {
    setActionError("")
    startTransition(async () => {
      try {
        await fn()
        router.refresh()
      } catch (err: unknown) {
        setActionError(err instanceof Error ? err.message : "Une erreur est survenue")
      }
    })
  }

  return (
    <main className="min-h-screen bg-muted/30 pb-20 pt-8">
      <div className="mx-auto max-w-3xl px-4">

        {/* Profile header card */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-sm" style={{ borderTop: "4px solid #0ea5e9" }}>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 shrink-0">
              <AvatarFallback className="bg-sky-500 text-xl font-bold text-white">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-foreground">{user.name ?? "Utilisateur"}</h1>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              {user.role === "admin" && (
                <Badge variant="secondary" className="mt-1 gap-1 text-xs">
                  <ShieldCheck className="h-3 w-3" /> Administrateur
                </Badge>
              )}
            </div>
            {/* Quick stats */}
            <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
              <span className="text-2xl font-black text-foreground">{fmt(wallet.balance)}</span>
              <span className="text-xs text-muted-foreground">Solde portefeuille</span>
              <span className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                <Star className="h-3.5 w-3.5" /> {wallet.loyaltyPoints} pts
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <User className="h-3.5 w-3.5" /><span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Wallet className="h-3.5 w-3.5" /><span className="hidden sm:inline">Portefeuille</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <History className="h-3.5 w-3.5" /><span className="hidden sm:inline">Services</span>
            </TabsTrigger>
            <TabsTrigger value="loyalty" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Star className="h-3.5 w-3.5" /><span className="hidden sm:inline">Fidélité</span>
            </TabsTrigger>
          </TabsList>

          {/* ── Profile tab ──────────────────────────────────── */}
          <TabsContent value="profile">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-base font-semibold">Informations personnelles</h2>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="profile-name">Nom complet</Label>
                  <Input id="profile-name" defaultValue={user.name ?? ""} disabled />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="profile-email">Adresse email</Label>
                  <Input id="profile-email" defaultValue={user.email} disabled />
                </div>
                <p className="text-xs text-muted-foreground">
                  Pour modifier vos informations, contactez-nous à{" "}
                  <a href="mailto:Zyncleen@gmail.com" className="text-sky-500 hover:underline">
                    Zyncleen@gmail.com
                  </a>
                </p>
              </div>

              {/* Summary stats */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-muted/40 p-4 text-center">
                  <p className="text-2xl font-black text-foreground">{orders.length}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Services commandés</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/40 p-4 text-center">
                  <p className="text-2xl font-black text-foreground">{fmt(wallet.balance)}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Solde</p>
                </div>
                <div className="col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-center dark:border-amber-800/40 dark:bg-amber-950/30 sm:col-span-1">
                  <p className="text-2xl font-black text-amber-500">{wallet.loyaltyPoints}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Points fidélité</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Wallet tab ───────────────────────────────────── */}
          <TabsContent value="wallet">
            <div className="flex flex-col gap-4">

              {/* Balance card */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm" style={{ background: "linear-gradient(135deg,#0d2240 0%,#0e3a6e 100%)" }}>
                <p className="text-sm font-medium text-white/60">Solde disponible</p>
                <p className="mt-1 text-4xl font-black text-white">{fmt(wallet.balance)}</p>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-white/60">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  {transactions.filter((t) => t.type === "deposit").length} dépôt(s) effectué(s)
                </p>
              </div>

              {/* Deposit */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="mb-3 font-semibold">Déposer des fonds</h3>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="Montant en €"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => {
                      const a = parseFloat(depositAmount)
                      if (!a || a <= 0) return
                      runAction(async () => {
                        await depositToWallet(a)
                        setWallet((w) => ({ ...w, balance: w.balance + a, loyaltyPoints: w.loyaltyPoints + Math.floor(a * 10) }))
                        setDepositAmount("")
                      })
                    }}
                    disabled={isPending || !depositAmount}
                    className="bg-sky-500 text-white hover:bg-sky-400"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Déposer"}
                  </Button>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">+10 points de fidélité par euro déposé</p>
              </div>

              {/* Withdrawal */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="mb-3 font-semibold">Retirer des fonds</h3>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="Montant en €"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const a = parseFloat(withdrawAmount)
                      if (!a || a <= 0) return
                      runAction(async () => {
                        await withdrawFromWallet(a)
                        setWallet((w) => ({ ...w, balance: w.balance - a }))
                        setWithdrawAmount("")
                      })
                    }}
                    disabled={isPending || !withdrawAmount}
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Retirer"}
                  </Button>
                </div>
              </div>

              {actionError && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{actionError}</p>
              )}

              {/* Transaction history */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="mb-3 font-semibold">Historique des transactions</h3>
                {transactions.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">Aucune transaction pour l&apos;instant</p>
                ) : (
                  <ul className="flex flex-col divide-y divide-border">
                    {transactions.map((tx) => (
                      <li key={tx.id} className="flex items-center gap-3 py-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                          {TX_ICONS[tx.type] ?? <RefreshCw className="h-4 w-4" />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{tx.description ?? tx.type}</p>
                          <p className="text-xs text-muted-foreground">{fmtDate(tx.createdAt)}</p>
                        </div>
                        <div className="text-right shrink-0">
                          {tx.amount !== 0 && (
                            <p className={`text-sm font-bold ${tx.amount > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                              {tx.amount > 0 ? "+" : ""}{fmt(tx.amount)}
                            </p>
                          )}
                          {tx.pointsAmount && (
                            <p className={`text-xs font-semibold ${(tx.pointsAmount ?? 0) > 0 ? "text-amber-500" : "text-muted-foreground"}`}>
                              {(tx.pointsAmount ?? 0) > 0 ? "+" : ""}{tx.pointsAmount} pts
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── History tab ──────────────────────────────────── */}
          <TabsContent value="history">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="mb-4 font-semibold">Mes services</h2>
              {orders.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <History className="h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Vous n&apos;avez pas encore de service enregistré.</p>
                  <Button render={<a href="/#services" />} className="bg-sky-500 text-white hover:bg-sky-400">
                    Découvrir nos services
                  </Button>
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  {orders.map((order) => {
                    const s = STATUS_LABELS[order.status] ?? { label: order.status, variant: "outline" as const }
                    return (
                      <li key={order.id} className="rounded-xl border border-border p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-foreground">{order.reference}</p>
                            <p className="text-xs text-muted-foreground">{fmtDate(order.createdAt)}</p>
                          </div>
                          <Badge variant={s.variant}>{s.label}</Badge>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">{order.address}, {order.city}</p>
                          <p className="font-bold text-foreground">{fmt(order.total)}</p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </TabsContent>

          {/* ── Loyalty tab ──────────────────────────────────── */}
          <TabsContent value="loyalty">
            <div className="flex flex-col gap-4">

              {/* Points card */}
              <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 dark:border-amber-800/40 dark:from-amber-950/30 dark:to-orange-950/20">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 text-white">
                    <Star className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-sm text-muted-foreground">Vos points fidélité</p>
                    <p className="text-4xl font-black text-amber-500">{wallet.loyaltyPoints}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl bg-white/60 p-3 dark:bg-black/20">
                  <p className="text-sm font-medium text-foreground">
                    Valeur estimée : <span className="font-bold text-amber-600">{fmt(wallet.loyaltyPoints / 100)}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">100 points = 1,00 €</p>
                </div>
              </div>

              {/* Redeem */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="mb-1 font-semibold">Convertir en argent</h3>
                <p className="mb-3 text-sm text-muted-foreground">
                  Convertissez vos points en solde portefeuille. Minimum 100 points.
                </p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="100"
                    step="100"
                    placeholder="Nombre de points (min. 100)"
                    value={redeemPts}
                    onChange={(e) => setRedeemPts(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => {
                      const pts = parseInt(redeemPts)
                      if (!pts || pts < 100) return
                      runAction(async () => {
                        await redeemLoyaltyPoints(pts)
                        const euros = pts / 100
                        setWallet((w) => ({ ...w, loyaltyPoints: w.loyaltyPoints - pts, balance: w.balance + euros }))
                        setRedeemPts("")
                      })
                    }}
                    disabled={isPending || !redeemPts || wallet.loyaltyPoints < 100}
                    className="bg-amber-500 text-white hover:bg-amber-400"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Convertir"}
                  </Button>
                </div>
                {redeemPts && parseInt(redeemPts) >= 100 && (
                  <p className="mt-1.5 text-xs text-emerald-600">
                    = +{fmt(parseInt(redeemPts) / 100)} sur votre portefeuille
                  </p>
                )}
              </div>

              {actionError && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{actionError}</p>
              )}

              {/* How to earn */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="mb-3 font-semibold">Comment gagner des points ?</h3>
                <ul className="flex flex-col gap-3">
                  {[
                    { action: "Déposer dans le portefeuille", pts: "+10 pts / €" },
                    { action: "Chaque service commandé", pts: "Bientôt disponible" },
                    { action: "Parrainer un ami", pts: "Bientôt disponible" },
                  ].map((row) => (
                    <li key={row.action} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
                      <span className="text-sm text-foreground">{row.action}</span>
                      <Badge variant="outline" className="text-xs font-semibold">{row.pts}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
