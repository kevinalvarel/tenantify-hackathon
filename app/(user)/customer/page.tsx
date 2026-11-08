"use client";

import { useCustomer } from "@/context/customer-context";
import { RecommendationSlider } from "@/components/customer/recommendation-slider";
import { FavoriteMenuSlider } from "@/components/customer/favorite-menu-slider";
import { ProductExplorer } from "@/components/customer/product-explorer";

export default function CustomerExplorePage() {
  const { products, tenants, addToCart } = useCustomer();

  return (
    <div className="flex flex-col gap-8 w-full max-w-full min-w-0">

      {/* TIX ID Style Automatic Recommendation Banner Slider */}
      <section aria-label="Slide Rekomendasi Menu">
        <RecommendationSlider />
      </section>

      {/* Solaria Style Favorite Menu Slide (Requested by User) */}
      <FavoriteMenuSlider />

      <div id="customer-product-explorer" className="w-full">
        <ProductExplorer
          products={products}
          tenants={tenants}
          onAddToCart={addToCart}
        />
      </div>
    </div>
  );
}
