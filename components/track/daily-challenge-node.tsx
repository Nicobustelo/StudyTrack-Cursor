"use client";

import Link from "next/link";
import { Check, Clock, RotateCcw, Zap } from "lucide-react";

import type { DailyChallengeVM } from "@/lib/track/types";
import { cn } from "@/lib/utils";

import { PathNode, type PathNodeProps } from "./path-node";

/**
 * Nodo de reto diario dentro del camino (spec 6.6: "reto diario como nodo
 * destacado"). Nunca compite por "current" (spec 41.3): es opcional.
 */
export function DailyChallengeNode(props: PathNodeProps) {
  return <PathNode {...props} icon={Zap} />;
}

interface DailyChallengeCardProps {
  challenge: DailyChallengeVM;
  className?: string;
}

/** Card destacada del reto diario arriba del camino (spec 23). */
export function DailyChallengeCard({
  challenge,
  className,
}: DailyChallengeCardProps) {
  const completed = challenge.status === "completed";
  const failed = challenge.status === "failed_retry";

  return (
    <section
      data-slot="daily-challenge-card"
      aria-label="Reto diario"
      className={cn(
        "rounded-2xl border border-border bg-surface p-4 shadow-card",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            completed
              ? "bg-brand-light text-brand-dark"
              : failed
                ? "bg-accent-orange/15 text-[#c05a10]"
                : "bg-accent-yellow/30 text-[#8a6410]",
          )}
        >
          {completed ? (
            <Check className="size-6" strokeWidth={2.5} aria-hidden />
          ) : failed ? (
            <RotateCcw className="size-6" strokeWidth={2.5} aria-hidden />
          ) : (
            <Zap className="size-6 fill-current" aria-hidden />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-ink-muted">
            Reto diario
          </p>
          <h2 className="mt-0.5 line-clamp-2 text-sm font-bold leading-snug text-ink">
            {completed
              ? "¡Reto de hoy completado!"
              : failed
                ? "Casi. Reintentá el reto de hoy."
                : challenge.title}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
            <span className="text-[#8a6410]">+{challenge.xp} XP</span>
            <span aria-hidden>·</span>
            <Clock className="size-3.5" aria-hidden />
            {challenge.durationMinutes} min
          </p>
        </div>

        {!completed ? (
          <Link
            href={challenge.href}
            className={cn(
              "shrink-0 self-center rounded-lg px-4 py-2.5 text-sm font-bold text-white transition-all duration-100 active:translate-y-[3px]",
              failed
                ? "bg-accent-orange shadow-[0_4px_0_0_#d9661c] active:shadow-[0_1px_0_0_#d9661c]"
                : "bg-brand shadow-[0_4px_0_0_var(--st-green-dark)] active:shadow-[0_1px_0_0_var(--st-green-dark)]",
            )}
          >
            {failed ? "Reintentar" : "Empezar"}
          </Link>
        ) : (
          <span className="shrink-0 self-center rounded-full bg-brand-light px-3 py-1.5 text-xs font-extrabold text-brand-dark">
            Hecho ✓
          </span>
        )}
      </div>
    </section>
  );
}
