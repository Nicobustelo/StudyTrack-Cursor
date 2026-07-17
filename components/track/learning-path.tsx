"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw, Sparkles, Zap } from "lucide-react";

import { PaywallModal } from "@/components/monetization/paywall-modal";
import {
  ANALYTICS_EVENTS,
  captureClientEvent,
} from "@/lib/analytics/client";
import type { TrackViewModel } from "@/lib/track/types";
import { cn } from "@/lib/utils";

import { DailyChallengeCard } from "./daily-challenge-node";
import { PathUnit } from "./path-unit";

const LOCKED_HINT_MS = 2200;

interface LearningPathProps {
  vm: TrackViewModel;
  /** Abre el paywall al cargar (ej: redirect `?paywall=1` desde una lección premium). */
  initialPaywallOpen?: boolean;
}

/**
 * Camino vertical completo del track (spec 5.1 / 6.6 / 23): reto diario,
 * unidades con path SVG continuo, paywall para nodos premium y hint para
 * nodos bloqueados.
 */
export function LearningPath({
  vm,
  initialPaywallOpen = false,
}: LearningPathProps) {
  const router = useRouter();
  const [paywallOpen, setPaywallOpen] = useState(initialPaywallOpen);
  const [refreshing, startRefresh] = useTransition();
  const [lockedHintId, setLockedHintId] = useState<string | null>(null);
  const hintTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const viewTracked = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // track_viewed una sola vez al cargar (spec 20; no-op si PostHog no está).
  useEffect(() => {
    if (viewTracked.current) return;
    viewTracked.current = true;

    const currentUnit = vm.units.find((unit) =>
      unit.nodes.some((node) => node.isCurrent),
    );

    captureClientEvent(ANALYTICS_EVENTS.TRACK_VIEWED, {
      exam_id: vm.examId,
      subject_name: vm.subjectName,
      readiness_score: vm.readinessScore,
      days_until_exam: vm.daysUntilExam,
      is_premium: vm.hasPremiumAccess,
      current_unit: currentUnit?.number,
    });
  }, [vm]);

  // Llevar el nodo current al centro del viewport al entrar.
  useEffect(() => {
    const node = rootRef.current?.querySelector('[data-current="true"]');
    if (!node) return;
    const id = window.requestAnimationFrame(() => {
      node.scrollIntoView({ block: "center", behavior: "auto" });
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(
    () => () => {
      if (hintTimeout.current) clearTimeout(hintTimeout.current);
    },
    [],
  );

  // paywall_seen lo dispara el propio PaywallModal al abrirse.
  const handlePremiumClick = useCallback(() => setPaywallOpen(true), []);

  const handleLockedClick = useCallback((nodeId: string) => {
    setLockedHintId(nodeId);
    if (hintTimeout.current) clearTimeout(hintTimeout.current);
    hintTimeout.current = setTimeout(() => setLockedHintId(null), LOCKED_HINT_MS);
  }, []);

  const unitStartIndices = vm.units.map((_, index) =>
    vm.units
      .slice(0, index)
      .reduce((total, unit) => total + unit.nodes.length, 0),
  );

  return (
    <div ref={rootRef} className="flex flex-col gap-5 px-4 pt-4">
      {vm.loadIssue ? (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-accent-orange/30 bg-accent-orange/10 px-3 py-3 text-[#9a480b] sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 items-start gap-2.5">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p className="text-xs font-semibold leading-relaxed">
              {vm.loadIssue === "not_found"
                ? "No encontramos este examen. Te mostramos un camino de ejemplo para que puedas seguir explorando."
                : vm.loadIssue === "access_unavailable"
                  ? "No pudimos verificar tu acceso Premium. Reintentá antes de abrir contenido bloqueado."
                  : "No pudimos cargar todo tu plan. Te mostramos un ejemplo temporal mientras recuperamos la conexión."}
            </p>
          </div>
          {vm.loadIssue === "not_found" ? (
            <Link
              href="/exams"
              className="shrink-0 self-start rounded-lg bg-white/75 px-3 py-2 text-xs font-extrabold shadow-sm transition-colors hover:bg-white sm:self-auto"
            >
              Ver mis exámenes
            </Link>
          ) : (
            <button
              type="button"
              disabled={refreshing}
              onClick={() => {
                startRefresh(() => router.refresh());
              }}
              className="flex shrink-0 items-center gap-1.5 self-start rounded-lg bg-white/75 px-3 py-2 text-xs font-extrabold shadow-sm transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-60 sm:self-auto"
            >
              <RefreshCw
                className={cn("size-3.5", refreshing && "animate-spin")}
                aria-hidden
              />
              {refreshing ? "Reintentando…" : "Reintentar"}
            </button>
          )}
        </div>
      ) : vm.isDemo || vm.generating ? (
        <p
          role="status"
          className={cn(
            "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold",
            vm.generating
              ? "border-brand/25 bg-brand-light/60 text-brand-dark"
              : "border-accent-blue/25 bg-accent-blue/8 text-[#1b5cb8]",
          )}
        >
          <Sparkles className="size-4 shrink-0" aria-hidden />
          {vm.generating
            ? "Estamos generando tu plan personalizado. Mientras tanto, así se ve un camino completo."
            : "Plan de ejemplo: completá el onboarding para generar tu camino personalizado."}
        </p>
      ) : null}

      {vm.emergencyMode ? (
        <button
          type="button"
          onClick={() => {
            if (!vm.hasPremiumAccess) setPaywallOpen(true);
          }}
          className="flex items-center gap-3 rounded-2xl border border-accent-orange/30 bg-accent-orange/10 p-3.5 text-left transition-all duration-100 active:translate-y-[2px]"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-orange text-white">
            <Zap className="size-5 fill-current" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-extrabold text-[#a34a08]">
              Modo Emergencia
            </span>
            <span className="block text-xs font-semibold leading-snug text-[#c05a10]">
              Te queda poco tiempo. Vamos a priorizar lo que más impacto puede
              tener.
            </span>
          </span>
        </button>
      ) : null}

      {vm.dailyChallenge ? (
        <DailyChallengeCard challenge={vm.dailyChallenge} />
      ) : null}

      <div className="flex flex-col gap-6">
        {vm.units.map((unit, index) => (
          <PathUnit
            key={unit.id}
            unit={unit}
            globalStartIndex={unitStartIndices[index]}
            onPremiumClick={handlePremiumClick}
            onLockedClick={handleLockedClick}
            lockedHintId={lockedHintId}
          />
        ))}
      </div>

      <PaywallModal
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        examId={vm.examId}
        location="track"
      />
    </div>
  );
}
