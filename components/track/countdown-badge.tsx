import { CalendarClock, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

interface CountdownBadgeProps {
  daysUntilExam: number;
  targetGrade?: string | null;
  emergency?: boolean;
  className?: string;
}

function countdownLabel(days: number): string {
  if (days <= 0) return "¡El examen es hoy!";
  if (days === 1) return "Falta 1 día";
  return `Faltan ${days} días`;
}

/** Countdown del header (spec 11.1): "Faltan 8 días · Objetivo 8+". */
export function CountdownBadge({
  daysUntilExam,
  targetGrade,
  emergency = false,
  className,
}: CountdownBadgeProps) {
  const urgent = emergency || daysUntilExam <= 3;

  return (
    <span
      data-slot="countdown-badge"
      className={cn(
        "inline-flex min-w-0 items-center gap-1.5 text-sm font-semibold",
        urgent ? "text-[#c05a10]" : "text-ink-muted",
        className,
      )}
    >
      {urgent ? (
        <Zap className="size-4 shrink-0 fill-current" aria-hidden />
      ) : (
        <CalendarClock className="size-4 shrink-0" aria-hidden />
      )}
      <span className="truncate">
        {countdownLabel(daysUntilExam)}
        {targetGrade ? (
          <span className={urgent ? "text-[#c05a10]/80" : "text-ink-muted/80"}>
            {" "}
            · Objetivo {targetGrade}
          </span>
        ) : null}
      </span>
    </span>
  );
}
