import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function POST(request: Request) {
  // Only admins can upload
  const session = await auth.api.getSession({ headers: await headers() })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  // Validate image type
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 })
  }

  // Max 8 MB
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 8 MB)" }, { status: 400 })
  }

  const filename = `realisations/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`
  const blob = await put(filename, file, { access: "public" })

  return NextResponse.json({ url: blob.url })
}
