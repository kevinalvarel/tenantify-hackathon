import { PromotionsManagement } from "@/components/seller/promotions/promotions-management";
import { getSellerPromotionsAction } from "@/servers/promotion-server";

export default async function SellerPromotionsPage() {
  const data = await getSellerPromotionsAction();
  return <PromotionsManagement promotions={data.promotions} />;
}
