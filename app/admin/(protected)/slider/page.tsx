import { getSliderSlides } from "@/lib/db/admin-actions"
import { AdminSliderClient } from "@/components/admin/slider-client"

export default async function AdminSliderPage() {
  const slides = await getSliderSlides()
  return <AdminSliderClient slides={slides} />
}
