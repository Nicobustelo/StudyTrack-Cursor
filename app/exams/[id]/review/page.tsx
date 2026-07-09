import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Zap } from "lucide-react";

import { ExamPageShell } from "@/components/exams/exam-page-shell";
import { Button } from "@/components/ui/button";
import { getDemoExamSnapshot } from "@/lib/demo/fallback-data";
import { requireExam } from "@/lib/exams/queries";

export const metadata: Metadata = {
  title: "Repaso — StudyTrack",
};

type ReviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { id } = await params;
  const { exam } = await requireExam(id);
  const demo = getDemoExamSnapshot();

  return (
    <ExamPageShell exam={exam} title="Repaso">
      <div className="flex flex-col gap-4 pb-6">
        <p className="text-sm text-ink-muted">
          Hoy te conviene reforzar estos temas según tus errores y la fecha del
          examen.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Link href={`/exams/${id}/track`} className="block">
            <Button variant="secondary" className="h-auto w-full flex-col py-4">
              <Zap className="mb-1 size-5" />
              <span className="text-sm font-bold">Repaso rápido</span>
              <span className="text-xs font-medium opacity-80">5 min</span>
            </Button>
          </Link>
          <Link href={`/exams/${id}/track`} className="block">
            <Button className="h-auto w-full flex-col py-4">
              <Clock className="mb-1 size-5" />
              <span className="text-sm font-bold">Repaso completo</span>
              <span className="text-xs font-medium opacity-80">~25 min</span>
            </Button>
          </Link>
        </div>

        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-muted">
            Temas para hoy
          </h2>
          <ul className="flex flex-col gap-2">
            {demo.reviewItems.map((item) => (
              <li
                key={item.title}
                className="rounded-xl bg-surface p-4 ring-1 ring-border"
              >
                <p className="font-bold text-ink">{item.title}</p>
                <p className="mt-0.5 text-sm text-ink-muted">{item.reason}</p>
                <p className="mt-2 text-xs font-medium text-brand-dark">
                  ~{item.minutes} min
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-muted">
            Conceptos débiles
          </h2>
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <p className="font-bold text-ink">{demo.weakTopic}</p>
            <p className="mt-1 text-sm text-ink-muted">
              Este tema aparece seguido en los parciales que subiste. Te conviene
              reforzarlo hoy.
            </p>
          </div>
        </section>
      </div>
    </ExamPageShell>
  );
}
