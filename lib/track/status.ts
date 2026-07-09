import type { TrackNodeKind, TrackNodeStatus } from "./types";

/**
 * Hechos crudos por nodo (en orden global del track) a partir de los cuales
 * se derivan los 7 estados de la spec 11.3.
 */
export interface TrackNodeFacts {
  id: string;
  kind: TrackNodeKind;
  /** El nodo requiere premium (Unidad 3+, simulacros o is_premium). */
  premiumRequired: boolean;
  completed: boolean;
  /** El último intento falló (lesson_progress.status === 'failed'). */
  failed: boolean;
  /** Repaso completado hace tiempo que conviene resurfacear. */
  reviewDue: boolean;
}

export interface ResolvedNodeStatus {
  status: TrackNodeStatus;
  isCurrent: boolean;
}

/** Los retos diarios son opcionales: nunca compiten por "current" (spec 41.3). */
function isCoreNode(node: TrackNodeFacts): boolean {
  return node.kind !== "daily_challenge";
}

/**
 * Resuelve el estado de cada nodo garantizando el invariante crítico del
 * track (spec 5.1 / 41.3): **exactamente un nodo con isCurrent=true**.
 *
 * Reglas:
 * - El "frontier" es el primer nodo core (no daily challenge) sin completar,
 *   siguiendo el orden global del track. Ese nodo es el current.
 * - Si el frontier requiere premium → status premium_locked pero sigue siendo
 *   el CTA principal (click → paywall). El track nunca queda sin acción.
 * - Si el frontier falló → failed_retry ("Reintentar"), sigue siendo current.
 * - Si todo está completo → el último nodo core pasa a review_due como CTA
 *   ("Repasá para mantener el nivel"), así el track nunca queda trabado.
 * - Daily challenges: completed / failed_retry / available (si ya llegamos a
 *   su posición) / locked. Nunca current.
 */
export function resolveTrackStatuses(
  nodes: TrackNodeFacts[],
  hasPremiumAccess: boolean,
): Map<string, ResolvedNodeStatus> {
  const result = new Map<string, ResolvedNodeStatus>();
  if (nodes.length === 0) return result;

  const gated = (node: TrackNodeFacts): boolean =>
    node.premiumRequired && !hasPremiumAccess;

  let frontierIndex = nodes.findIndex(
    (node) => isCoreNode(node) && !node.completed,
  );

  // Track 100% completo: el último nodo core se ofrece como repaso para que
  // siempre exista un CTA claro.
  let allCompleted = false;
  if (frontierIndex === -1) {
    allCompleted = true;
    for (let i = nodes.length - 1; i >= 0; i--) {
      if (isCoreNode(nodes[i])) {
        frontierIndex = i;
        break;
      }
    }
    // Track compuesto solo de daily challenges (no debería pasar): usar el último.
    if (frontierIndex === -1) frontierIndex = nodes.length - 1;
  }

  nodes.forEach((node, index) => {
    if (index === frontierIndex) {
      let status: TrackNodeStatus;
      if (allCompleted) {
        status = "review_due";
      } else if (gated(node)) {
        status = "premium_locked";
      } else if (node.failed) {
        status = "failed_retry";
      } else if (node.kind === "review") {
        status = "review_due";
      } else {
        status = "current";
      }
      result.set(node.id, { status, isCurrent: true });
      return;
    }

    if (node.completed) {
      result.set(node.id, {
        status: node.reviewDue ? "review_due" : "completed",
        isCurrent: false,
      });
      return;
    }

    if (!isCoreNode(node)) {
      // Daily challenge pendiente: disponible si el camino ya llegó hasta él.
      let status: TrackNodeStatus;
      if (gated(node)) {
        status = "premium_locked";
      } else if (node.failed) {
        status = "failed_retry";
      } else if (index <= frontierIndex) {
        status = "available";
      } else {
        status = "locked";
      }
      result.set(node.id, { status, isCurrent: false });
      return;
    }

    // Nodo core después del frontier.
    result.set(node.id, {
      status: gated(node) ? "premium_locked" : "locked",
      isCurrent: false,
    });
  });

  return normalizeSingleCurrent(nodes, result);
}

/**
 * Red de seguridad: si por cualquier bug quedaran 0 o 2+ current, se
 * normaliza a exactamente uno (el primero) para que el track jamás quede
 * trabado ni ambiguo.
 */
function normalizeSingleCurrent(
  nodes: TrackNodeFacts[],
  result: Map<string, ResolvedNodeStatus>,
): Map<string, ResolvedNodeStatus> {
  const currents = nodes.filter((node) => result.get(node.id)?.isCurrent);

  if (currents.length === 1) return result;

  if (currents.length === 0) {
    const fallback =
      nodes.find((node) => !node.completed) ?? nodes[nodes.length - 1];
    if (fallback) {
      const prev = result.get(fallback.id);
      result.set(fallback.id, {
        status:
          prev && prev.status !== "locked" && prev.status !== "available"
            ? prev.status
            : "current",
        isCurrent: true,
      });
    }
    return result;
  }

  currents.slice(1).forEach((node) => {
    const prev = result.get(node.id);
    if (!prev) return;
    result.set(node.id, {
      status: prev.status === "current" ? "available" : prev.status,
      isCurrent: false,
    });
  });
  return result;
}

/** Cantidad de nodos current de un resultado resuelto (para tests/asserts). */
export function countCurrentNodes(
  result: Map<string, ResolvedNodeStatus>,
): number {
  let count = 0;
  result.forEach((value) => {
    if (value.isCurrent) count += 1;
  });
  return count;
}
