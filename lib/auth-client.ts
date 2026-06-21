"use client"

import { createAuthClient } from "better-auth/react"

// Do NOT pass a custom baseURL here. In the v0 preview sandbox the app
// runs inside a cross-origin iframe; window.location.origin would point
// at the iframe host, not the Next.js server. Better Auth's client
// resolves the correct /api/auth/* path automatically from the document.
export const authClient = createAuthClient()

export const { signIn, signUp, signOut, useSession } = authClient
