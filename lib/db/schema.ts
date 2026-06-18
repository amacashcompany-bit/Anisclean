import { pgTable, text, timestamp, boolean, serial, real, jsonb, integer } from "drizzle-orm/pg-core"

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// --- App tables ------------------------------------------------------------

export type OrderItem = {
  serviceId: string
  serviceLabel: string
  optionLabel: string
  detail: string
  qty: number
  unitPrice: number
  amount: number
}

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address"),
  postalCode: text("postalCode"),
  city: text("city"),
  notes: text("notes"),
  items: jsonb("items").$type<OrderItem[]>().notNull(),
  subtotal: real("subtotal").notNull(),
  taxCredit: real("taxCredit").notNull(),
  total: real("total").notNull(),
  lang: text("lang").notNull().default("fr"),
  // status: new | confirmed | in_progress | completed | canceled
  status: text("status").notNull().default("new"),
  blockedUserId: text("blockedUserId"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export type InvoiceItem = {
  description: string
  qty: number
  unitPrice: number
  amount: number
}

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  number: text("number").notNull().unique(),
  orderId: integer("orderId").references(() => orders.id, { onDelete: "set null" }),
  clientName: text("clientName").notNull(),
  clientEmail: text("clientEmail"),
  clientPhone: text("clientPhone"),
  clientAddress: text("clientAddress"),
  items: jsonb("items").$type<InvoiceItem[]>().notNull(),
  subtotal: real("subtotal").notNull(),
  taxCredit: real("taxCredit").notNull().default(0),
  total: real("total").notNull(),
  // status: draft | sent | paid
  status: text("status").notNull().default("draft"),
  notes: text("notes"),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export type ServiceOverride = {
  hourlyRate?: number
  fromLabel?: string
  packages?: { id: string; label: string; price: number }[]
  active?: boolean
}

export const serviceOverrides = pgTable("service_overrides", {
  id: text("id").primaryKey(), // matches services.ts id
  nameOverride: text("nameOverride"),
  descOverride: text("descOverride"),
  data: jsonb("data").$type<ServiceOverride>(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export type RecurringRule = {
  freq: "weekly" | "biweekly" | "monthly"
  dayOfWeek?: number // 0=Sun … 6=Sat
  notes?: string
}

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").references(() => orders.id, { onDelete: "set null" }),
  clientName: text("clientName").notNull(),
  clientPhone: text("clientPhone"),
  serviceLabel: text("serviceLabel").notNull(),
  date: text("date").notNull(), // ISO date string YYYY-MM-DD
  startTime: text("startTime"), // HH:MM
  endTime: text("endTime"),
  notes: text("notes"),
  // type: one_time | recurring
  type: text("type").notNull().default("one_time"),
  recurringRule: jsonb("recurringRule").$type<RecurringRule>(),
  // appt status: scheduled | completed | canceled
  status: text("status").notNull().default("scheduled"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  city: text("city"),
  rating: integer("rating").notNull().default(5), // 1–5
  text: text("text").notNull(),
  // status: pending | approved | rejected
  approved: boolean("approved").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})
