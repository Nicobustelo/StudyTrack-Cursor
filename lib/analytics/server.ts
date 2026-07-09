import { PostHog } from "posthog-node";

import {
  ANALYTICS_EVENTS,
  type AnalyticsEvent,
  type EventProperties,
  type PipelineFailureProperties,
} from "./events";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

let serverClient: PostHog | null = null;

function getServerClient(): PostHog | null {
  if (!POSTHOG_KEY) return null;
  if (!serverClient) {
    serverClient = new PostHog(POSTHOG_KEY, {
      host: POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return serverClient;
}

/**
 * Captura server-side no bloqueante. Fire-and-forget con flush seguro.
 * No-op si faltan env vars.
 */
export function captureServerEvent<E extends AnalyticsEvent>(
  distinctId: string,
  event: E,
  properties?: EventProperties<E>,
): void {
  void (async () => {
    try {
      const client = getServerClient();
      if (!client) return;

      client.capture({
        distinctId,
        event,
        properties: properties as Record<string, unknown> | undefined,
      });

      await client.flush();
    } catch {
      // Analytics nunca debe romper el request principal.
    }
  })();
}

/**
 * Instrumentación de fallos del pipeline de IA (spec 41.1 / 41.6).
 * Mapea a `analysis_failed` con contexto del error.
 */
export function capturePipelineFailure(
  distinctId: string,
  properties: PipelineFailureProperties,
): void {
  captureServerEvent(distinctId, ANALYTICS_EVENTS.ANALYSIS_FAILED, properties);
}

/** Alias tipado con argumentos en orden natural (evento primero). */
export function captureServerAnalyticsEvent<E extends AnalyticsEvent>(
  event: E,
  distinctId: string,
  properties?: EventProperties<E>,
): void {
  captureServerEvent(distinctId, event, properties);
}

/**
 * Flush seguro al finalizar handlers largos o en shutdown.
 * Retorna sin error si PostHog no está configurado.
 */
export async function flushServerAnalytics(): Promise<void> {
  try {
    const client = getServerClient();
    if (!client) return;
    await client.flush();
  } catch {
    // Ignorar errores de flush.
  }
}

/**
 * Cierra el cliente server-side (útil en tests o scripts).
 */
export async function shutdownServerAnalytics(): Promise<void> {
  try {
    if (!serverClient) return;
    await serverClient.shutdown();
    serverClient = null;
  } catch {
    serverClient = null;
  }
}

export { ANALYTICS_EVENTS };
