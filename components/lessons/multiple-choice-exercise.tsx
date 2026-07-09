"use client";

import { OptionListExercise } from "./text-input-exercise";

interface MultipleChoiceExerciseProps {
  prompt: string;
  options: string[];
  disabled?: boolean;
  onAnswer: (index: number) => void;
}

export function MultipleChoiceExercise({
  prompt,
  options,
  disabled,
  onAnswer,
}: MultipleChoiceExerciseProps) {
  return (
    <OptionListExercise
      prompt={prompt}
      options={options}
      selectedIndex={null}
      disabled={disabled}
      onSelect={onAnswer}
    />
  );
}
