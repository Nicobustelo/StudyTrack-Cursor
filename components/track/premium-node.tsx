"use client";

import { PathNode, type PathNodeProps } from "./path-node";

/**
 * Nodo premium bloqueado (spec 11.5 / 23): violeta, candado y chip "PRO".
 * El click abre el PaywallModal vía onPremiumClick — nunca es un nodo muerto.
 */
export function PremiumNode(props: PathNodeProps) {
  return <PathNode {...props} />;
}
