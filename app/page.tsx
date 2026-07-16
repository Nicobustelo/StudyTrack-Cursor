import { AppShell } from "@/components/layout/app-shell";
import { Hero } from "@/components/landing/hero";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingViewTracker } from "@/components/landing/landing-view-tracker";
import { PastExamsSection } from "@/components/landing/past-exams-section";
import { PricingPreview } from "@/components/landing/pricing-preview";
import { ProblemSection } from "@/components/landing/problem-section";
import { ReadinessSection } from "@/components/landing/readiness-section";
import { SolutionSection } from "@/components/landing/solution-section";
import { TrackSection } from "@/components/landing/track-section";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: "StudyTrack — Un camino claro hasta tu examen",
    description:
      "Convertí tus materiales en un plan personalizado con práctica y progreso visible.",
  },
};

export default function Home() {
  return (
    <AppShell header={<LandingHeader />} footer={<LandingFooter />}>
      <LandingViewTracker />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <PastExamsSection />
      <TrackSection />
      <ReadinessSection />
      <PricingPreview />
    </AppShell>
  );
}
import type { Metadata } from "next";
