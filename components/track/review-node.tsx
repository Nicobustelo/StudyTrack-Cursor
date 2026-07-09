"use client";

import { RotateCcw } from "lucide-react";

import { PathNode, type PathNodeProps } from "./path-node";

/** Nodo de repaso con ícono refresh (spec 6.6 / 11.4). */
export function ReviewNode(props: PathNodeProps) {
  return <PathNode {...props} icon={RotateCcw} />;
}
