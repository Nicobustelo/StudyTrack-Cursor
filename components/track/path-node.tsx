"use client";

import { createElement } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  Check,
  FileText,
  Lock,
  PencilLine,
  RotateCcw,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { TrackNodeKind, TrackNodeStatus, TrackNodeVM } from "@/lib/track/types";
import { cn } from "@/lib/utils";

const KIND_ICONS: Record<TrackNodeKind, LucideIcon> = {
  lesson: BookOpen,
  practice: PencilLine,
  quiz: Trophy,
  review: RotateCcw,
  mock_exam: FileText,
  daily_challenge: Zap,
};

const STATUS_LABELS: Record<TrackNodeStatus, string> = {
  completed: "Completada",
  current: "Continuar",
  available: "Disponible",
  locked: "Bloqueada",
  premium_locked: "Requiere premium",
  failed_retry: "Reintentar",
  review_due: "Repaso",
};

const CTA_LABELS: Partial<Record<TrackNodeStatus, string>> = {
  current: "Continuar",
  failed_retry: "Reintentar",
  review_due: "Repasar",
  premium_locked: "Desbloquear",
};

function circleTone(node: TrackNodeVM): string {
  switch (node.status) {
    case "completed":
      return "bg-brand text-white shadow-[0_5px_0_0_var(--st-green-dark)]";
    case "current":
      return "bg-brand text-white shadow-[0_6px_0_0_var(--st-green-dark)] ring-[6px] ring-brand/20";
    case "available":
      return node.kind === "daily_challenge"
        ? "bg-accent-yellow text-[#7a5a10] shadow-[0_5px_0_0_#dfaf3f]"
        : "bg-accent-blue text-white shadow-[0_5px_0_0_#1b5cb8]";
    case "locked":
      return "bg-locked text-white shadow-[0_5px_0_0_#b3bdb6]";
    case "premium_locked":
      return cn(
        "bg-accent-purple text-white shadow-[0_5px_0_0_#6d3fd6]",
        node.isCurrent && "ring-[6px] ring-accent-purple/20",
      );
    case "failed_retry":
      return cn(
        "bg-accent-orange text-white shadow-[0_5px_0_0_#d9661c]",
        node.isCurrent && "ring-[6px] ring-accent-orange/20",
      );
    case "review_due":
      return cn(
        "bg-accent-blue text-white shadow-[0_5px_0_0_#1b5cb8]",
        node.isCurrent && "ring-[6px] ring-accent-blue/20",
      );
  }
}

function haloTone(status: TrackNodeStatus): string {
  switch (status) {
    case "premium_locked":
      return "bg-accent-purple/50";
    case "failed_retry":
      return "bg-accent-orange/50";
    case "review_due":
      return "bg-accent-blue/50";
    default:
      return "bg-brand/50";
  }
}

function ctaTone(status: TrackNodeStatus): string {
  switch (status) {
    case "premium_locked":
      return "text-accent-purple";
    case "failed_retry":
      return "text-[#c05a10]";
    case "review_due":
      return "text-[#1b5cb8]";
    default:
      return "text-brand-dark";
  }
}

function nodeIcon(node: TrackNodeVM): LucideIcon {
  switch (node.status) {
    case "completed":
      return Check;
    case "locked":
    case "premium_locked":
      return Lock;
    case "failed_retry":
    case "review_due":
      return RotateCcw;
    default:
      return KIND_ICONS[node.kind];
  }
}

function renderNodeIcon(
  node: TrackNodeVM,
  icon: LucideIcon | undefined,
  className: string,
) {
  const Icon =
    icon &&
    !["completed", "locked", "premium_locked", "failed_retry", "review_due"].includes(
      node.status,
    )
      ? icon
      : nodeIcon(node);

  return createElement(Icon, {
    className,
    strokeWidth: 2.5,
    "aria-hidden": true,
  });
}

export interface PathNodeProps {
  node: TrackNodeVM;
  /** Centro horizontal en % del ancho del contenedor. */
  xPercent: number;
  /** Centro vertical en px dentro de la unidad. */
  y: number;
  /** Override del ícono del tipo de nodo. */
  icon?: LucideIcon;
  onPremiumClick?: (node: TrackNodeVM) => void;
  onLockedClick?: (nodeId: string) => void;
  /** Muestra el hint "Completá la lección anterior" (spec 11.3). */
  showLockedHint?: boolean;
}

/**
 * Nodo circular del camino. Se posiciona con el mismo sistema de coordenadas
 * del path SVG (left % + top px) para que quede SIEMPRE sobre la línea
 * (spec 6.6 / 41.3). Todos los estados son interactivos: nunca hay un nodo
 * muerto (locked muestra hint, premium abre paywall, el resto navega).
 */
export function PathNode({
  node,
  xPercent,
  y,
  icon,
  onPremiumClick,
  onLockedClick,
  showLockedHint = false,
}: PathNodeProps) {
  const isBigKind = node.kind === "quiz" || node.kind === "mock_exam";
  const baseSize = isBigKind ? 72 : 64;
  const size = node.isCurrent ? baseSize + 12 : baseSize;

  const cta = node.isCurrent ? CTA_LABELS[node.status] ?? "Continuar" : null;

  const circle = (
    <span
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      {node.isCurrent ? (
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 rounded-full motion-safe:animate-node-pulse",
            haloTone(node.status),
          )}
        />
      ) : null}
      <span
        className={cn(
          "relative flex h-full w-full items-center justify-center rounded-full transition-transform duration-100",
          "group-active/node:translate-y-[2px]",
          "group-focus-visible/node:ring-4 group-focus-visible/node:ring-ring/50",
          circleTone(node),
        )}
      >
        {renderNodeIcon(
          node,
          icon,
          cn(isBigKind || node.isCurrent ? "size-8" : "size-7"),
        )}
        {node.status === "premium_locked" ? (
          <span className="absolute -top-1.5 right-0 rounded-full bg-accent-yellow px-1.5 py-px text-[9px] font-extrabold tracking-wide text-[#5c4404] ring-2 ring-background">
            PRO
          </span>
        ) : null}
        {node.broken ? (
          <span
            title="Este contenido tuvo un problema al generarse"
            className="absolute -left-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-accent-yellow ring-2 ring-background"
          >
            <AlertTriangle className="size-3 text-[#5c4404]" aria-hidden />
          </span>
        ) : null}
      </span>
    </span>
  );

  const label = (
    <span className="mt-2 flex flex-col items-center gap-1">
      <span
        className={cn(
          "line-clamp-2 max-w-35 text-center text-xs font-bold leading-tight",
          node.status === "locked" ? "text-ink-muted/70" : "text-ink",
        )}
      >
        {node.title}
      </span>
      {node.score != null ? (
        <span className="rounded-full border border-border bg-surface px-2 py-px text-[10px] font-extrabold tabular-nums text-brand-dark">
          {node.score}%
        </span>
      ) : node.broken ? (
        <span className="max-w-35 text-center text-[10px] font-semibold leading-tight text-[#8a6410]">
          Tocá para reintentar o saltar
        </span>
      ) : node.isCurrent && node.durationMinutes ? (
        <span className="text-[10px] font-semibold text-ink-muted">
          {node.durationMinutes} min
        </span>
      ) : null}
    </span>
  );

  const content = (
    <>
      {cta ? (
        <span
          className={cn(
            "absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-xl border border-border bg-surface px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide shadow-card motion-safe:animate-bounce",
            ctaTone(node.status),
          )}
        >
          {cta}
        </span>
      ) : null}
      {circle}
      {label}
      {showLockedHint ? (
        <span
          role="status"
          className="absolute left-1/2 top-full z-30 mt-1 w-max max-w-44 -translate-x-1/2 rounded-lg bg-ink px-2.5 py-1.5 text-center text-[11px] font-semibold text-white shadow-soft animate-in fade-in zoom-in-95"
        >
          Completá la lección anterior
        </span>
      ) : null}
    </>
  );

  const wrapperClass =
    "group/node absolute z-10 flex w-36 -translate-x-1/2 flex-col items-center outline-none";
  const wrapperStyle = {
    left: `${xPercent}%`,
    top: y - size / 2,
  } as const;

  const ariaLabel = `${node.title} — ${STATUS_LABELS[node.status]}`;

  if (node.status === "locked") {
    return (
      <button
        type="button"
        data-slot="path-node"
        data-status={node.status}
        aria-label={ariaLabel}
        className={wrapperClass}
        style={wrapperStyle}
        onClick={() => onLockedClick?.(node.id)}
      >
        {content}
      </button>
    );
  }

  if (node.status === "premium_locked") {
    return (
      <button
        type="button"
        data-slot="path-node"
        data-status={node.status}
        data-current={node.isCurrent || undefined}
        aria-label={ariaLabel}
        className={wrapperClass}
        style={wrapperStyle}
        onClick={() => onPremiumClick?.(node)}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={node.href}
      data-slot="path-node"
      data-status={node.status}
      data-current={node.isCurrent || undefined}
      aria-label={ariaLabel}
      className={wrapperClass}
      style={wrapperStyle}
    >
      {content}
    </Link>
  );
}
