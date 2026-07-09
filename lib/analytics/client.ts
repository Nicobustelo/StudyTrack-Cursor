import posthog from "posthog-js";

import {
  ANALYTICS_EVENTS,
  type AnalyticsEvent,
  type EventProperties,
} from "./events";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

/** Host del proxy Next.js — nunca apuntar al ingest directo en browser (spec 41.6). */
export const POSTHOG_PROXY_HOST = "/ingest";

let initialized = false;

export function isPostHogConfigured(): boolean {
  return Boolean(POSTHOG_KEY);
}

/** Inicializa posthog-js una sola vez (client-side). */
export function initPostHog(): typeof posthog | null {
  if (typeof window === "undefined") return null;
  if (!POSTHOG_KEY) return null;
  if (initialized) return posthog;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_PROXY_HOST,
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: false,
    capture_pageleave: true,
    persistence: "localStorage+cookie",
    autocapture: false,
  });

  initialized = true;
  return posthog;
}

export function getPostHogClient(): typeof posthog | null {
  if (typeof window === "undefined") return null;
  if (!POSTHOG_KEY) return null;
  return initialized ? posthog : initPostHog();
}

export type AnalyticsCaptureFn = <E extends AnalyticsEvent>(
  event: E,
  properties?: EventProperties<E>,
) => void;

/** Captura tipada client-side (no-op si PostHog no está configurado). */
export function captureClientEvent<E extends AnalyticsEvent>(
  event: E,
  properties?: EventProperties<E>,
): void {
  const client = getPostHogClient();
  if (!client) return;
  client.capture(event, properties);
}

export function identifyUser(
  userId: string,
  properties?: Record<string, string | number | boolean | null>,
): void {
  const client = getPostHogClient();
  if (!client) return;
  client.identify(userId, properties);
}

export function resetAnalyticsUser(): void {
  const client = getPostHogClient();
  if (!client) return;
  client.reset();
}

// --- Helpers explícitos para workers (importables sin hook) ---

export function trackLandingViewed(
  properties?: EventProperties<typeof ANALYTICS_EVENTS.LANDING_VIEWED>,
): void {
  captureClientEvent(ANALYTICS_EVENTS.LANDING_VIEWED, properties);
}

export function trackCtaClicked(
  properties: EventProperties<typeof ANALYTICS_EVENTS.CTA_CLICKED>,
): void {
  captureClientEvent(ANALYTICS_EVENTS.CTA_CLICKED, properties);
}

/**
 * Helper explícito para W6 — disparar en el paso final del onboarding.
 * Spec 41.6: verificar que este evento se dispare en producción.
 */
export function trackOnboardingCompleted(
  properties: EventProperties<typeof ANALYTICS_EVENTS.ONBOARDING_COMPLETED>,
): void {
  captureClientEvent(ANALYTICS_EVENTS.ONBOARDING_COMPLETED, properties);
}

export { ANALYTICS_EVENTS };
