"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

import { initPostHog, isPostHogConfigured } from "@/lib/analytics/client";

type PostHogProviderProps = {
  children: ReactNode;
};

export function PostHogProvider({ children }: PostHogProviderProps) {
  const configured = isPostHogConfigured();

  useEffect(() => {
    if (!configured) return;
    initPostHog();
  }, [configured]);

  if (!configured) {
    return <>{children}</>;
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
