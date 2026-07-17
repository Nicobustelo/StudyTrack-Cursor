import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  Gauge,
  Layers3,
  Plus,
} from "lucide-react";

import { requireUser } from "@/lib/auth/session";
import { daysUntilLocal, formatLocalDate } from "@/lib/dates/local";
import { listUserExams } from "@/lib/exams/queries";
import { Logo } from "@/components/brand/logo";
import { AppShell } from "@/components/layout/app-shell";
import { StickyHeader } from "@/components/layout/sticky-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth/sign-out-button";

export const metadata: Metadata = {
  title: "Inicio — StudyTrack",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const [exams, profileResult] = await Promise.all([
    listUserExams(user.id),
    supabase
      .from("profiles")
      .select("full_name, email, career")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  const profile = profileResult.data;
  const today = formatLocalDate();
  const orderedExams = exams.slice().sort((a, b) => {
    const aPast = a.exam_date < today;
    const bPast = b.exam_date < today;
    if (aPast !== bPast) return aPast ? 1 : -1;
    return aPast
      ? b.exam_date.localeCompare(a.exam_date)
      : a.exam_date.localeCompare(b.exam_date);
  });
  const nextExam = orderedExams.find((exam) => exam.exam_date >= today) ?? null;
  const averageReadiness = exams.length
    ? Math.round(
        exams.reduce((total, exam) => total + exam.readiness_score, 0) /
          exams.length,
      )
    : 0;
  const firstName = profile?.full_name?.trim().split(/\s+/)[0];

  function examTiming(examDate: string): string {
    if (examDate < today) return "Fecha pasada";
    const daysLeft = daysUntilLocal(examDate);
    if (daysLeft === 0) return "Es hoy";
    if (daysLeft === 1) return "Falta 1 día";
    return `Faltan ${daysLeft} días`;
  }

  return (
    <AppShell
      header={
        <StickyHeader>
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <Logo />
            <SignOutButton />
          </div>
        </StickyHeader>
      }
    >
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:py-10">
        <h1 className="font-heading text-2xl font-bold text-ink">
          {firstName ? `Hola, ${firstName}` : "Tu espacio de estudio"}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {firstName
            ? "Este es tu punto de partida para seguir avanzando."
            : profile?.email ?? user.email}
        </p>
        {profile?.career ? (
          <p className="mt-0.5 text-sm text-ink-muted">{profile.career}</p>
        ) : null}

        {exams.length > 0 ? (
          <section
            aria-label="Resumen de estudio"
            className="mt-8 grid gap-3 sm:grid-cols-3"
          >
            <div className="rounded-2xl bg-surface p-4 shadow-card ring-1 ring-border">
              <span className="flex size-9 items-center justify-center rounded-xl bg-brand-light text-brand-dark">
                <Layers3 className="size-4.5" aria-hidden />
              </span>
              <p className="mt-3 text-2xl font-extrabold text-ink">{exams.length}</p>
              <p className="text-xs font-semibold text-ink-muted">
                {exams.length === 1 ? "Plan de estudio" : "Planes de estudio"}
              </p>
            </div>

            <div className="rounded-2xl bg-surface p-4 shadow-card ring-1 ring-border">
              <span className="flex size-9 items-center justify-center rounded-xl bg-accent-orange/12 text-accent-orange">
                <CalendarDays className="size-4.5" aria-hidden />
              </span>
              <p className="mt-3 truncate text-base font-extrabold text-ink">
                {nextExam?.subject_name ?? "Sin próximos exámenes"}
              </p>
              <p className="text-xs font-semibold text-ink-muted">
                {nextExam ? examTiming(nextExam.exam_date) : "Creá un plan nuevo"}
              </p>
            </div>

            <div className="rounded-2xl bg-surface p-4 shadow-card ring-1 ring-border">
              <span className="flex size-9 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue">
                <Gauge className="size-4.5" aria-hidden />
              </span>
              <p className="mt-3 text-2xl font-extrabold text-ink">
                {averageReadiness}%
              </p>
              <p className="text-xs font-semibold text-ink-muted">
                Preparación promedio
              </p>
            </div>
          </section>
        ) : null}

        <section className="mt-8 lg:mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Tus planes de estudio</h2>
            <Link href="/onboarding">
              <Button size="sm" variant="secondary">
                <Plus className="size-4" />
                Nuevo
              </Button>
            </Link>
          </div>

          {exams.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Todavía no tenés ningún plan de estudio."
              subtitle="Creá tu primer examen y convertí tus apuntes en un camino de estudio."
              ctaLabel="Crear plan"
              ctaHref="/onboarding"
            />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {orderedExams.map((exam) => {
                const readiness = Math.max(
                  0,
                  Math.min(100, Math.round(exam.readiness_score)),
                );
                return (
                  <li key={exam.id}>
                    <Link
                      href={`/exams/${exam.id}/track`}
                      className="flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-card ring-1 ring-border transition-colors hover:bg-muted/40"
                    >
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand-dark">
                        <BookOpen className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold text-ink">
                          {exam.subject_name}
                        </span>
                        <span className="mt-0.5 block text-xs font-medium text-ink-muted">
                          {examTiming(exam.exam_date)} ·{" "}
                          {exam.status === "ready"
                            ? `${readiness}% listo`
                            : "Generando plan"}
                        </span>
                        <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-muted">
                          <span
                            className="block h-full rounded-full bg-brand"
                            style={{ width: `${readiness}%` }}
                          />
                        </span>
                      </span>
                      <ChevronRight className="size-5 shrink-0 text-ink-muted" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mt-8 max-w-3xl rounded-2xl bg-muted/50 p-4 text-xs leading-relaxed text-ink-muted">
          StudyTrack te ayuda a organizar y practicar tu estudio, pero no
          garantiza una nota específica. Los resultados dependen de tu
          preparación, materiales y desempeño real en el examen.
        </section>
      </div>
    </AppShell>
  );
}
