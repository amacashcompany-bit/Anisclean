import { betterAuth } from "better-auth"
import { pool, db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { sql } from "drizzle-orm"

export const auth = betterAuth({
  database: pool,
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.V0_RUNTIME_URL),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      // Expose the custom `role` column on session.user so the admin layout
      // can gate access. Without this Better Auth strips unknown fields.
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // The very first account created becomes the admin. Any later
        // sign-ups are regular users with no access to the dashboard.
        before: async (data) => {
          const [{ count }] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(user)
          return { data: { ...data, role: count === 0 ? "admin" : "user" } }
        },
      },
    },
  },
  trustedOrigins: [
    ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
      : []),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  // In development the app runs inside the v0 preview iframe (cross-site).
  // Without sameSite=none + secure the browser silently drops the session
  // cookie and every request looks unauthenticated → "invalid origin".
  ...(process.env.NODE_ENV === "development"
    ? {
        advanced: {
          defaultCookieAttributes: {
            sameSite: "none" as const,
            secure: true,
          },
        },
      }
    : {}),
})
