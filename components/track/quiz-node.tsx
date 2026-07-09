"use client";

import { Trophy } from "lucide-react";

import { PathNode, type PathNodeProps } from "./path-node";

/**
 * Test de unidad: nodo especial más grande (spec 6.6 / 23 — el tamaño extra
 * lo maneja PathNode según kind "quiz").
 */
export function QuizNode(props: PathNodeProps) {
  return <PathNode {...props} icon={Trophy} />;
}
