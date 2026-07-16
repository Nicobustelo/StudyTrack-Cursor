import type { Metadata } from "next";
import Link from "next/link";
import { FileSearch, Plus } from "lucide-react";

import { ExamPageShell } from "@/components/exams/exam-page-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { getExamPastExams, requireExam } from "@/lib/exams/queries";

export const metadata: Metadata = {
  title: "Exámenes anteriores — StudyTrack",
};

type PastExamsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PastExamsPage({ params }: PastExamsPageProps) {
  const { id } = await params;
  const { exam } = await requireExam(id);
  const pastExams = await getExamPastExams(id);

  return (
    <ExamPageShell exam={exam} title="Exámenes anteriores">
      <div className="flex flex-col gap-4 pb-6">
        <Button render={<Link href="/onboarding" />} variant="secondary">
          <Plus className="size-4" />
          Agregar examen anterior
        </Button>

        {pastExams.length === 0 ? (
          <EmptyState
            icon={FileSearch}
            title="No agregaste exámenes anteriores."
            subtitle="No es obligatorio, pero si los tenés podemos crear simulacros más parecidos a cómo suelen tomar."
            ctaLabel="Agregar examen anterior"
            ctaHref="/onboarding"
          />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {pastExams.map((past) => (
              <li
                key={past.id}
                className="rounded-2xl bg-surface p-4 ring-1 ring-border"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-ink">{past.title}</p>
                    <p className="mt-0.5 text-xs capitalize text-ink-muted">
                      {past.past_exam_kind ?? "parcial"}
                    </p>
                  </div>
                  <span className="rounded-full bg-brand-light px-2.5 py-1 text-xs font-bold text-brand-dark">
                    Relevancia: {Math.round(past.final_relevance_score ?? 0)}/10
                  </span>
                </div>
                {past.analysis_summary ? (
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    {past.analysis_summary}
                  </p>
                ) : null}
                <div className="mt-3 flex gap-3 text-xs text-ink-muted">
                  {past.user_similarity_score != null ? (
                    <span>Tu similitud: {past.user_similarity_score}/10</span>
                  ) : null}
                  {past.ai_similarity_score != null ? (
                    <span>IA: {past.ai_similarity_score}/10</span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ExamPageShell>
  );
}
