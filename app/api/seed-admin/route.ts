import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"

const ADMIN_EMAIL = "roudjine@gmail.com"
const ADMIN_PASSWORD = "admin2026"
const ADMIN_NAME = "Admin"

export async function GET() {
  try {
    // Check if any user already exists
    const existing = await db.select({ id: user.id }).from(user).limit(1)
    if (existing.length > 0) {
      return NextResponse.json(
        { message: "Admin already exists.", email: ADMIN_EMAIL },
        { status: 200 }
      )
    }

    // Use Better Auth's internal ctx to create the user (bypasses HTTP, handles hashing)
    const result = await auth.api.signUpEmail({
      body: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: ADMIN_NAME,
      },
    })

    if (!result || !result.user) {
      return NextResponse.json(
        { error: "Sign-up returned no user" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "Admin created successfully!",
      email: ADMIN_EMAIL,
      userId: result.user.id,
    })
  } catch (err) {
    console.error("[seed-admin]", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
