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
  // Collect every possible URL this deployment can be reached at.
  // In the v0 sandbox NONE of these vars may be defined at server start,
  // so we also add a wildcard "*" — Better Auth accepts it and stops
  // throwing "invalid origin" when the origin cannot be statically known.
  trustedOrigins: [
    "*",
    ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
      : []),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  advanced: {
    // The v0 preview embeds the app in a cross-site iframe. Without
    // sameSite=none + secure the browser silently drops the session cookie.
    // disableCSRFCheck is required because the iframe origin never matches
    // the server origin in the v0 sandbox environment.
    disableCSRFCheck: true,
    defaultCookieAttributes: {
      sameSite: "none" as const,
      secure: true,
    },
  },
})
