const INTERNAL_ORIGIN = "https://studytrack.local";

/**
 * Acepta solo destinos relativos del propio producto. Evita que un `next`
 * manipulado pueda redirigir a otro dominio después de autenticar al usuario.
 */
export function sanitizeInternalPath(value?: string | null): string | null {
  const candidate = value?.trim();
  if (
    !candidate ||
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\")
  ) {
    return null;
  }

  try {
    const url = new URL(candidate, INTERNAL_ORIGIN);
    if (url.origin !== INTERNAL_ORIGIN) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}
