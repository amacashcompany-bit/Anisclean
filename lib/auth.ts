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
    "http://localhost:3000",
    ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`] : []),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  advanced: {
    // In the v0 preview iframe the app is embedded cross-site, so we need
    // sameSite=none + secure to store the session cookie.
    // On plain localhost (HTTP) we skip secure so the __Secure- prefix is not
    // applied – browsers silently drop __Secure- cookies over HTTP.
    ...(process.env.V0_RUNTIME_URL
      ? {
          defaultCookieAttributes: {
            sameSite: "none" as const,
            secure: true,
          },
        }
      : {
          defaultCookieAttributes: {
            sameSite: "lax" as const,
            secure: false,
          },
          cookiePrefix: "better-auth",
        }),
  },
})
