"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Markdown } from "@/components/ui/markdown";
import { cn } from "@/lib/utils";

interface ExerciseFeedbackProps {
  isCorrect: boolean;
  explanation: string;
  onContinue: () => void;
  continueLabel?: string;
}

export function ExerciseFeedback({
  isCorrect,
  explanation,
  onContinue,
  continueLabel = "Continuar",
}: ExerciseFeedbackProps) {
  return (
    <Card
      className={cn(
        "border-0 shadow-lg ring-2",
        isCorrect ? "ring-primary/40 bg-primary/5" : "ring-destructive/30 bg-destructive/5",
      )}
    >
      <CardContent className="flex flex-col gap-3 pt-6">
        <p
          className={cn(
            "text-base font-bold",
            isCorrect ? "text-primary" : "text-destructive",
          )}
        >
          {isCorrect ? "¡Correcto!" : "Incorrecto"}
        </p>
        <Markdown className="text-sm text-ink-muted">{explanation}</Markdown>
        <Button size="lg" className="w-full" onClick={onContinue}>
          {continueLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
