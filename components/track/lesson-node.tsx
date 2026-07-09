"use client";

import { BookOpen, PencilLine } from "lucide-react";

import { PathNode, type PathNodeProps } from "./path-node";

/** Nodo de lección/práctica (spec 11.4). */
export function LessonNode(props: PathNodeProps) {
  const icon = props.node.kind === "practice" ? PencilLine : BookOpen;
  return <PathNode {...props} icon={icon} />;
}
