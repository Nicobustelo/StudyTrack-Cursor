import Link from "next/link";
import { Settings } from "lucide-react";

import { StickyHeader } from "@/components/layout/sticky-header";
import type { TrackViewModel } from "@/lib/track/types";

import { CountdownBadge } from "./countdown-badge";
import { ReadinessBadge } from "./readiness-badge";
import { StreakBadge } from "./streak-badge";

interface TrackHeaderProps {
  vm: Pick<
    TrackViewModel,
    | "examId"
    | "subjectName"
    | "daysUntilExam"
    | "targetGrade"
    | "readinessScore"
    | "streakDays"
    | "emergencyMode"
  >;
}

/**
 * Header sticky del track (spec 11.1 / 23): materia + streak + readiness +
 * countdown. Fondo 100% opaco vía StickyHeader (spec 41.3).
 */
export function TrackHeader({ vm }: TrackHeaderProps) {
  return (
    <StickyHeader>
      <div className="mx-auto w-full max-w-md px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <h1 className="min-w-0 truncate text-lg font-extrabold leading-tight text-ink">
            {vm.subjectName}
          </h1>
          <div className="flex shrink-0 items-center gap-1.5">
            <StreakBadge days={vm.streakDays} />
            <ReadinessBadge score={vm.readinessScore} />
            <Link
              href={`/exams/${vm.examId}/settings`}
              aria-label="Ajustes del examen"
              className="flex size-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-muted hover:text-ink"
            >
              <Settings className="size-4.5" aria-hidden />
            </Link>
          </div>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <CountdownBadge
            daysUntilExam={vm.daysUntilExam}
            targetGrade={vm.targetGrade}
            emergency={vm.emergencyMode}
          />
        </div>
      </div>
    </StickyHeader>
  );
}
