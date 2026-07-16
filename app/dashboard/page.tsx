import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ChevronRight, Flame, Plus } from "lucide-react";

import { requireUser } from "@/lib/auth/session";
import { daysUntilLocal } from "@/lib/dates/local";
import { listUserExams } from "@/lib/exams/queries";
import { Logo } from "@/components/brand/logo";
import { AppShell } from "@/components/layout/app-shell";
import { StickyHeader } from "@/components/layout/sticky-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth/sign-out-button";

export const metadata: Metadata = {
  title: "Perfil — StudyTrack",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const user = await requireUser();
  const exams = await listUserExams(user.id);

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, career")
    .eq("id", user.id)
    .maybeSingle();

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
        <h1 className="font-heading text-2xl font-bold text-ink">Tu perfil</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {profile?.full_name ?? profile?.email ?? user.email}
        </p>
        {profile?.career ? (
          <p className="mt-0.5 text-sm text-ink-muted">{profile.career}</p>
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
              {exams.map((exam) => {
                const daysLeft = daysUntilLocal(exam.exam_date);
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
                        <span className="mt-0.5 flex items-center gap-2 text-xs font-medium text-ink-muted">
                          <Flame className="size-3.5 text-orange-500" />
                          Faltan {daysLeft} días · {Math.round(exam.readiness_score)}%
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
