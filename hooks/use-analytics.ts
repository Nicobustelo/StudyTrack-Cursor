"use client";

import { useCallback } from "react";
import { usePostHog } from "posthog-js/react";

import {
  ANALYTICS_EVENTS,
  type AnalyticsEvent,
  type EventProperties,
} from "@/lib/analytics/events";
import {
  identifyUser,
  resetAnalyticsUser,
  trackCtaClicked,
  trackLandingViewed,
  trackOnboardingCompleted,
} from "@/lib/analytics/client";

export function useAnalytics() {
  const posthog = usePostHog();

  const capture = useCallback(
    <E extends AnalyticsEvent>(
      event: E,
      properties?: EventProperties<E>,
    ): void => {
      if (!posthog) return;
      posthog.capture(event, properties);
    },
    [posthog],
  );

  const identify = useCallback(
    (
      userId: string,
      properties?: Record<string, string | number | boolean | null>,
    ): void => {
      if (posthog) {
        posthog.identify(userId, properties);
        return;
      }
      identifyUser(userId, properties);
    },
    [posthog],
  );

  const reset = useCallback((): void => {
    if (posthog) {
      posthog.reset();
      return;
    }
    resetAnalyticsUser();
  }, [posthog]);

  return {
    capture,
    identify,
    reset,
    isReady: Boolean(posthog),
    events: ANALYTICS_EVENTS,
    trackLandingViewed,
    trackCtaClicked,
    /** W6: llamar en el paso final del onboarding. */
    trackOnboardingCompleted,
  };
}
