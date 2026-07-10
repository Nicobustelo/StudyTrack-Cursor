const LOCAL_APP_URL = "http://localhost:3000";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

/**
 * URL canónica de la app (server-side).
 * Prioridad: NEXT_PUBLIC_APP_URL → dominio de producción en Vercel → VERCEL_URL → localhost.
 */
export function getAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    return stripTrailingSlash(configured);
  }

  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionUrl) {
    return stripTrailingSlash(
      productionUrl.startsWith("http")
        ? productionUrl
        : `https://${productionUrl}`,
    );
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  return LOCAL_APP_URL;
}

/** Origen de la request con soporte para proxies (Vercel). */
export function getRequestOrigin(request: Request): string {
  const configured = getAppUrl();
  if (configured !== LOCAL_APP_URL) {
    return configured;
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");
  if (host) {
    const proto =
      request.headers.get("x-forwarded-proto") ??
      (host.includes("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }

  return new URL(request.url).origin;
}

export function getAuthCallbackUrl(origin?: string): string {
  const base = origin ?? getAppUrl();
  return `${stripTrailingSlash(base)}/auth/callback`;
}

/** URL canónica en el navegador (signup, redirects client-side). */
export function getClientAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    return stripTrailingSlash(configured);
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return LOCAL_APP_URL;
}
