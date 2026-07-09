"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ClassificationExercise } from "@/lib/exercises/types";

interface ClassificationExerciseProps {
  exercise: ClassificationExercise;
  disabled?: boolean;
  onComplete: (
    assignments: Array<{ item: number; category: number }>,
  ) => void;
}

/** Classification con taps — sin drag obligatorio. */
export function ClassificationExerciseComponent({
  exercise,
  disabled,
  onComplete,
}: ClassificationExerciseProps) {
  const [assignments, setAssignments] = useState<
    Record<number, number | null>
  >(() =>
    Object.fromEntries(
      exercise.options.items.map((_, i) => [i, null]),
    ),
  );
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  const allAssigned = exercise.options.items.every(
    (_, i) => assignments[i] !== null && assignments[i] !== undefined,
  );

  function handleItemClick(itemIndex: number) {
    if (disabled) return;
    setSelectedItem(itemIndex);
  }

  function handleCategoryClick(categoryIndex: number) {
    if (disabled || selectedItem === null) return;
    setAssignments((prev) => ({ ...prev, [selectedItem]: categoryIndex }));
    setSelectedItem(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base font-medium leading-relaxed text-ink">
        {exercise.prompt}
      </p>
      <p className="text-xs text-ink-muted">
        Tocá un ítem y luego la categoría que le corresponde.
      </p>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">
          Ítems
        </p>
        {exercise.options.items.map((item, index) => {
          const assignedCategory = assignments[index];
          const categoryLabel =
            assignedCategory != null
              ? exercise.options.categories[assignedCategory]
              : null;

          return (
            <button
              key={index}
              type="button"
              disabled={disabled}
              onClick={() => handleItemClick(index)}
              className={cn(
                "rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all",
                selectedItem === index
                  ? "border-primary bg-primary/10"
                  : "border-border bg-surface hover:border-primary/40",
              )}
            >
              {item}
              {categoryLabel ? (
                <span className="mt-1 block text-xs font-normal text-primary">
                  → {categoryLabel}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">
          Categorías
        </p>
        <div className="flex flex-wrap gap-2">
          {exercise.options.categories.map((category, index) => (
            <button
              key={index}
              type="button"
              disabled={disabled || selectedItem === null}
              onClick={() => handleCategoryClick(index)}
              className={cn(
                "rounded-full border-2 px-4 py-2 text-sm font-medium transition-all",
                selectedItem !== null
                  ? "border-primary/50 hover:bg-primary/10"
                  : "border-border bg-muted opacity-70",
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={disabled || !allAssigned}
        onClick={() =>
          onComplete(
            exercise.options.items.map((_, item) => ({
              item,
              category: assignments[item]!,
            })),
          )
        }
      >
        Confirmar clasificación
      </Button>
    </div>
  );
}
