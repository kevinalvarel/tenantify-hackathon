import type { Metadata } from "next";

import { ServiceCta } from "@/components/landing/layouts/service-cta";
import { ServiceHero } from "@/components/landing/layouts/service-hero";
import { ServiceRoleSection } from "@/components/landing/layouts/service-role-section";
import { ServiceSynergy } from "@/components/landing/layouts/service-synergy";
import { SeparatorLanding } from "@/components/landing/ui/separator-landing";
import { SERVICE_META } from "@/lib/service-content";

export function generateMetadata(): Metadata {
  return {
    title: SERVICE_META.title,
    description: SERVICE_META.description,
    alternates: { canonical: SERVICE_META.canonicalPath },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: SERVICE_META.canonicalPath,
      title: SERVICE_META.title,
      description: SERVICE_META.description,
    },
  };
}

export default function ServicePage() {
  return (
    <main className="flex min-h-dvh flex-col bg-background">
      <ServiceHero />
      <ServiceRoleSection />
      <SeparatorLanding id="service-divider" />
      <ServiceSynergy />
      <ServiceCta />
    </main>
  );
}
