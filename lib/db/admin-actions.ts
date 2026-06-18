"use server"

import { db } from "@/lib/db"
import {
  orders,
  invoices,
  serviceOverrides,
  appointments,
  siteSettings,
  reviews,
  user,
  customServices,
  realisations,
  type InvoiceItem,
  type OrderItem,
  type ServiceOverride,
  type RecurringRule,
  type CustomPackage,
} from "@/lib/db/schema"
import { eq, desc, sql } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { ensureAdminSchema } from "@/lib/db/ensure-schema"
import { revalidatePath } from "next/cache"

// ── Public: save a customer order (no admin auth required) ───────────────────

export async function saveOrder(data: {
  reference: string
  name: string
  phone: string
  email?: string
  address?: string
  postalCode?: string
  city?: string
  notes?: string
  items: OrderItem[]
  subtotal: number
  taxCredit: number
  total: number
  lang: string
  paymentMethod?: string
}) {
  await ensureAdminSchema()
  const [row] = await db
    .insert(orders)
    .values({
      reference: data.reference,
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      postalCode: data.postalCode,
      city: data.city,
      notes: data.notes,
      items: data.items,
      subtotal: data.subtotal,
      taxCredit: data.taxCredit,
      total: data.total,
      lang: data.lang,
      status: data.paymentMethod ? "confirmed" : "new",
    })
    .returning()
  revalidatePath("/admin/orders")
  return row
}

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session || (session.user as any).role !== "admin") {
    throw new Error("Unauthorized")
  }
  return session
}

// ── Schema bootstrap ──────────────────────────────────────────────────────────
export async function bootstrapAdminSchema() {
  await requireAdmin()
  await ensureAdminSchema()
}

// ── Orders ────────────────────────────────────────────────────────────────────
export async function getOrders() {
  await requireAdmin()
  return db.select().from(orders).orderBy(desc(orders.createdAt))
}

export async function updateOrderStatus(
  orderId: number,
  status: "new" | "confirmed" | "in_progress" | "completed" | "canceled"
) {
  await requireAdmin()
  await db.update(orders).set({ status }).where(eq(orders.id, orderId))
  revalidatePath("/admin/orders")
}

export async function deleteOrder(orderId: number) {
  await requireAdmin()
  await db.delete(orders).where(eq(orders.id, orderId))
  revalidatePath("/admin/orders")
}

// ── Users ─────────────────────────────────────────────────────────────────────
export async function getUsers() {
  await requireAdmin()
  return db.select().from(user).orderBy(desc(user.createdAt))
}

export async function setUserRole(userId: string, role: "user" | "admin" | "blocked") {
  await requireAdmin()
  await db.update(user).set({ role }).where(eq(user.id, userId))
  revalidatePath("/admin/users")
}

// ── Invoices ──────────────────────────────────────────────────────────────────
export async function getInvoices() {
  await requireAdmin()
  return db.select().from(invoices).orderBy(desc(invoices.createdAt))
}

export async function createInvoice(data: {
  orderId?: number
  clientName: string
  clientEmail?: string
  clientPhone?: string
  clientAddress?: string
  items: InvoiceItem[]
  subtotal: number
  taxCredit: number
  total: number
  notes?: string
}) {
  await requireAdmin()
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(invoices)
  const number = `INV-${String((count as number) + 1).padStart(4, "0")}`
  const [inv] = await db.insert(invoices).values({ ...data, number }).returning()
  revalidatePath("/admin/invoices")
  return inv
}

export async function updateInvoice(
  id: number,
  data: Partial<{
    clientName: string
    clientEmail: string
    clientPhone: string
    clientAddress: string
    items: InvoiceItem[]
    subtotal: number
    taxCredit: number
    total: number
    status: "draft" | "sent" | "paid"
    notes: string
  }>
) {
  await requireAdmin()
  await db.update(invoices).set(data).where(eq(invoices.id, id))
  revalidatePath("/admin/invoices")
}

export async function markInvoiceSent(id: number) {
  await requireAdmin()
  await db
    .update(invoices)
    .set({ status: "sent", sentAt: new Date() })
    .where(eq(invoices.id, id))
  revalidatePath("/admin/invoices")
}

export async function deleteInvoice(id: number) {
  await requireAdmin()
  await db.delete(invoices).where(eq(invoices.id, id))
  revalidatePath("/admin/invoices")
}

// ── Service Overrides ─────────────────────────────────────────────────────────
export async function getServiceOverrides() {
  await requireAdmin()
  return db.select().from(serviceOverrides)
}

export async function upsertServiceOverride(
  id: string,
  nameOverride: string | null,
  descOverride: string | null,
  data: ServiceOverride
) {
  await requireAdmin()
  await db
    .insert(serviceOverrides)
    .values({ id, nameOverride, descOverride, data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: serviceOverrides.id,
      set: { nameOverride, descOverride, data, updatedAt: new Date() },
    })
  revalidatePath("/admin/services")
}

export async function deleteServiceOverride(id: string) {
  await requireAdmin()
  await db.delete(serviceOverrides).where(eq(serviceOverrides.id, id))
  revalidatePath("/admin/services")
}

// ── Appointments ──────────────────────────────────────────────────────────────
export async function getAppointments() {
  await requireAdmin()
  return db.select().from(appointments).orderBy(appointments.date)
}

export async function createAppointment(data: {
  orderId?: number
  clientName: string
  clientPhone?: string
  serviceLabel: string
  date: string
  startTime?: string
  endTime?: string
  notes?: string
  type?: "one_time" | "recurring"
  recurringRule?: RecurringRule
}) {
  await requireAdmin()
  const [appt] = await db.insert(appointments).values(data).returning()
  revalidatePath("/admin/schedule")
  return appt
}

export async function updateAppointment(
  id: number,
  data: Partial<{
    clientName: string
    clientPhone: string
    serviceLabel: string
    date: string
    startTime: string
    endTime: string
    notes: string
    status: "scheduled" | "completed" | "canceled"
    type: "one_time" | "recurring"
    recurringRule: RecurringRule
  }>
) {
  await requireAdmin()
  await db.update(appointments).set(data).where(eq(appointments.id, id))
  revalidatePath("/admin/schedule")
}

export async function deleteAppointment(id: number) {
  await requireAdmin()
  await db.delete(appointments).where(eq(appointments.id, id))
  revalidatePath("/admin/schedule")
}

// ── Site Settings ─────────────────────────────────────────────────────────────
export async function getSiteSettings() {
  await requireAdmin()
  const rows = await db.select().from(siteSettings)
  return Object.fromEntries(rows.map((r) => [r.key, r.value]))
}

export async function upsertSiteSetting(key: string, value: string) {
  await requireAdmin()
  await db
    .insert(siteSettings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value, updatedAt: new Date() },
    })
  revalidatePath("/admin")
}

// ── Analytics ──────────────────���──────────────────────────────────────────────
export async function getAnalytics() {
  await requireAdmin()

  const [orderStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      completed: sql<number>`count(*) filter (where status = 'completed')::int`,
      inProgress: sql<number>`count(*) filter (where status = 'in_progress')::int`,
      canceled: sql<number>`count(*) filter (where status = 'canceled')::int`,
      revenue: sql<number>`coalesce(sum(total) filter (where status != 'canceled'), 0)::real`,
    })
    .from(orders)

  const [userStats] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(user)

  const [invoiceStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      paid: sql<number>`count(*) filter (where status = 'paid')::int`,
      pending: sql<number>`count(*) filter (where status = 'sent')::int`,
    })
    .from(invoices)

  // Last 6 months orders count grouped by month
  const monthlyOrders = await db.execute(sql`
    SELECT
      to_char("createdAt", 'YYYY-MM') AS month,
      count(*)::int AS count,
      coalesce(sum(total), 0)::real AS revenue
    FROM orders
    WHERE "createdAt" >= now() - interval '6 months'
    GROUP BY month
    ORDER BY month ASC
  `)

  // Orders by status
  const byStatus = await db.execute(sql`
    SELECT status, count(*)::int AS count
    FROM orders
    GROUP BY status
  `)

  return {
    orderStats,
    userStats,
    invoiceStats,
    monthlyOrders: monthlyOrders.rows as { month: string; count: number; revenue: number }[],
    byStatus: byStatus.rows as { status: string; count: number }[],
  }
}

// ── Custom Services ───────────────────────────────────────────────────────────

export async function getCustomServices() {
  await requireAdmin()
  return db.select().from(customServices).orderBy(customServices.sortOrder, customServices.createdAt)
}

export async function getCustomServicesPublic() {
  return db
    .select()
    .from(customServices)
    .where(eq(customServices.active, true))
    .orderBy(customServices.sortOrder, customServices.createdAt)
}

export async function createCustomService(data: {
  name: string
  description?: string
  icon?: string
  hourlyRate?: number
  hourlyLabel?: string
  packages?: CustomPackage[]
  packagesTitle?: string
  fromLabel?: string
  taxEligible?: boolean
  active?: boolean
  sortOrder?: number
}) {
  await requireAdmin()
  const id = `custom-${Date.now()}`
  const [row] = await db
    .insert(customServices)
    .values({ ...data, id, updatedAt: new Date() })
    .returning()
  revalidatePath("/admin/services")
  revalidatePath("/tarifs")
  return row
}

export async function updateCustomService(
  id: string,
  data: Partial<{
    name: string
    description: string
    icon: string
    hourlyRate: number
    hourlyLabel: string
    packages: CustomPackage[]
    packagesTitle: string
    fromLabel: string
    taxEligible: boolean
    active: boolean
    sortOrder: number
  }>
) {
  await requireAdmin()
  await db
    .update(customServices)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(customServices.id, id))
  revalidatePath("/admin/services")
  revalidatePath("/tarifs")
}

export async function deleteCustomService(id: string) {
  await requireAdmin()
  await db.delete(customServices).where(eq(customServices.id, id))
  revalidatePath("/admin/services")
  revalidatePath("/tarifs")
}

// ── Réalisations (before/after gallery) ──────────────────────────────────────

export async function getRealisations() {
  await requireAdmin()
  return db.select().from(realisations).orderBy(realisations.sortOrder, realisations.createdAt)
}

export async function getRealisationsPublic() {
  return db
    .select()
    .from(realisations)
    .where(eq(realisations.published, true))
    .orderBy(realisations.sortOrder, realisations.createdAt)
}

export async function createRealisation(data: {
  title: string
  tag?: string
  beforeUrl: string
  afterUrl: string
  published?: boolean
  sortOrder?: number
}) {
  await requireAdmin()
  const [row] = await db.insert(realisations).values(data).returning()
  revalidatePath("/admin/realisations")
  revalidatePath("/realisations")
  return row
}

export async function updateRealisation(
  id: number,
  data: Partial<{
    title: string
    tag: string
    beforeUrl: string
    afterUrl: string
    published: boolean
    sortOrder: number
  }>
) {
  await requireAdmin()
  await db.update(realisations).set(data).where(eq(realisations.id, id))
  revalidatePath("/admin/realisations")
  revalidatePath("/realisations")
}

export async function deleteRealisation(id: number) {
  await requireAdmin()
  await db.delete(realisations).where(eq(realisations.id, id))
  revalidatePath("/admin/realisations")
  revalidatePath("/realisations")
}

// ── Reviews (public + admin) ──────────────────────────────────────────────────

/** Public: submit a new review (pending approval) */
export async function submitReview(data: {
  name: string
  city?: string
  rating: number
  text: string
}) {
  if (!data.name?.trim() || !data.text?.trim()) throw new Error("Missing fields")
  const rating = Math.max(1, Math.min(5, data.rating))
  const [row] = await db
    .insert(reviews)
    .values({ name: data.name.trim(), city: data.city?.trim() || null, rating, text: data.text.trim() })
    .returning()
  return row
}

/** Public: get all approved reviews */
export async function getApprovedReviews() {
  return db
    .select()
    .from(reviews)
    .where(eq(reviews.approved, true))
    .orderBy(desc(reviews.createdAt))
}

/** Admin: get all reviews (pending + approved) */
export async function getAllReviews() {
  await requireAdmin()
  return db.select().from(reviews).orderBy(desc(reviews.createdAt))
}

/** Admin: approve a review */
export async function approveReview(id: number) {
  await requireAdmin()
  await db.update(reviews).set({ approved: true }).where(eq(reviews.id, id))
  revalidatePath("/admin/reviews")
  revalidatePath("/")
}

/** Admin: reject/delete a review */
export async function deleteReview(id: number) {
  await requireAdmin()
  await db.delete(reviews).where(eq(reviews.id, id))
  revalidatePath("/admin/reviews")
  revalidatePath("/")
}
