"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { userWallets, walletTransactions, orders } from "@/lib/db/schema"
import { and, desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

// ── Wallet ────────────────────────────────────────────────────────────────────

export async function getOrCreateWallet() {
  const userId = await getUserId()
  const existing = await db.select().from(userWallets).where(eq(userWallets.userId, userId)).limit(1)
  if (existing.length > 0) return existing[0]
  const [wallet] = await db.insert(userWallets).values({ userId }).returning()
  return wallet
}

export async function getWalletTransactions() {
  const userId = await getUserId()
  return db
    .select()
    .from(walletTransactions)
    .where(eq(walletTransactions.userId, userId))
    .orderBy(desc(walletTransactions.createdAt))
    .limit(50)
}

export async function depositToWallet(amount: number) {
  if (amount <= 0) throw new Error("Amount must be positive")
  const userId = await getUserId()
  // Upsert wallet
  const existing = await db.select().from(userWallets).where(eq(userWallets.userId, userId)).limit(1)
  if (existing.length === 0) {
    await db.insert(userWallets).values({ userId, balance: amount })
  } else {
    await db
      .update(userWallets)
      .set({ balance: existing[0].balance + amount, updatedAt: new Date() })
      .where(eq(userWallets.userId, userId))
  }
  // Earn 10 loyalty points per 1€ deposited
  const pointsEarned = Math.floor(amount * 10)
  await earnLoyaltyPoints(pointsEarned, `Dépôt de ${amount.toFixed(2)} €`)
  await db.insert(walletTransactions).values({
    userId,
    type: "deposit",
    amount,
    description: `Dépôt de ${amount.toFixed(2)} €`,
  })
  revalidatePath("/compte")
}

export async function withdrawFromWallet(amount: number) {
  if (amount <= 0) throw new Error("Amount must be positive")
  const userId = await getUserId()
  const [wallet] = await db.select().from(userWallets).where(eq(userWallets.userId, userId)).limit(1)
  if (!wallet || wallet.balance < amount) throw new Error("Solde insuffisant")
  await db
    .update(userWallets)
    .set({ balance: wallet.balance - amount, updatedAt: new Date() })
    .where(eq(userWallets.userId, userId))
  await db.insert(walletTransactions).values({
    userId,
    type: "withdrawal",
    amount: -amount,
    description: `Retrait de ${amount.toFixed(2)} €`,
  })
  revalidatePath("/compte")
}

export async function earnLoyaltyPoints(points: number, description = "") {
  const userId = await getUserId()
  const existing = await db.select().from(userWallets).where(eq(userWallets.userId, userId)).limit(1)
  if (existing.length === 0) {
    await db.insert(userWallets).values({ userId, loyaltyPoints: points })
  } else {
    await db
      .update(userWallets)
      .set({ loyaltyPoints: existing[0].loyaltyPoints + points, updatedAt: new Date() })
      .where(eq(userWallets.userId, userId))
  }
  await db.insert(walletTransactions).values({
    userId,
    type: "points_earned",
    amount: 0,
    pointsAmount: points,
    description,
  })
  revalidatePath("/compte")
}

// 100 loyalty points = 1€
export async function redeemLoyaltyPoints(points: number) {
  if (points <= 0) throw new Error("Must redeem at least 1 point")
  const userId = await getUserId()
  const [wallet] = await db.select().from(userWallets).where(eq(userWallets.userId, userId)).limit(1)
  if (!wallet || wallet.loyaltyPoints < points) throw new Error("Points insuffisants")
  const euroValue = points / 100
  await db
    .update(userWallets)
    .set({
      loyaltyPoints: wallet.loyaltyPoints - points,
      balance: wallet.balance + euroValue,
      updatedAt: new Date(),
    })
    .where(eq(userWallets.userId, userId))
  await db.insert(walletTransactions).values({
    userId,
    type: "points_redeemed",
    amount: euroValue,
    pointsAmount: -points,
    description: `${points} points convertis en ${euroValue.toFixed(2)} €`,
  })
  revalidatePath("/compte")
}

// ── Service history ───────────────────────────────────────────────────────────

export async function getUserOrders() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return []
  // Match by email since orders store email not userId
  return db
    .select()
    .from(orders)
    .where(eq(orders.email, session.user.email))
    .orderBy(desc(orders.createdAt))
    .limit(20)
}
