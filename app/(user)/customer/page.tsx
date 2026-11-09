"use client";

import { useState } from "react";
import { useCustomer } from "@/context/customer-context";
import { CustomerHeroBanner } from "@/components/customer/customer-hero-banner";
import { QuickCategoryBar } from "@/components/customer/quick-category-bar";
import { ProductExplorer } from "@/components/customer/product-explorer";
import { FeaturedTenantsSection } from "@/components/customer/featured-tenants-section";

export default function CustomerExplorePage() {
  const { products, tenants, addToCart, selectedCategory, setSelectedCategory } =
    useCustomer();
  const [selectedTenantId, setSelectedTenantId] = useState<string>("all");

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-full min-w-0">
      {/* 1. HERO SECTION: Terracotta Promo Banner Slider */}
      <section aria-label="Promo Utama Hari Ini">
        <CustomerHeroBanner />
      </section>

      {/* 2. QUICK FOOD CATEGORIES BAR (8-grid icon catalog) */}
      <QuickCategoryBar
        activeCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      {/* 3. PILIHAN MAKANAN TERLARIS (Food Grid with Ordering CTAs) */}
      <div id="customer-product-explorer" className="w-full">
        <ProductExplorer
          products={products}
          tenants={tenants}
          onAddToCart={addToCart}
          selectedTenantId={selectedTenantId}
          onSelectTenant={setSelectedTenantId}
        />
      </div>

      {/* 4. TENANT MITRA TERBAIK (Featured Food Court Stalls) */}
      <FeaturedTenantsSection
        onSelectTenant={(tenantId) => setSelectedTenantId(tenantId)}
      />
    </div>
  );
}
