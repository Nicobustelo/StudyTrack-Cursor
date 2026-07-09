"use client";

import type { ShortCaseExercise } from "@/lib/exercises/types";
import { isOptionIndexAnswer } from "@/lib/exercises/types";

import { OptionListExercise, TextInputExercise } from "./text-input-exercise";

interface ShortCaseExerciseProps {
  exercise: ShortCaseExercise;
  disabled?: boolean;
  onTextAnswer: (text: string) => void;
  onOptionAnswer: (index: number) => void;
}

export function ShortCaseExerciseComponent({
  exercise,
  disabled,
  onTextAnswer,
  onOptionAnswer,
}: ShortCaseExerciseProps) {
  const hasOptions =
    exercise.options &&
    exercise.options.length > 0 &&
    isOptionIndexAnswer(exercise.correct_answer);

  if (!hasOptions) {
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
