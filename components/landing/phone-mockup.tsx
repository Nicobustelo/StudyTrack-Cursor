import {
  BarChart3,
  Check,
  FileText,
  Flame,
  Lock,
  Route,
  RotateCcw,
  Target,
  Timer,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";

/*
 * Mockup del teléfono del hero (spec 8.1): track vertical con nodo actual
 * "Reto diario", readiness 42%, countdown "Faltan 8 días" y tarjetas
 * flotantes. Coordenadas del track en px fijos dentro de un lienzo de
 * 270×300 para que el path SVG y los nodos nunca se desalineen.
 */

const TRACK_W = 270;
const TRACK_H = 300;

// Centros de los nodos sobre el lienzo del track.
const NODES = {
  done1: { x: 135, y: 30 },
  done2: { x: 75, y: 100 },
  current: { x: 165, y: 175 },
  locked: { x: 85, y: 255 },
} as const;

function segment(
  a: { x: number; y: number },
  b: { x: number; y: number },
): string {
  // Curva cúbica con manijas verticales: pasa exactamente por ambos centros.
  const bend = Math.min(38, (b.y - a.y) / 2);
  return `M${a.x} ${a.y} C${a.x} ${a.y + bend}, ${b.x} ${b.y - bend}, ${b.x} ${b.y}`;
}

function NodeShell({
  x,
  y,
  className,
  children,
}: {
  x: number;
  y: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn("absolute -translate-x-1/2 -translate-y-1/2", className)}
      style={{ left: x, top: y }}
    >
      {children}
    </div>
  );
}

export function PhoneMockup({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto w-[290px]", className)}>
      {/* Chip flotante: countdown */}
      <div className="absolute -left-5 top-4 z-30 flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[11px] font-bold text-white shadow-soft motion-safe:animate-float">
        <Timer className="size-3.5 text-accent-orange" />
        Faltan 8 días
      </div>

      {/* Tarjeta flotante: preparación */}
      <div className="absolute -right-7 top-40 z-30 w-40 rounded-2xl bg-surface p-3 shadow-soft ring-1 ring-border motion-safe:animate-float-delayed">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="size-3.5 text-brand" />
          <p className="text-[11px] font-bold text-ink-muted">Preparación</p>
        </div>
        <p className="mt-0.5 font-heading text-2xl font-extrabold text-ink">
          42%
        </p>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-brand-light">
          <div className="h-full w-[42%] rounded-full bg-brand" />
        </div>
      </div>

      {/* Tarjeta flotante: próximo paso */}
      <div className="absolute -left-7 bottom-20 z-30 w-48 rounded-2xl bg-surface p-3 shadow-soft ring-1 ring-border motion-safe:animate-float">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-blue/12 text-accent-blue">
            <Target className="size-4" />
          </span>
          <div>
            <p className="text-[10px] font-bold tracking-wide text-ink-muted uppercase">
              Próximo paso
            </p>
            <p className="text-[12px] leading-snug font-bold text-ink">
              Completar definiciones clave
            </p>
          </div>
        </div>
      </div>

      {/* Marco del teléfono */}
      <div className="relative overflow-hidden rounded-[44px] border-10 border-ink bg-background shadow-2xl">
        {/* Notch */}
        <div className="absolute left-1/2 top-2.5 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-ink" />

        <div className="flex h-[566px] flex-col pt-10">
          {/* Header del track (opaco, spec 23) */}
          <div className="border-b border-border bg-background px-4 pb-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate font-heading text-[13px] font-bold text-ink">
                Análisis Matemático II
              </p>
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-accent-orange/12 px-2 py-0.5 text-[11px] font-bold text-accent-orange">
                <Flame className="size-3" fill="currentColor" />3
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="text-[11px] font-medium text-ink-muted">
                Faltan 8 días · Objetivo 8+
              </p>
              <span className="shrink-0 rounded-full bg-brand-light px-2 py-0.5 text-[11px] font-bold text-brand-dark">
                42%
              </span>
            </div>
          </div>

          {/* Banner de unidad */}
          <div className="mx-4 mt-3 rounded-2xl bg-brand px-4 py-2 text-white shadow-[0_3px_0_0_var(--st-green-dark)]">
            <p className="text-[9px] font-bold tracking-widest uppercase opacity-80">
              Unidad 2
            </p>
            <p className="font-heading text-[13px] font-bold">
              Derivadas parciales
            </p>
          </div>

          {/* Camino vertical */}
          <div className="relative mx-auto mt-1" style={{ width: TRACK_W, height: TRACK_H }}>
            <svg
              viewBox={`0 0 ${TRACK_W} ${TRACK_H}`}
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              {/* Tramo recorrido */}
              <path
                d={segment(NODES.done1, NODES.done2)}
                fill="none"
                stroke="var(--st-green)"
                strokeOpacity="0.45"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="0.5 12"
              />
              <path
                d={segment(NODES.done2, NODES.current)}
                fill="none"
                stroke="var(--st-green)"
                strokeOpacity="0.45"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="0.5 12"
              />
              {/* Tramo por recorrer */}
              <path
                d={segment(NODES.current, NODES.locked)}
                fill="none"
                stroke="var(--st-locked)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="0.5 12"
              />
            </svg>

            {/* Nodos completados */}
            {[NODES.done1, NODES.done2].map((node) => (
              <NodeShell key={`${node.x}-${node.y}`} x={node.x} y={node.y}>
                <span className="flex size-12 items-center justify-center rounded-full bg-brand text-white shadow-[0_3px_0_0_var(--st-green-dark)]">
                  <Check className="size-5" strokeWidth={3.5} />
                </span>
              </NodeShell>
            ))}

            {/* Nodo actual: Reto diario */}
            <NodeShell x={NODES.current.x} y={NODES.current.y} className="z-10">
              <span className="relative flex size-16 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-accent-yellow motion-safe:animate-node-pulse" />
                <span className="relative flex size-16 items-center justify-center rounded-full bg-accent-yellow text-ink shadow-[0_4px_0_0_#dfae3c] ring-4 ring-accent-yellow/30">
                  <Zap className="size-6" fill="currentColor" />
                </span>
              </span>
              <span className="absolute left-1/2 top-full mt-2 -translate-x-1/2 rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold whitespace-nowrap text-white">
                Reto diario
              </span>
            </NodeShell>

            {/* Nodo bloqueado */}
            <NodeShell x={NODES.locked.x} y={NODES.locked.y}>
              <span className="flex size-12 items-center justify-center rounded-full bg-muted text-locked shadow-[0_3px_0_0_var(--st-locked)] ring-1 ring-border">
                <Lock className="size-5" />
              </span>
            </NodeShell>
          </div>

          {/* Mini bottom nav */}
          <div className="mt-auto flex h-12 items-center justify-around border-t border-border bg-surface px-3">
            <span className="flex h-7 w-10 items-center justify-center rounded-full bg-brand-light text-brand-dark">
              <Route className="size-4" strokeWidth={2.5} />
            </span>
            <RotateCcw className="size-4 text-locked" />
            <FileText className="size-4 text-locked" />
            <BarChart3 className="size-4 text-locked" />
            <User className="size-4 text-locked" />
          </div>
        </div>
      </div>
    </div>
  );
}
