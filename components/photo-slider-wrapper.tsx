import { getSliderSlidesPublic } from "@/lib/db/admin-actions"
import { PhotoSlider } from "@/components/photo-slider"

export async function PhotoSliderWrapper({ compact = false }: { compact?: boolean }) {
  let dbSlides: {
    id: number
    imageUrl: string
    labelFr: string
    labelEn: string
    labelAr: string
    tag: string
    ctaLabelFr: string | null
    ctaLabelEn: string | null
    ctaLabelAr: string | null
    ctaHref: string | null
  }[] = []

  try {
    dbSlides = await getSliderSlidesPublic()
  } catch {
    // fall through to hardcoded fallback
  }

  return <PhotoSlider compact={compact} dbSlides={dbSlides.length > 0 ? dbSlides : null} />
}
