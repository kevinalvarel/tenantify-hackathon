"use client";

import { useState } from "react";
import { useCustomer } from "@/context/customer-context";
import { CustomerHeroBanner } from "@/components/customer/customer-hero-banner";
import { QuickCategoryBar } from "@/components/customer/quick-category-bar";
import { ProductExplorer } from "@/components/customer/product-explorer";
import { FeaturedTenantsSection } from "@/components/customer/featured-tenants-section";

export default function CustomerExplorePage() {
  const {
    products,
    tenants,
    addToCart,
    selectedCategory,
    setSelectedCategory,
  } = useCustomer();
  const [selectedTenantId, setSelectedTenantId] = useState<string>("all");

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-full min-w-0">
      <section aria-label="Promo Utama Hari Ini">
        <CustomerHeroBanner />
      </section>

      <QuickCategoryBar
        activeCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      <div id="customer-product-explorer" className="w-full">
        <ProductExplorer
          products={products}
          tenants={tenants}
          onAddToCart={addToCart}
          selectedTenantId={selectedTenantId}
          onSelectTenant={setSelectedTenantId}
        />
      </div>

      <FeaturedTenantsSection
        onSelectTenant={(tenantId) => setSelectedTenantId(tenantId)}
      />
    </div>
  );
}
