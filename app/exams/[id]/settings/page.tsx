import type { Metadata } from "next";
import Link from "next/link";

import { ExamPageShell } from "@/components/exams/exam-page-shell";
import { Button } from "@/components/ui/button";
import { daysUntilLocal } from "@/lib/dates/local";
import { requireExam } from "@/lib/exams/queries";

export const metadata: Metadata = {
  title: "Configuración — StudyTrack",
};

type SettingsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ExamSettingsPage({ params }: SettingsPageProps) {
  const { id } = await params;
  const { exam } = await requireExam(id);

  const rows = [
    { label: "Materia", value: exam.subject_name },
    { label: "Fecha del examen", value: exam.exam_date },
    { label: "Días restantes", value: String(daysUntilLocal(exam.exam_date)) },
    { label: "Nota objetivo", value: exam.target_grade ?? "—" },
    { label: "Nivel actual", value: exam.current_level ?? "—" },
    {
      label: "Tiempo diario",
      value: exam.available_minutes_per_day
        ? `${exam.available_minutes_per_day} min`
        : "—",
    },
    {
      label: "Modo emergencia",
      value: exam.is_emergency_mode ? "Activo" : "Inactivo",
    },
  ];

  return (
    <ExamPageShell exam={exam} title="Configuración">
      <div className="flex flex-col gap-4 pb-6">
        <dl className="divide-y divide-border rounded-2xl bg-surface ring-1 ring-border">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <dt className="text-sm text-ink-muted">{row.label}</dt>
              <dd className="text-sm font-bold text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>

        <Button
          render={<Link href="/onboarding" />}
          variant="secondary"
          className="w-full"
        >
          Editar en onboarding
        </Button>

        <Button
          render={<Link href="/pricing" />}
          variant="outline"
          className="w-full"
        >
          Ver planes premium
        </Button>

        <p className="text-xs leading-relaxed text-ink-muted">
          StudyTrack te ayuda a organizar y practicar tu estudio, pero no
          garantiza una nota específica.
        </p>
      </div>
    </ExamPageShell>
  );
}
