"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TrueFalseExercise } from "@/lib/exercises/types";

interface TrueFalseExerciseProps {
  exercise: TrueFalseExercise;
  disabled?: boolean;
  onAnswer: (value: boolean) => void;
}

export function TrueFalseExerciseComponent({
  exercise,
  disabled,
  onAnswer,
}: TrueFalseExerciseProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-base font-medium leading-relaxed text-ink">
        {exercise.prompt}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Button
          size="lg"
          variant="outline"
          disabled={disabled}
          className={cn("h-14")}
          onClick={() => onAnswer(true)}
        >
          Verdadero
        </Button>
        <Button
          size="lg"
          variant="outline"
          disabled={disabled}
          className={cn("h-14")}
          onClick={() => onAnswer(false)}
        >
          Falso
        </Button>
      </div>
    </div>
  );
}
