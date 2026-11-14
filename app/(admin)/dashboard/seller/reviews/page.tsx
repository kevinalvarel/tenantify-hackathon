import { ReviewsManagement } from "@/components/seller/reviews-management";
import { getSellerReviewsAction } from "@/servers/review-server";

export default async function SellerReviewsPage() {
  const data = await getSellerReviewsAction();
  return <ReviewsManagement reviews={data.reviews} />;
}
