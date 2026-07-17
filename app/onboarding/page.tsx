import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Onboarding — StudyTrack",
  description: "Armá tu plan de estudio personalizado para aprobar tu examen.",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signup");
  }

  return (
    <OnboardingFlow userId={user.id} userEmail={user.email} />
  );
}
