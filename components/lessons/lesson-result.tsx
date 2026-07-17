"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LessonResultProps {
  passed: boolean;
  scorePercent: number;
  xp: number;
  readinessDelta: number;
  readinessScore: number;
  masteredConcepts: string[];
  missedConcepts: string[];
  passingScore: number;
  nextLessonId: string | null;
  nextLessonTitle: string | null;
  examId: string;
  trackBackUrl: string;
  onRetry: () => void;
}

export function LessonResult({
  passed,
  scorePercent,
  xp,
  readinessDelta,
  readinessScore,
  masteredConcepts,
  missedConcepts,
  passingScore,
  nextLessonId,
  nextLessonTitle,
  examId,
  trackBackUrl,
  onRetry,
}: LessonResultProps) {
  return (
    <div className="flex flex-col gap-5 px-4 py-6">
      <Card
        className={cn(
          "border-0 ring-2",
          passed ? "ring-primary/40 bg-primary/5" : "ring-destructive/30",
        )}
      >
        <CardContent className="flex flex-col gap-2 pt-6">
          <h2 className="text-xl font-bold text-ink">
            {passed ? "Lección completada" : "Todavía no desbloqueaste el siguiente paso"}
          </h2>
          <p className="text-sm text-ink-muted">
            {passed
              ? "Desbloqueaste el siguiente paso del plan."
              : "Fallaste sobre todo en estos conceptos. Te preparamos una explicación más simple y un nuevo intento."}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Score" value={`${scorePercent}%`} />
        <StatCard label="XP" value={`+${xp}`} accent />
        <StatCard
          label="Readiness"
          value={
            readinessDelta >= 0
              ? `+${readinessDelta}%`
              : `${readinessDelta}%`
          }
          sub={`${readinessScore}% total`}
        />
      </div>

      {!passed ? (
        <p className="text-center text-xs text-ink-muted">
          Necesitás al menos {passingScore}% para aprobar.
        </p>
      ) : null}

      {masteredConcepts.length > 0 ? (
        <ConceptList title="Conceptos dominados" items={masteredConcepts} positive />
      ) : null}

      {missedConcepts.length > 0 ? (
        <ConceptList title="Conceptos a reforzar" items={missedConcepts} />
      ) : null}

      <div className="flex flex-col gap-3 pt-2">
        {passed && nextLessonId ? (
          <Button
            size="lg"
            className="h-auto min-h-13 w-full whitespace-normal py-3 text-center leading-snug"
            render={<Link href={`/exams/${examId}/lesson/${nextLessonId}`} />}
          >
            Siguiente: {nextLessonTitle ?? "Lección"}
          </Button>
        ) : null}

        {passed ? (
          <Button
            size="lg"
            variant={nextLessonId ? "outline" : "default"}
            className="w-full"
            render={<Link href={trackBackUrl} />}
          >
            Volver al plan
          </Button>
        ) : (
          <Button size="lg" className="w-full" onClick={onRetry}>
            Reintentar
          </Button>
        )}

        {!passed ? (
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            render={<Link href={trackBackUrl} />}
          >
            Volver al plan
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <Card size="sm" className="text-center">
      <CardContent className="flex min-w-0 flex-col gap-0.5 px-2 py-4 sm:px-4">
        <span className="text-xs text-ink-muted">{label}</span>
        <span
          className={cn(
            "text-lg font-bold",
            accent ? "text-primary" : "text-ink",
          )}
        >
          {value}
        </span>
        {sub ? <span className="text-[10px] text-ink-muted">{sub}</span> : null}
      </CardContent>
    </Card>
  );
}

function ConceptList({
  title,
  items,
  positive,
}: {
  title: string;
  items: string[];
  positive?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <ul className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <li
            key={i}
            className={cn(
              "rounded-lg px-3 py-2 text-sm",
              positive ? "bg-primary/10 text-foreground" : "bg-destructive/10 text-foreground",
            )}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
