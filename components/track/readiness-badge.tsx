import { cn } from "@/lib/utils";

interface ReadinessBadgeProps {
  score: number;
  className?: string;
}

/** Colores por rango de preparación (spec 15.3). */
function readinessTone(score: number): string {
  if (score <= 30) return "bg-accent-orange/15 text-[#c05a10] ring-accent-orange/30";
  if (score <= 60) return "bg-accent-yellow/25 text-[#8a6410] ring-accent-yellow/50";
  if (score <= 80) return "bg-accent-blue/12 text-[#1b5cb8] ring-accent-blue/30";
  return "bg-brand-light text-brand-dark ring-brand/30";
}

/** Pill del readiness score para el header del track (spec 11.1). */
export function ReadinessBadge({ score, className }: ReadinessBadgeProps) {
  const value = Math.max(0, Math.min(100, Math.round(score)));

  return (
    <span
      data-slot="readiness-badge"
      title={`Preparación estimada: ${value}%`}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold tabular-nums ring-1 ring-inset",
        readinessTone(value),
        className,
      )}
    >
      {value}%
      <span className="hidden font-bold sm:inline">preparado</span>
    </span>
  );
}
