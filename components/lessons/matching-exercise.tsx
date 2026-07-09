"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MatchingExercise } from "@/lib/exercises/types";

interface MatchingExerciseProps {
  exercise: MatchingExercise;
  disabled?: boolean;
  onComplete: (pairs: Array<{ left: number; right: number }>) => void;
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function shuffledIndices(items: string[], seedText: string): number[] {
  const indices = items.map((_, index) => index);
  let seed = hashString(`${seedText}:${items.join("|")}`);

  for (let index = indices.length - 1; index > 0; index -= 1) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const swapIndex = seed % (index + 1);
    [indices[index], indices[swapIndex]] = [indices[swapIndex], indices[index]];
  }

  return indices;
}

/** Tap-to-match: seleccionar izquierda, luego derecha. */
export function MatchingExerciseComponent({
  exercise,
  disabled,
  onComplete,
}: MatchingExerciseProps) {
  const shuffledRight = useMemo(
    () => shuffledIndices(exercise.options.right, exercise.prompt),
    [exercise.options.right, exercise.prompt],
  );

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [pairs, setPairs] = useState<Array<{ left: number; right: number }>>(
    [],
  );

  const matchedLefts = new Set(pairs.map((p) => p.left));
  const matchedRights = new Set(pairs.map((p) => p.right));

  function handleLeftClick(leftIndex: number) {
    if (disabled || matchedLefts.has(leftIndex)) return;
    setSelectedLeft(leftIndex);
  }

  function handleRightClick(rightIndex: number) {
    if (disabled || selectedLeft === null || matchedRights.has(rightIndex))
      return;

    const newPairs = [...pairs, { left: selectedLeft, right: rightIndex }];
    setPairs(newPairs);
    setSelectedLeft(null);

    if (newPairs.length === exercise.options.left.length) {
      onComplete(newPairs);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base font-medium leading-relaxed text-ink">
        {exercise.prompt}
      </p>
      <p className="text-xs text-ink-muted">
        Tocá un ítem de la izquierda y luego su pareja a la derecha.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          {exercise.options.left.map((item, index) => (
            <button
              key={`left-${index}`}
              type="button"
              disabled={disabled || matchedLefts.has(index)}
              onClick={() => handleLeftClick(index)}
              className={cn(
                "rounded-xl border-2 px-3 py-2.5 text-left text-sm font-medium transition-all",
                matchedLefts.has(index)
                  ? "border-primary/30 bg-primary/10 opacity-60"
                  : selectedLeft === index
                    ? "border-primary bg-primary/10"
                    : "border-border bg-surface hover:border-primary/40",
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {shuffledRight.map((rightIndex) => (
            <button
              key={`right-${rightIndex}`}
              type="button"
              disabled={disabled || matchedRights.has(rightIndex)}
              onClick={() => handleRightClick(rightIndex)}
              className={cn(
                "rounded-xl border-2 px-3 py-2.5 text-left text-sm font-medium transition-all",
                matchedRights.has(rightIndex)
                  ? "border-primary/30 bg-primary/10 opacity-60"
                  : "border-border bg-surface hover:border-primary/40",
              )}
            >
              {exercise.options.right[rightIndex]}
            </button>
          ))}
        </div>
      </div>

      {pairs.length > 0 && pairs.length < exercise.options.left.length ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setPairs([]);
            setSelectedLeft(null);
          }}
        >
          Reiniciar pares
        </Button>
      ) : null}
    </div>
  );
}
