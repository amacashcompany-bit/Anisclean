import { getAllReviews } from "@/lib/db/admin-actions"
import { ReviewsClient } from "@/components/admin/reviews-client"

export const dynamic = "force-dynamic"

export default async function AdminReviewsPage() {
  let reviews: Awaited<ReturnType<typeof getAllReviews>> = []
  try {
    reviews = await getAllReviews()
  } catch {
    // DB not ready yet
  }
  return <ReviewsClient initialReviews={reviews} />
}
