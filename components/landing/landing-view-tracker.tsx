"use client";

import { useEffect } from "react";

import { useAnalytics } from "@/hooks/use-analytics";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

/** Dispara `landing_viewed` al montar la landing (spec 20). */
export function LandingViewTracker() {
  const { capture } = useAnalytics();

  useEffect(() => {
    capture(ANALYTICS_EVENTS.LANDING_VIEWED, {
      referrer:
        typeof document !== "undefined" ? document.referrer || undefined : undefined,
    });
  }, [capture]);

  return null;
}
