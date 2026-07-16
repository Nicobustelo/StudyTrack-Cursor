import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, Plus } from "lucide-react";

import { requireUser } from "@/lib/auth/session";
import { daysUntilLocal } from "@/lib/dates/local";
import { listUserExams } from "@/lib/exams/queries";
import { AppShell } from "@/components/layout/app-shell";
import { StickyHeader } from "@/components/layout/sticky-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Mis exámenes — StudyTrack",
};

export default async function ExamsPage() {
  const user = await requireUser();
  const exams = await listUserExams(user.id);

  if (exams.length === 1) {
    redirect(`/exams/${exams[0].id}/track`);
  }

  return (
    <AppShell
      header={
        <StickyHeader>
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <Logo />
            <Link href="/onboarding">
              <Button size="sm" variant="secondary">
                <Plus className="size-4" />
                Nuevo
              </Button>
            </Link>
          </div>
        </StickyHeader>
      }
    >
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:py-10">
        <h1 className="font-heading text-2xl font-bold text-ink">
          Mis exámenes
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Elegí un plan para seguir estudiando.
        </p>

        <div className="mt-6">
          {exams.length === 0 ? (
            <EmptyState
              title="Todavía no tenés ningún plan de estudio."
              subtitle="Creá tu primer examen y convertí tus apuntes en un camino de estudio."
              ctaLabel="Crear plan"
              ctaHref="/onboarding"
            />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {exams.map((exam) => (
                <li key={exam.id}>
                  <Link
                    href={`/exams/${exam.id}/track`}
                    className="flex items-center justify-between rounded-2xl bg-surface p-4 shadow-card ring-1 ring-border"
                  >
                    <div>
                      <p className="font-bold text-ink">{exam.subject_name}</p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        Faltan {daysUntilLocal(exam.exam_date)} días ·{" "}
                        {Math.round(exam.readiness_score)}% listo
                      </p>
                    </div>
                    <ChevronRight className="size-5 text-ink-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
