"use client";

import { PostHogProvider } from "@/components/providers/posthog-provider";

type AppProvidersProps = {
  children: React.ReactNode;
};

/**
 * Wrapper de providers client-side.
 * Integrado en `app/layout.tsx`; usar este archivo si otro worker
 * necesita componer providers sin tocar el layout.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return <PostHogProvider>{children}</PostHogProvider>;
}
