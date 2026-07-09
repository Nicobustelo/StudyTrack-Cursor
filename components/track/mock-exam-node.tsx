"use client";

import { FileText } from "lucide-react";

import { PathNode, type PathNodeProps } from "./path-node";

/** Simulacro: nodo especial con ícono de documento/examen (spec 6.6 / 25). */
export function MockExamNode(props: PathNodeProps) {
  return <PathNode {...props} icon={FileText} />;
}
