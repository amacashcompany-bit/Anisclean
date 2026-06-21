"use client"

import { createAuthClient } from "better-auth/react"

// When running inside the v0 preview iframe the page origin differs from the
// server origin. Explicitly setting baseURL ensures auth requests always hit
// the correct server regardless of which frame the page is rendered in.
export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== "undefined" ? window.location.origin : undefined),
})

export const { signIn, signUp, signOut, useSession } = authClient
