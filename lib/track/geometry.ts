/**
 * Geometría determinística del camino (spec 6.6 / 41.3).
 *
 * Estrategia anti-desalineación: nodos y path comparten el MISMO sistema de
 * coordenadas normalizado. El eje X se expresa en % del ancho del contenedor
 * (los nodos se posicionan con `left: X%` + translateX(-50%)) y el eje Y en
 * px con filas de alto fijo. El SVG usa viewBox="0 0 100 <altoPx>" con
 * preserveAspectRatio="none", así x=50 del path y left:50% del nodo caen en
 * el mismo pixel para cualquier ancho de pantalla (390px, 448px, desktop).
 * El trazo usa vector-effect="non-scaling-stroke" para no deformarse.
 */

/** Alto fijo de la fila de cada nodo, en px. */
export const TRACK_ROW_HEIGHT = 116;

/** Patrón de alternancia centro → izquierda → centro → derecha (spec 6.6). */
const X_PATTERN = [50, 24, 50, 76] as const;

export interface PathPoint {
  x: number;
  y: number;
}

/**
 * Posición horizontal (en % del ancho) para el índice GLOBAL del nodo.
 * Usar el índice global (no por unidad) mantiene la ondulación continua
 * a través de los banners de unidad.
 */
export function nodeXPercent(globalIndex: number): number {
  return X_PATTERN[((globalIndex % X_PATTERN.length) + X_PATTERN.length) % X_PATTERN.length];
}

/** Centro vertical (px) del nodo dentro de su unidad. */
export function nodeCenterY(localIndex: number): number {
  return localIndex * TRACK_ROW_HEIGHT + TRACK_ROW_HEIGHT / 2;
}

/** Alto total (px) del bloque de nodos de una unidad. */
export function unitPathHeight(nodeCount: number): number {
  return nodeCount * TRACK_ROW_HEIGHT;
}

/** Puntos (centro de cada nodo) de una unidad, en coordenadas normalizadas. */
export function unitPathPoints(
  nodeCount: number,
  globalStartIndex: number,
): PathPoint[] {
  return Array.from({ length: nodeCount }, (_, i) => ({
    x: nodeXPercent(globalStartIndex + i),
    y: nodeCenterY(i),
  }));
}

/**
 * Path SVG continuo por los centros de los nodos: cadena de curvas cúbicas
 * con tangentes verticales en cada nodo. Eso garantiza continuidad C1 (sin
 * quiebres) y que cualquier sub-path (ej: overlay de progreso hasta el nodo
 * actual) se superponga exacto sobre el path base.
 */
export function buildTrackPathD(points: PathPoint[]): string {
  if (points.length === 0) return "";

  const [first, ...rest] = points;
  let d = `M ${first.x} ${first.y}`;
  let prev = first;

  for (const point of rest) {
    const dy = (point.y - prev.y) * 0.5;
    d += ` C ${prev.x} ${prev.y + dy}, ${point.x} ${point.y - dy}, ${point.x} ${point.y}`;
    prev = point;
  }

  return d;
}
