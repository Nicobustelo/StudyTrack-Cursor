"use client";

import type { ComponentType } from "react";
import { Lock } from "lucide-react";

import {
  buildTrackPathD,
  unitPathHeight,
  unitPathPoints,
} from "@/lib/track/geometry";
import type { TrackNodeVM, TrackUnitVM } from "@/lib/track/types";
import { cn } from "@/lib/utils";

import { DailyChallengeNode } from "./daily-challenge-node";
import { LessonNode } from "./lesson-node";
import { MockExamNode } from "./mock-exam-node";
import type { PathNodeProps } from "./path-node";
import { PremiumNode } from "./premium-node";
import { QuizNode } from "./quiz-node";
import { ReviewNode } from "./review-node";

function nodeComponentFor(node: TrackNodeVM): ComponentType<PathNodeProps> {
  if (node.status === "premium_locked") return PremiumNode;
  switch (node.kind) {
    case "quiz":
      return QuizNode;
    case "review":
      return ReviewNode;
    case "mock_exam":
      return MockExamNode;
    case "daily_challenge":
      return DailyChallengeNode;
    default:
      return LessonNode;
  }
}

/** Cantidad de nodos iniciales de la unidad que ya están "recorridos". */
function progressNodeCount(nodes: TrackNodeVM[]): number {
  const currentIdx = nodes.findIndex((n) => n.isCurrent);
  if (currentIdx >= 0) return currentIdx + 1;

  let count = 0;
  for (const node of nodes) {
    const traversed =
      node.status === "completed" ||
      node.status === "review_due" ||
      node.status === "failed_retry";
    if (!traversed) break;
    count += 1;
  }
  return count;
}

interface PathUnitProps {
  unit: TrackUnitVM;
  /** Índice global del primer nodo de la unidad (mantiene la ondulación continua). */
  globalStartIndex: number;
  onPremiumClick: (node: TrackNodeVM) => void;
  onLockedClick: (nodeId: string) => void;
  lockedHintId: string | null;
}

/**
 * Unidad del track: banner + bloque de camino. El path SVG y los nodos
 * comparten coordenadas normalizadas (x en %, y en px con filas fijas), por
 * eso la línea queda perfectamente conectada a los nodos en cualquier ancho
 * de pantalla (spec 6.6 / 41.3).
 */
export function PathUnit({
  unit,
  globalStartIndex,
  onPremiumClick,
  onLockedClick,
  lockedHintId,
}: PathUnitProps) {
  const gated = unit.nodes.some((n) => n.status === "premium_locked");
  const height = unitPathHeight(unit.nodes.length);
  const points = unitPathPoints(unit.nodes.length, globalStartIndex);
  const baseD = buildTrackPathD(points);
  const doneCount = progressNodeCount(unit.nodes);
  const progressD =
    doneCount >= 2 ? buildTrackPathD(points.slice(0, doneCount)) : "";

  return (
    <section
      data-slot="path-unit"
      aria-label={`Unidad ${unit.number}: ${unit.title}`}
    >
      <header
        className={cn(
          "rounded-2xl border p-4 shadow-card",
          gated
            ? "border-accent-purple/25 bg-[color-mix(in_oklab,var(--st-purple)_7%,var(--st-surface))]"
            : "border-border bg-surface",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className={cn(
                "text-[11px] font-extrabold uppercase tracking-wide",
                gated ? "text-accent-purple" : "text-brand-dark",
              )}
            >
              Unidad {unit.number}
            </p>
            <h2 className="mt-0.5 text-base font-extrabold leading-snug text-ink">
              {unit.title}
            </h2>
            {unit.description ? (
              <p className="mt-1 line-clamp-2 text-xs font-medium leading-snug text-ink-muted">
                {unit.description}
              </p>
            ) : null}
          </div>
          {gated ? (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-accent-purple px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">
              <Lock className="size-3" aria-hidden />
              PRO
            </span>
          ) : (
            <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] font-extrabold tabular-nums text-ink-muted">
              {unit.completedLessons}/{unit.totalLessons}
            </span>
          )}
        </div>
      </header>

      <div className="relative mt-3" style={{ height }}>
        <svg
          aria-hidden
          focusable="false"
          className="absolute inset-0 z-0 h-full w-full"
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
        >
          <path
            d={baseD}
            fill="none"
            stroke="#d9e5dd"
            strokeWidth={12}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {progressD ? (
            <path
              d={progressD}
              fill="none"
              stroke="var(--st-green)"
              strokeWidth={12}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
        </svg>

        {unit.nodes.map((node, index) => {
          const NodeComponent = nodeComponentFor(node);
          return (
            <NodeComponent
              key={node.id}
              node={node}
              xPercent={points[index].x}
              y={points[index].y}
              onPremiumClick={onPremiumClick}
              onLockedClick={onLockedClick}
              showLockedHint={lockedHintId === node.id}
            />
          );
        })}
      </div>
    </section>
  );
}
