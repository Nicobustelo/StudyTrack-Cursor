import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Plus, Upload } from "lucide-react";

import { ExamPageShell } from "@/components/exams/exam-page-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getExamSources, requireExam } from "@/lib/exams/queries";

export const metadata: Metadata = {
  title: "Materiales — StudyTrack",
};

type MaterialsPageProps = {
  params: Promise<{ id: string }>;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  processing: "Procesando",
  completed: "Listo",
  error: "Error",
};

const QUALITY_BY_STATUS: Record<string, string> = {
  completed: "Alta",
  processing: "Media",
  pending: "Media",
  error: "Baja",
};

export default async function MaterialsPage({ params }: MaterialsPageProps) {
  const { id } = await params;
  const { exam } = await requireExam(id);
  const sources = await getExamSources(id);

  return (
    <ExamPageShell exam={exam} title="Materiales">
      <div className="flex flex-col gap-4 pb-6">
        <div className="flex gap-2">
          <Button render={<Link href="/onboarding" />} className="flex-1">
            <Upload className="size-4" />
            Subir materiales
          </Button>
          <Button
            render={<Link href="/onboarding" />}
            variant="outline"
            size="icon"
            aria-label="Agregar más"
          >
            <Plus className="size-4" />
          </Button>
        </div>

        {sources.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Tu track necesita materiales."
            subtitle="Subí apuntes, PDFs o resúmenes para crear tus lecciones y ejercicios."
            ctaLabel="Subir materiales"
            ctaHref="/onboarding"
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {sources.map((source) => {
              const quality =
                QUALITY_BY_STATUS[source.processing_status] ?? "Media";
              const isLowQuality = quality === "Baja";

              return (
                <li
                  key={source.id}
                  className="rounded-2xl bg-surface p-4 ring-1 ring-border"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-ink">
                        {source.file_name ?? "Material sin nombre"}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        {source.file_type ?? "archivo"} ·{" "}
                        {new Date(source.created_at).toLocaleDateString("es-AR")}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {STATUS_LABELS[source.processing_status] ??
                        source.processing_status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs font-medium text-ink-muted">
                    Calidad estimada: {quality}
                  </p>
                  {isLowQuality ? (
                    <p className="mt-2 text-xs leading-relaxed text-orange-700">
                      Este material parece incompleto o difícil de leer. Podés
                      subir más apuntes para mejorar tu track.
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </ExamPageShell>
  );
}
