"use client";

import * as React from "react";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ANALYSIS_MESSAGES } from "@/lib/onboarding/constants";
import type { PipelineProgressResponse } from "@/lib/onboarding/types";
import { cn } from "@/lib/utils";

type AnalyzingScreenProps = {
  examId: string;
  userId: string;
  subjectName: string;
  onComplete: () => void;
  onError?: (message: string) => void;
};

export function AnalyzingScreen({
  examId,
  userId,
  subjectName,
  onComplete,
  onError,
}: AnalyzingScreenProps) {
  const [progress, setProgress] = React.useState<PipelineProgressResponse | null>(
    null,
  );
  const [error, setError] = React.useState<string | null>(null);
  const [messageIndex, setMessageIndex] = React.useState(0);
  const [running, setRunning] = React.useState(false);
  const abortRef = React.useRef(false);

  const runPipeline = React.useCallback(async () => {
    abortRef.current = false;
    setError(null);
    setRunning(true);

    try {
      const startRes = await fetch("/api/analysis/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId, userId }),
      });

      if (!startRes.ok) {
        const body = (await startRes.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(
          body.error ?? "No pudimos iniciar el análisis. Probá de nuevo.",
        );
      }

      let current = (await startRes.json()) as PipelineProgressResponse;
      setProgress(current);

      while (current.hasMore && !abortRef.current) {
        const nextRes = await fetch("/api/analysis/next", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ examId, userId }),
        });

        if (!nextRes.ok) {
          const body = (await nextRes.json().catch(() => ({}))) as {
            error?: string;
            stage?: string;
          };
          throw new Error(
            body.error ?? "El análisis se interrumpió. Podés reintentar.",
          );
        }

        current = (await nextRes.json()) as PipelineProgressResponse;
        setProgress(current);
      }

      if (!abortRef.current) {
        onComplete();
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Algo salió mal mientras armábamos tu track.";
      setError(message);
      onError?.(message);
    } finally {
      setRunning(false);
    }
  }, [examId, userId, onComplete, onError]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => void runPipeline(), 0);
    return () => {
      abortRef.current = true;
      window.clearTimeout(timer);
    };
  }, [runPipeline]);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % ANALYSIS_MESSAGES.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, []);

  const lessonProgress =
    progress?.lessonsTotal && progress.lessonsTotal > 0
      ? Math.round(
          ((progress.lessonsCompleted ?? 0) / progress.lessonsTotal) * 100,
        )
      : progress?.hasMore === false
        ? 100
        : 12;

  const rotatingMessage =
    progress?.lessonTitle ??
    progress?.message ??
    ANALYSIS_MESSAGES[messageIndex];

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-2 py-10 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-8 text-destructive" />
        </div>
        <h2 className="mt-5 font-heading text-xl font-bold text-ink">
          No pudimos terminar el análisis
        </h2>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">{error}</p>
        <Button
          type="button"
          size="lg"
          className="mt-6 w-full max-w-xs"
          onClick={() => void runPipeline()}
          disabled={running}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-2 py-8 text-center">
      <div className="relative mb-6 flex size-20 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-brand-light motion-safe:animate-pulse motion-reduce:animate-none" />
        <Sparkles className="relative size-10 text-brand-dark motion-safe:animate-bounce motion-reduce:animate-none" />
      </div>

      <h2 className="font-heading text-2xl font-bold text-ink">
        Estamos creando tu camino personalizado
      </h2>
      <p className="mt-2 text-sm font-medium text-brand-dark">{subjectName}</p>

      <p
        key={rotatingMessage}
        className="mt-4 min-h-6 text-sm text-ink-muted motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300"
      >
        {rotatingMessage}
      </p>

      <div className="mt-8 w-full max-w-sm">
        <Progress value={lessonProgress} className="w-full">
          <></>
        </Progress>
        <div className="mt-2 flex items-center justify-between text-xs text-ink-muted">
          <span className="flex items-center gap-1.5">
            {running ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : null}
            {progress?.stage ?? "preparando"}
          </span>
          {progress?.lessonsTotal ? (
            <span>
              {progress.lessonsCompleted ?? 0}/{progress.lessonsTotal} lecciones
            </span>
          ) : (
            <span>{lessonProgress}%</span>
          )}
        </div>
      </div>

      <div className="mt-8 grid w-full max-w-sm grid-cols-2 gap-2">
        {ANALYSIS_MESSAGES.slice(0, 4).map((msg, index) => (
          <div
            key={msg}
            className={cn(
              "rounded-xl border px-3 py-2 text-left text-xs font-medium motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300 motion-reduce:animate-none",
              messageIndex % 4 === index
                ? "border-brand/30 bg-brand-light text-brand-dark"
                : "border-border bg-surface text-ink-muted",
            )}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            {msg.replace("…", "")}
          </div>
        ))}
      </div>
    </div>
  );
}
