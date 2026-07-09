import {
  BookOpen,
  FileText,
  Lock,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { cn } from "@/lib/utils";

type TrackRow = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  state: "daily" | "unlocked" | "premium" | "locked";
  badge: string;
};

/* Mockup de la sección track (spec 8.5). */
const ROWS: TrackRow[] = [
  {
    icon: Zap,
    title: "Reto diario",
    subtitle: "+15 XP · 7 min",
    state: "daily",
    badge: "Hoy",
  },
  {
    icon: BookOpen,
    title: "Unidad 1",
    subtitle: "Funciones de varias variables",
    state: "unlocked",
    badge: "Desbloqueada",
  },
  {
    icon: BookOpen,
    title: "Unidad 2",
    subtitle: "Derivadas parciales",
    state: "unlocked",
    badge: "Desbloqueada",
  },
  {
    icon: Lock,
    title: "Unidad 3",
    subtitle: "Integrales múltiples",
    state: "premium",
    badge: "PRO",
  },
  {
    icon: FileText,
    title: "Simulacro final",
    subtitle: "Examen completo cronometrado",
    state: "locked",
    badge: "Bloqueado",
  },
];

const ICON_STYLES: Record<TrackRow["state"], string> = {
  daily: "bg-accent-yellow text-ink shadow-[0_3px_0_0_#dfae3c]",
  unlocked: "bg-brand text-white shadow-[0_3px_0_0_var(--st-green-dark)]",
  premium: "bg-accent-purple/12 text-accent-purple",
  locked: "bg-muted text-locked",
};

const BADGE_STYLES: Record<TrackRow["state"], string> = {
  daily: "bg-accent-yellow/25 text-[#8a6414]",
  unlocked: "bg-brand-light text-brand-dark",
  premium: "bg-accent-purple/12 text-accent-purple",
  locked: "bg-muted text-ink-muted",
};

export function TrackSection() {
  return (
    <section id="track" className="scroll-mt-20 py-20">
      <PageContainer size="wide">
        <h2 className="mx-auto max-w-2xl text-center text-3xl tracking-tight text-ink sm:text-4xl">
          Un camino claro hasta el examen.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-center text-base text-ink-muted">
          Cada día sabés exactamente qué te toca. Nada de adivinar por dónde
          seguir.
        </p>

        <div className="relative mx-auto mt-12 max-w-md">
          {/* Riel vertical punteado que conecta los pasos */}
          <div
            aria-hidden="true"
            className="absolute top-8 bottom-8 left-[27px] border-l-2 border-dashed border-locked"
          />

          <ul className="relative flex flex-col gap-4">
            {ROWS.map(({ icon: Icon, title, subtitle, state, badge }) => (
              <li
                key={title}
                className={cn(
                  "flex items-center gap-4 rounded-2xl p-4 ring-1 ring-border",
                  state === "daily"
                    ? "bg-surface shadow-card ring-2 ring-accent-yellow"
                    : "bg-surface",
                  state === "locked" && "opacity-80",
                )}
              >
                <span
                  className={cn(
                    "relative z-10 flex size-[38px] shrink-0 items-center justify-center rounded-full",
                    ICON_STYLES[state],
                  )}
                >
                  <Icon
                    className="size-4.5"
                    fill={state === "daily" ? "currentColor" : "none"}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-[15px] font-bold text-ink">
                    {title}
                  </p>
                  <p className="truncate text-sm text-ink-muted">{subtitle}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold",
                    BADGE_STYLES[state],
                  )}
                >
                  {badge}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </PageContainer>
    </section>
  );
}
