import type { Metadata } from "next";

import { SolutionsCta } from "@/components/landing/layouts/solutions-cta";
import { SolutionsHero } from "@/components/landing/layouts/solutions-hero";
import { SolutionsImpact } from "@/components/landing/layouts/solutions-impact";
import { SolutionsVenueSection } from "@/components/landing/layouts/solutions-venue-section";
import { SeparatorLanding } from "@/components/landing/ui/separator-landing";
import { SOLUTIONS_META } from "@/lib/landing/solutions-content";

export function generateMetadata(): Metadata {
  return {
    title: SOLUTIONS_META.title,
    description: SOLUTIONS_META.description,
    alternates: { canonical: SOLUTIONS_META.canonicalPath },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: SOLUTIONS_META.canonicalPath,
      title: SOLUTIONS_META.title,
      description: SOLUTIONS_META.description,
    },
  };
}

export default function SolutionsPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-background">
      <SolutionsHero />
      <SolutionsVenueSection />
      <SeparatorLanding id="solutions-divider" />
      <SolutionsImpact />
      <SolutionsCta />
    </main>
  );
}
