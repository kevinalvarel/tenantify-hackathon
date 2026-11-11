import { PromotionsManagement } from "@/components/seller/promotions/promotions-management";
import { demoSellerPromotions } from "@/data/seller-promotions";

export default function SellerPromotionsPage() {
  return <PromotionsManagement promotions={demoSellerPromotions} />;
}
