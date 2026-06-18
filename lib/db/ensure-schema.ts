import { pool } from "@/lib/db"

export async function ensureAdminSchema() {
  const client = await pool.connect()
  try {
    await client.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS "blockedUserId" text;

      CREATE TABLE IF NOT EXISTS invoices (
        id          serial PRIMARY KEY,
        number      text   NOT NULL UNIQUE,
        "orderId"   int    REFERENCES orders(id) ON DELETE SET NULL,
        "clientName"    text NOT NULL,
        "clientEmail"   text,
        "clientPhone"   text,
        "clientAddress" text,
        items       jsonb  NOT NULL,
        subtotal    real   NOT NULL,
        "taxCredit" real   NOT NULL DEFAULT 0,
        total       real   NOT NULL,
        status      text   NOT NULL DEFAULT 'draft',
        notes       text,
        "sentAt"    timestamptz,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS service_overrides (
        id              text PRIMARY KEY,
        "nameOverride"  text,
        "descOverride"  text,
        data            jsonb,
        "updatedAt"     timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS appointments (
        id              serial PRIMARY KEY,
        "orderId"       int REFERENCES orders(id) ON DELETE SET NULL,
        "clientName"    text NOT NULL,
        "clientPhone"   text,
        "serviceLabel"  text NOT NULL,
        date            text NOT NULL,
        "startTime"     text,
        "endTime"       text,
        notes           text,
        type            text NOT NULL DEFAULT 'one_time',
        "recurringRule" jsonb,
        status          text NOT NULL DEFAULT 'scheduled',
        "createdAt"     timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS site_settings (
        key         text PRIMARY KEY,
        value       text NOT NULL,
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      );
    `)
  } finally {
    client.release()
  }
}
