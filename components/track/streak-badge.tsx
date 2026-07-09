import { Flame } from "lucide-react";

import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  days: number;
  className?: string;
}

/** Racha de días de estudio para el header del track (spec 11.1). */
export function StreakBadge({ days, className }: StreakBadgeProps) {
  const active = days > 0;

  return (
    <span
      data-slot="streak-badge"
      title={
        active
          ? `Racha de ${days} ${days === 1 ? "día" : "días"} estudiando`
          : "Todavía no arrancaste tu racha"
      }
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold tabular-nums ring-1 ring-inset",
        active
          ? "bg-accent-orange/15 text-[#c05a10] ring-accent-orange/30"
          : "bg-muted text-ink-muted ring-border",
        className,
      )}
    >
      <Flame
        className={cn("size-3.5", active && "fill-current")}
        aria-hidden
      />
      {days}
    </span>
  );
}
