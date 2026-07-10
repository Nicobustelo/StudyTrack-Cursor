"use client";

import * as React from "react";
import { FileText, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ACCEPTED_MATERIAL_TYPES,
  MAX_FREE_MATERIALS,
} from "@/lib/onboarding/constants";
import type { OnboardingMaterial } from "@/lib/onboarding/types";
import { cn } from "@/lib/utils";

type FileUploadStepProps = {
  materials: OnboardingMaterial[];
  onChange: (materials: OnboardingMaterial[]) => void;
};

function createMaterialId(): string {
  return crypto.randomUUID();
}

function inferFileType(file: File): string {
  return file.type || "application/octet-stream";
}

export function isSupportedMaterialFile(file: File): boolean {
  const type = inferFileType(file);
  if (
    type === "application/pdf" ||
    type === "text/plain" ||
    type === "text/markdown"
  ) {
    return true;
  }
  return /\.(pdf|txt|md|markdown)$/i.test(file.name);
}

export function FileUploadStep({ materials, onChange }: FileUploadStepProps) {
  const [dragOver, setDragOver] = React.useState(false);
  const [showPaste, setShowPaste] = React.useState(false);
  const [pasteText, setPasteText] = React.useState("");
  const [typeError, setTypeError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | File[]) => {
    const list = Array.from(files);
    const unsupported = list.filter((file) => !isSupportedMaterialFile(file));
    if (unsupported.length > 0) {
      setTypeError(
        "Solo aceptamos PDF, TXT o Markdown. Para imágenes o Word, exportá a PDF o pegá el texto.",
      );
    } else {
      setTypeError(null);
    }

    const supported = list.filter((file) => isSupportedMaterialFile(file));
    const remaining = MAX_FREE_MATERIALS - materials.length;
    const toAdd = supported.slice(0, remaining).map((file) => ({
      id: createMaterialId(),
      file,
      fileName: file.name,
      fileType: inferFileType(file),
      sourceKind: inferFileType(file).startsWith("image/")
        ? ("photo" as const)
        : inferFileType(file) === "application/pdf"
          ? ("pdf" as const)
          : ("notes" as const),
    }));
    if (toAdd.length > 0) {
      onChange([...materials, ...toAdd]);
    }
  };

  const removeMaterial = (id: string) => {
    onChange(materials.filter((item) => item.id !== id));
  };

  const savePastedText = () => {
    const trimmed = pasteText.trim();
    if (!trimmed || materials.length >= MAX_FREE_MATERIALS) return;

    onChange([
      ...materials,
      {
        id: createMaterialId(),
        pastedText: trimmed,
        fileName: `Texto pegado ${materials.filter((m) => m.pastedText).length + 1}`,
        fileType: "text/plain",
        sourceKind: "pasted_text",
      },
    ]);
    setPasteText("");
    setShowPaste(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          if (event.dataTransfer.files.length > 0) {
            addFiles(event.dataTransfer.files);
          }
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-10 text-center transition-colors duration-200",
          dragOver
            ? "border-brand bg-brand-light/50"
            : "border-border bg-surface",
        )}
      >
        <Upload className="mb-3 size-10 text-brand-dark" />
        <p className="font-bold text-ink">Arrastrá tus archivos acá</p>
        <p className="mt-1 text-sm text-ink-muted">
          PDF, TXT o Markdown (máx. {MAX_FREE_MATERIALS})
        </p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-4"
          disabled={materials.length >= MAX_FREE_MATERIALS}
          onClick={() => inputRef.current?.click()}
        >
          Elegir archivos
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_MATERIAL_TYPES.join(",")}
          className="hidden"
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={materials.length >= MAX_FREE_MATERIALS}
        onClick={() => setShowPaste((prev) => !prev)}
      >
        <FileText className="size-4" />
        Pegar texto en vez de subir archivo
      </Button>

      {showPaste ? (
        <div className="rounded-2xl border border-border bg-surface p-4 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">
          <Textarea
            value={pasteText}
            onChange={(event) => setPasteText(event.target.value)}
            placeholder="Pegá acá tus apuntes, resúmenes o guías…"
            className="min-h-32"
          />
          <div className="mt-3 flex gap-2">
            <Button type="button" size="sm" onClick={savePastedText}>
              Agregar texto
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowPaste(false);
                setPasteText("");
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : null}

      {typeError ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {typeError}
        </p>
      ) : null}

      {materials.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {materials.map((material) => (
            <li
              key={material.id}
              className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5 text-sm"
            >
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="size-4 shrink-0 text-brand-dark" />
                <span className="truncate font-medium">{material.fileName}</span>
                {material.pastedText ? (
                  <span className="shrink-0 rounded-full bg-brand-light px-2 py-0.5 text-xs font-bold text-brand-dark">
                    Texto
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => removeMaterial(material.id)}
                className="rounded-lg p-1 text-ink-muted hover:bg-muted hover:text-ink"
                aria-label={`Quitar ${material.fileName}`}
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="text-sm text-ink-muted">
        Mientras mejor sea el material, mejor va a ser tu track.
      </p>
    </div>
  );
}
