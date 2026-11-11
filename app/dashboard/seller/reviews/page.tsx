import { ReviewsManagement } from "@/components/seller/reviews-management";
import { demoSellerReviews } from "@/data/seller-reviews";

export default function SellerReviewsPage() {
  return <ReviewsManagement reviews={demoSellerReviews} />;
}
