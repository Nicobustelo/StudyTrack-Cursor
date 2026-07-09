import Link from "next/link";

import { BottomNav } from "@/components/layout/bottom-nav";
import { examBottomNavItems } from "@/components/layout/exam-bottom-nav-items";
import { MobileShell } from "@/components/layout/mobile-shell";
import { StickyHeader } from "@/components/layout/sticky-header";
import { daysUntilLocal } from "@/lib/dates/local";
import type { ExamRow } from "@/lib/exams/queries";
import { getDemoExamSnapshot } from "@/lib/demo/fallback-data";
import { cn } from "@/lib/utils";

type ExamPageShellProps = {
  exam: ExamRow;
  children: React.ReactNode;
  title?: string;
  className?: string;
};

export function ExamPageShell({
  exam,
  children,
  title,
  className,
}: ExamPageShellProps) {
  const demo = getDemoExamSnapshot();
  const readiness = Math.round(exam.readiness_score || demo.readinessScore);
  const daysLeft = daysUntilLocal(exam.exam_date);
  const navItems = examBottomNavItems(exam.id);

  return (
    <MobileShell
      header={
        <StickyHeader>
          <div className="px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/exams/${exam.id}/track`}
                  className="block truncate font-heading text-base font-bold text-ink"
                >
                  {exam.subject_name}
                </Link>
                {title ? (
                  <p className="text-sm text-ink-muted">{title}</p>
                ) : (
                  <p className="text-sm text-ink-muted">
                    Faltan {daysLeft} días · Objetivo {exam.target_grade ?? demo.targetGrade}
                  </p>
                )}
              </div>
              <span className="shrink-0 rounded-full bg-brand-light px-2.5 py-1 text-xs font-bold text-brand-dark">
                {readiness}%
              </span>
            </div>
          </div>
        </StickyHeader>
      }
      bottomNav={<BottomNav items={navItems} />}
      contentClassName={cn("px-4 pt-4", className)}
    >
      {children}
    </MobileShell>
  );
}
