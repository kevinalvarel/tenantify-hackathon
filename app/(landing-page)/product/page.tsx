import type { Metadata } from "next";

import { ProductCta } from "@/components/landing/layouts/product-cta";
import { ProductHero } from "@/components/landing/layouts/product-hero";
import { ProductRoles } from "@/components/landing/layouts/product-roles";
import { ProductSteps } from "@/components/landing/layouts/product-steps";
import { SeparatorLanding } from "@/components/landing/ui/separator-landing";
import { PRODUCT_META } from "@/lib/landing/product-content";

export function generateMetadata(): Metadata {
  return {
    title: PRODUCT_META.title,
    description: PRODUCT_META.description,
    alternates: { canonical: PRODUCT_META.canonicalPath },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: PRODUCT_META.canonicalPath,
      title: PRODUCT_META.title,
      description: PRODUCT_META.description,
    },
  };
}

export default function ProductPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-background">
      <ProductHero />
      <ProductRoles />
      <SeparatorLanding id="product-divider" />
      <ProductSteps />
      <ProductCta />
    </main>
  );
}
