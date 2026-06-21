import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getOrCreateWallet, getWalletTransactions, getUserOrders } from "@/lib/db/user-actions"
import { AccountDashboard } from "@/components/account-dashboard"

export const dynamic = "force-dynamic"

export default async function ComptePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const [wallet, transactions, orders] = await Promise.all([
    getOrCreateWallet(),
    getWalletTransactions(),
    getUserOrders(),
  ])

  const { tab } = await searchParams

  return (
    <AccountDashboard
      user={{ ...session.user, role: session.user.role ?? undefined }}
      wallet={wallet}
      transactions={transactions}
      orders={orders}
      defaultTab={tab ?? "profile"}
    />
  )
}
