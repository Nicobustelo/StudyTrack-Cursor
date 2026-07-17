import type { Metadata } from "next";
import { Flame, TrendingUp } from "lucide-react";

import { ExamPageShell } from "@/components/exams/exam-page-shell";
import { Progress } from "@/components/ui/progress";
import {
  getCompletedLessonsCount,
  getExamDailyActivity,
  getExamTopics,
  getExamUnits,
  requireExam,
} from "@/lib/exams/queries";
import { getDemoExamSnapshot } from "@/lib/demo/fallback-data";

export const metadata: Metadata = {
  title: "Progreso — StudyTrack",
};

type ProgressPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProgressPage({ params }: ProgressPageProps) {
  const { id } = await params;
  const { user, exam } = await requireExam(id);
  const demo = getDemoExamSnapshot();

  const [topics, units, completedLessons, activity] = await Promise.all([
    getExamTopics(id),
    getExamUnits(id),
    getCompletedLessonsCount(id, user.id),
    getExamDailyActivity(id, user.id),
  ]);

  const readiness = Math.round(exam.readiness_score || demo.readinessScore);
  const streak = activity.length || demo.streak;
  const freeUnits = units.filter((u) => !u.is_premium);
  const weakTopics = topics
    .filter((t) => (t.mastery_score ?? 0) < 55)
    .slice(0, 3);
  const strongTopics = topics
    .filter((t) => (t.mastery_score ?? 0) >= 70)
    .slice(0, 3);

  return (
    <ExamPageShell exam={exam} title="Progreso">
      <div className="grid gap-5 pb-6 lg:grid-cols-2 lg:items-start">
        <div className="rounded-2xl bg-surface p-5 shadow-card ring-1 ring-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink-muted">Preparación</p>
              <p className="font-heading text-4xl font-extrabold text-ink">
                {readiness}%
              </p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-bold text-orange-600">
              <Flame className="size-4" />
              {streak} días
            </span>
          </div>
          <Progress value={readiness} className="mt-4 h-3" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Lecciones hechas" value={String(completedLessons)} />
          <StatCard
            label="Unidades gratis"
            value={`${freeUnits.length}/${units.length}`}
          />
        </div>

        {weakTopics.length > 0 ? (
          <section className="rounded-xl border border-orange-200 bg-orange-50 p-4 lg:col-span-2">
            <p className="flex items-center gap-2 text-sm font-bold text-ink">
              <TrendingUp className="size-4" />
              Recomendación de hoy
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Vas bien, pero todavía estás flojo en{" "}
              <strong className="text-ink">
                {weakTopics[0]?.title ?? demo.weakTopic}
              </strong>
              . Ese tema aparece con frecuencia en los exámenes anteriores, así
              que te conviene reforzarlo hoy.
            </p>
          </section>
        ) : null}

        <TopicSection title="Temas débiles" topics={weakTopics} tone="weak" />
        <TopicSection title="Temas fuertes" topics={strongTopics} tone="strong" />
      </div>
    </ExamPageShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface p-4 ring-1 ring-border">
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}

function TopicSection({
  title,
  topics,
  tone,
}: {
  title: string;
  topics: Array<{ title: string | null; mastery_score: number }>;
  tone: "weak" | "strong";
}) {
  if (topics.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-muted">
        {title}
      </h2>
      <ul className="flex flex-col gap-2">
        {topics.map((topic) => (
          <li
            key={topic.title}
            className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 ring-1 ring-border"
          >
            <span className="text-sm font-medium text-ink">{topic.title}</span>
            <span
              className={
                tone === "weak"
                  ? "text-sm font-bold text-orange-600"
                  : "text-sm font-bold text-brand-dark"
              }
            >
              {Math.round(topic.mastery_score)}%
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
