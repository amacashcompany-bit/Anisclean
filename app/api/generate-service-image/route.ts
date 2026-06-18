import { experimental_generateImage as generateImage } from "ai"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { put } from "@vercel/blob"

export async function POST(req: NextRequest) {
  // Only admins can generate images
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { prompt } = await req.json()
  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 })
  }

  const fullPrompt = `Professional cleaning service illustration for: ${prompt}. 
    Clean, modern, minimalist style. Bright and fresh colors (teal, white, light green). 
    No text, no watermarks. Square format.`

  const { image } = await generateImage({
    model: "google/gemini-3.1-flash-image-preview",
    prompt: fullPrompt,
  })

  // Upload to Blob storage
  const buffer = Buffer.from(image.base64, "base64")
  const filename = `services/ai-${Date.now()}.png`
  const blob = await put(filename, buffer, {
    access: "public",
    contentType: "image/png",
  })

  return NextResponse.json({ url: blob.url })
}
