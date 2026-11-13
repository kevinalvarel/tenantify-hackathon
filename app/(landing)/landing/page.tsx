import { AboutSection } from "@/components/landing/layouts/about";
import { CTASection } from "@/components/landing/layouts/cta";
import { FaqsSection } from "@/components/landing/layouts/faqs";
import { HeroSection } from "@/components/landing/layouts/hero";
import { UsageSection } from "@/components/landing/layouts/usage";
import { SeparatorLanding } from "@/components/landing/ui/separator-landing";

export default function Home() {
  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <HeroSection />
      <AboutSection />
      <SeparatorLanding />
      <UsageSection />
      <FaqsSection />
      <CTASection />
    </div>
  );
}
