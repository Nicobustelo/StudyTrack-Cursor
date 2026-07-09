import type { Metadata } from "next";

import { BottomNav } from "@/components/layout/bottom-nav";
import { examBottomNavItems } from "@/components/layout/exam-bottom-nav-items";
import { MobileShell } from "@/components/layout/mobile-shell";
import { LearningPath } from "@/components/track/learning-path";
import { TrackHeader } from "@/components/track/track-header";
import { loadTrackViewModel } from "@/lib/track/data";

export const metadata: Metadata = {
  title: "Tu track — StudyTrack",
};

interface TrackPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paywall?: string }>;
}

/**
 * Pantalla principal de la app (spec 5.1): el camino vertical gamificado.
 * Server component: carga el view model (o el demo si no hay datos) y
 * delega el render interactivo a LearningPath.
 */
export default async function TrackPage({
  params,
  searchParams,
}: TrackPageProps) {
  const [{ id }, { paywall }] = await Promise.all([params, searchParams]);

  const vm = await loadTrackViewModel(id);

  return (
    <MobileShell
      header={<TrackHeader vm={vm} />}
      bottomNav={<BottomNav items={examBottomNavItems(id)} />}
    >
      <LearningPath vm={vm} initialPaywallOpen={paywall === "1"} />
    </MobileShell>
  );
}
