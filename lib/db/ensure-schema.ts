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

      CREATE TABLE IF NOT EXISTS reviews (
        id          serial PRIMARY KEY,
        name        text NOT NULL,
        city        text,
        rating      int  NOT NULL DEFAULT 5,
        text        text NOT NULL,
        approved    boolean NOT NULL DEFAULT false,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS custom_services (
        id              text PRIMARY KEY,
        name            text NOT NULL,
        description     text,
        icon            text NOT NULL DEFAULT 'Wrench',
        "imageUrl"      text,
        "hourlyRate"    real,
        "hourlyLabel"   text,
        packages        jsonb,
        "packagesTitle" text,
        "fromLabel"     text,
        "taxEligible"   boolean NOT NULL DEFAULT false,
        active          boolean NOT NULL DEFAULT true,
        "sortOrder"     int  NOT NULL DEFAULT 0,
        "createdAt"     timestamptz NOT NULL DEFAULT now(),
        "updatedAt"     timestamptz NOT NULL DEFAULT now()
      );

      ALTER TABLE custom_services ADD COLUMN IF NOT EXISTS "imageUrl" text;

      CREATE TABLE IF NOT EXISTS service_locations (
        id          serial PRIMARY KEY,
        name        text NOT NULL,
        lat         real NOT NULL,
        lng         real NOT NULL,
        active      boolean NOT NULL DEFAULT true,
        "sortOrder" int  NOT NULL DEFAULT 0,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS slider_slides (
        id            serial PRIMARY KEY,
        "imageUrl"    text NOT NULL,
        "labelFr"     text NOT NULL DEFAULT '',
        "labelEn"     text NOT NULL DEFAULT '',
        "labelAr"     text NOT NULL DEFAULT '',
        tag           text NOT NULL DEFAULT 'service',
        "ctaLabelFr"  text,
        "ctaLabelEn"  text,
        "ctaLabelAr"  text,
        "ctaHref"     text,
        active        boolean NOT NULL DEFAULT true,
        "sortOrder"   int  NOT NULL DEFAULT 0,
        "createdAt"   timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS user_wallets (
        id              serial PRIMARY KEY,
        "userId"        text NOT NULL UNIQUE,
        balance         real NOT NULL DEFAULT 0,
        "loyaltyPoints" integer NOT NULL DEFAULT 0,
        "createdAt"     timestamptz NOT NULL DEFAULT now(),
        "updatedAt"     timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id              serial PRIMARY KEY,
        "userId"        text NOT NULL,
        type            text NOT NULL,
        amount          real NOT NULL,
        "pointsAmount"  integer,
        description     text,
        "refId"         text,
        "createdAt"     timestamptz NOT NULL DEFAULT now()
      );
    `)
  } finally {
    client.release()
  }
}
