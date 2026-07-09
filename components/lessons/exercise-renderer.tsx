"use client";

import type { Exercise } from "@/lib/exercises/types";
import type { UserAnswer } from "@/lib/exercises/evaluate-answer";

import { ClassificationExerciseComponent } from "./classification-exercise";
import { ExerciseErrorFallback } from "./exercise-error-fallback";
import { FillBlankExerciseComponent } from "./fill-blank-exercise";
import { MatchingExerciseComponent } from "./matching-exercise";
import { MultipleChoiceExercise } from "./multiple-choice-exercise";
import { OrderingExerciseComponent } from "./ordering-exercise";
import { ShortCaseExerciseComponent } from "./short-case-exercise";
import { TrueFalseExerciseComponent } from "./true-false-exercise";

interface ExerciseRendererProps {
  exercise: Exercise | null;
  invalid?: boolean;
  disabled?: boolean;
  onAnswer: (answer: UserAnswer) => void;
  onSkip: () => void;
}

export function ExerciseRenderer({
  exercise,
  invalid,
  disabled,
  onAnswer,
  onSkip,
}: ExerciseRendererProps) {
  if (!exercise || invalid) {
    return <ExerciseErrorFallback onSkip={onSkip} />;
  }

  switch (exercise.type) {
    case "multiple_choice":
      return (
        <MultipleChoiceExercise
          prompt={exercise.prompt}
          options={exercise.options}
          disabled={disabled}
          onAnswer={(index) =>
            onAnswer({ kind: "option_index", data: index })
          }
        />
      );

    case "pick_incorrect":
      return (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wide text-destructive">
            Elegí la afirmación incorrecta
          </p>
          <MultipleChoiceExercise
            prompt={exercise.prompt}
            options={exercise.options}
            disabled={disabled}
            onAnswer={(index) =>
              onAnswer({ kind: "option_index", data: index })
            }
          />
        </div>
      );

    case "fill_blank":
    case "fill_sentence":
      return (
        <FillBlankExerciseComponent
          exercise={exercise}
          disabled={disabled}
          onTextAnswer={(text) => onAnswer({ kind: "text", data: text })}
          onOptionAnswer={(index) => {
            const optionText = exercise.options?.[index];
            if (optionText) {
              onAnswer({ kind: "text", data: optionText });
            } else {
              onAnswer({ kind: "option_index", data: index });
            }
          }}
        />
      );

    case "matching":
      return (
        <MatchingExerciseComponent
          exercise={exercise}
          disabled={disabled}
          onComplete={(pairs) => onAnswer({ kind: "pairs", data: pairs })}
        />
      );

    case "ordering":
      return (
        <OrderingExerciseComponent
          exercise={exercise}
          disabled={disabled}
          onComplete={(order) => onAnswer({ kind: "order", data: order })}
        />
      );

    case "true_false":
      return (
        <TrueFalseExerciseComponent
          exercise={exercise}
          disabled={disabled}
          onAnswer={(value) => onAnswer({ kind: "boolean", data: value })}
        />
      );

    case "classification":
      return (
        <ClassificationExerciseComponent
          exercise={exercise}
          disabled={disabled}
          onComplete={(assignments) =>
            onAnswer({ kind: "assignments", data: assignments })
          }
        />
      );

    case "short_case":
      return (
        <ShortCaseExerciseComponent
          exercise={exercise}
          disabled={disabled}
          onTextAnswer={(text) => onAnswer({ kind: "text", data: text })}
          onOptionAnswer={(index) =>
            onAnswer({ kind: "option_index", data: index })
          }
        />
      );

    default:
      return <ExerciseErrorFallback onSkip={onSkip} />;
  }
}
