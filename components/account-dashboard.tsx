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
                  <a href="mailto:Anisclean@gmail.com" className="text-sky-500 hover:underline">
                    Anisclean@gmail.com
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
                    className="gap-2"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownLeft className="h-4 w-4" />}
                    Déposer
                  </Button>
                </div>
              </div>

              {/* Withdraw */}
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
                    className="gap-2"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
                    Retirer
                  </Button>
                </div>
              </div>

              {/* Transaction history */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="mb-3 font-semibold">Historique des transactions</h3>
                {transactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune transaction pour le moment.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background">
                            {TX_ICONS[tx.type] ?? <RefreshCw className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{tx.description}</p>
                            <p className="text-xs text-muted-foreground">{fmtDate(tx.createdAt)}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-semibold ${tx.amount >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                          {tx.amount >= 0 ? "+" : ""}{fmt(tx.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── History tab ──────────────────────────────────── */}
          <TabsContent value="history">
            <div className="flex flex-col gap-4">
              {orders.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
                  <History className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Aucune commande pour le moment.</p>
                </div>
              ) : (
                orders.map((order) => {
                  const st = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending
                  return (
                    <div key={order.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Commande #{order.id}</p>
                          <p className="text-xs text-muted-foreground">{fmtDate(order.createdAt)}</p>
                        </div>
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-semibold">{fmt(order.total)}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </TabsContent>

          {/* ── Loyalty tab ──────────────────────────────────── */}
          <TabsContent value="loyalty">
            <div className="flex flex-col gap-4">
              {/* Points balance */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center shadow-sm dark:border-amber-800/40 dark:bg-amber-950/30">
                <Star className="mx-auto mb-2 h-8 w-8 text-amber-500" />
                <p className="text-4xl font-black text-amber-500">{wallet.loyaltyPoints}</p>
                <p className="mt-1 text-sm text-muted-foreground">Points fidélité disponibles</p>
                <p className="mt-2 text-xs text-muted-foreground">1 point = 0,10 € de réduction</p>
              </div>

              {/* Redeem */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="mb-3 font-semibold">Utiliser mes points</h3>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    placeholder="Nombre de points"
                    value={redeemPts}
                    onChange={(e) => setRedeemPts(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => {
                      const pts = parseInt(redeemPts)
                      if (!pts || pts <= 0) return
                      runAction(async () => {
                        await redeemLoyaltyPoints(pts)
                        setWallet((w) => ({ ...w, loyaltyPoints: w.loyaltyPoints - pts, balance: w.balance + pts * 0.1 }))
                        setRedeemPts("")
                      })
                    }}
                    disabled={isPending || !redeemPts}
                    className="gap-2"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
                    Convertir
                  </Button>
                </div>
              </div>

              {actionError && (
                <p className="text-sm text-rose-500 text-center">{actionError}</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}