"use client";

import type { FillBlankExercise, FillSentenceExercise } from "@/lib/exercises/types";
import { allowsFreeTextFallback } from "@/lib/exercises/types";

import { OptionListExercise, TextInputExercise } from "./text-input-exercise";

interface FillBlankExerciseProps {
  exercise: FillBlankExercise | FillSentenceExercise;
  disabled?: boolean;
  onTextAnswer: (text: string) => void;
  onOptionAnswer: (index: number) => void;
}

export function FillBlankExerciseComponent({
  exercise,
  disabled,
  onTextAnswer,
  onOptionAnswer,
}: FillBlankExerciseProps) {
  const hasOptions =
    exercise.options && exercise.options.length > 0;

  if (!hasOptions && allowsFreeTextFallback(exercise)) {
    return (
      <TextInputExercise
        prompt={exercise.prompt}
        disabled={disabled}
        onConfirm={onTextAnswer}
      />
    );
  }

  return (
    <OptionListExercise
      prompt={exercise.prompt}
      options={exercise.options ?? []}
      selectedIndex={null}
      disabled={disabled}
      onSelect={onOptionAnswer}
    />
  );
}
