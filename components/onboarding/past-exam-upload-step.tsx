"use client";

import * as React from "react";
import { ChevronDown, FileText, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DIFFICULTY_OPTIONS,
  FORMAT_MATCH_OPTIONS,
  PAST_EXAM_KIND_OPTIONS,
  SCOPE_MATCH_OPTIONS,
  TEACHER_MATCH_OPTIONS,
} from "@/lib/onboarding/constants";
import type { OnboardingPastExam, PastExamsChoice } from "@/lib/onboarding/types";
import { cn } from "@/lib/utils";

import { OptionCard } from "./option-card";
import { SimilaritySlider } from "./similarity-slider";

type PastExamUploadStepProps = {
  choice?: PastExamsChoice;
  pastExams: OnboardingPastExam[];
  onChoiceChange: (choice: PastExamsChoice) => void;
  onPastExamsChange: (exams: OnboardingPastExam[]) => void;
};

function createPastExamId(): string {
  return crypto.randomUUID();
}

function defaultMetadata(index: number) {
  return {
    title: `Parcial ${index + 1}`,
    pastExamKind: "Parcial",
    teacherMatch: "No sé",
    scopeMatch: "No sé",
    formatMatch: "No sé",
    year: "",
    difficultyPerceived: "No sé",
    userSimilarityScore: 5,
    userNotes: "",
  };
}

function MetadataSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-bold text-ink-muted">{label}</Label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm font-medium"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function PastExamMetadataForm({
  exam,
  onUpdate,
}: {
  exam: OnboardingPastExam;
  onUpdate: (exam: OnboardingPastExam) => void;
}) {
  const [open, setOpen] = React.useState(true);
  const meta = exam.metadata;

  const patch = (partial: Partial<OnboardingPastExam["metadata"]>) => {
    onUpdate({ ...exam, metadata: { ...meta, ...partial } });
  };

  return (
    <div className="rounded-2xl border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div>
          <p className="font-bold text-ink">{exam.fileName}</p>
          <p className="text-xs text-ink-muted">{meta.title || "Completá los datos"}</p>
        </div>
        <ChevronDown
          className={cn(
            "size-5 text-ink-muted transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="flex flex-col gap-3 border-t border-border px-4 py-4 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-bold text-ink-muted">Nombre</Label>
            <Input
              value={meta.title}
              onChange={(event) => patch({ title: event.target.value })}
              placeholder="Parcial 1 - 2024"
            />
          </div>

          <MetadataSelect
            label="Tipo"
            value={meta.pastExamKind}
            options={PAST_EXAM_KIND_OPTIONS}
            onChange={(value) => patch({ pastExamKind: value })}
          />
          <MetadataSelect
            label="Profesor/cátedra"
            value={meta.teacherMatch}
            options={TEACHER_MATCH_OPTIONS}
            onChange={(value) => patch({ teacherMatch: value })}
          />
          <MetadataSelect
            label="Alcance"
            value={meta.scopeMatch}
            options={SCOPE_MATCH_OPTIONS}
            onChange={(value) => patch({ scopeMatch: value })}
          />
          <MetadataSelect
            label="Formato"
            value={meta.formatMatch}
            options={FORMAT_MATCH_OPTIONS}
            onChange={(value) => patch({ formatMatch: value })}
          />
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-bold text-ink-muted">
              Año o fecha aproximada (opcional)
            </Label>
            <Input
              value={meta.year ?? ""}
              onChange={(event) => patch({ year: event.target.value })}
              placeholder="2024"
            />
          </div>
          <MetadataSelect
            label="Dificultad percibida"
            value={meta.difficultyPerceived}
            options={DIFFICULTY_OPTIONS}
            onChange={(value) => patch({ difficultyPerceived: value })}
          />

          <SimilaritySlider
            value={meta.userSimilarityScore}
            onChange={(value) => patch({ userSimilarityScore: value })}
          />

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-bold text-ink-muted">
              ¿Querés aclarar algo sobre este examen?
            </Label>
            <Textarea
              value={meta.userNotes ?? ""}
              onChange={(event) => patch({ userNotes: event.target.value })}
              placeholder="Era de otro profesor, el formato cambió este año…"
              className="min-h-20"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function PastExamUploadStep({
  choice,
  pastExams,
  onChoiceChange,
  onPastExamsChange,
}: PastExamUploadStepProps) {
  const [showPaste, setShowPaste] = React.useState(false);
  const [pasteText, setPasteText] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | File[]) => {
    const next = [
      ...pastExams,
      ...Array.from(files).map((file, index) => ({
        id: createPastExamId(),
        file,
        fileName: file.name,
        fileType: file.type || "application/pdf",
        metadata: defaultMetadata(pastExams.length + index),
      })),
    ];
    onPastExamsChange(next);
  };

  const savePastedText = () => {
    const trimmed = pasteText.trim();
    if (!trimmed) return;
    onPastExamsChange([
      ...pastExams,
      {
        id: createPastExamId(),
        pastedText: trimmed,
        fileName: `Examen pegado ${pastExams.length + 1}`,
        fileType: "text/plain",
        metadata: defaultMetadata(pastExams.length),
      },
    ]);
    setPasteText("");
    setShowPaste(false);
  };

  if (!choice) {
    return (
      <div className="flex flex-col gap-3">
        <OptionCard
          label="Sí, subir exámenes"
          onSelect={() => onChoiceChange("upload")}
          index={0}
        />
        <OptionCard
          label="No tengo"
          onSelect={() => onChoiceChange("none")}
          index={1}
        />
        <OptionCard
          label="Los agrego después"
          onSelect={() => onChoiceChange("later")}
          index={2}
        />
      </div>
    );
  }

  if (choice === "none" || choice === "later") {
    return (
      <div className="rounded-2xl border border-border bg-brand-light/40 px-4 py-4 text-sm text-brand-dark">
        {choice === "none"
          ? "No hay problema. Podés sumar exámenes anteriores más adelante desde Materiales."
          : "Perfecto. Los podés cargar cuando los tengas a mano."}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-border bg-surface px-4 py-8 text-center">
        <Upload className="mb-2 size-8 text-brand-dark" />
        <p className="font-bold text-ink">Subí parciales o finales anteriores</p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-3"
          onClick={() => inputRef.current?.click()}
        >
          Elegir archivos
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="application/pdf,image/*,text/plain"
          className="hidden"
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      <Button type="button" variant="outline" onClick={() => setShowPaste((p) => !p)}>
        <FileText className="size-4" />
        Pegar texto del examen
      </Button>

      {showPaste ? (
        <div className="rounded-2xl border border-border p-4">
          <Textarea
            value={pasteText}
            onChange={(event) => setPasteText(event.target.value)}
            placeholder="Pegá el contenido del examen anterior…"
            className="min-h-28"
          />
          <Button type="button" size="sm" className="mt-3" onClick={savePastedText}>
            Agregar examen
          </Button>
        </div>
      ) : null}

      {pastExams.map((exam) => (
        <div key={exam.id} className="relative">
          <button
            type="button"
            onClick={() =>
              onPastExamsChange(pastExams.filter((item) => item.id !== exam.id))
            }
            className="absolute top-2 right-2 z-10 rounded-lg bg-surface p-1 shadow-sm"
            aria-label="Quitar examen"
          >
            <X className="size-4" />
          </button>
          <PastExamMetadataForm
            exam={exam}
            onUpdate={(updated) =>
              onPastExamsChange(
                pastExams.map((item) => (item.id === updated.id ? updated : item)),
              )
            }
          />
        </div>
      ))}
    </div>
  );
}
