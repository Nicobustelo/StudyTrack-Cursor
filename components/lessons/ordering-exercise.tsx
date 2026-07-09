"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { OrderingExercise } from "@/lib/exercises/types";

interface OrderingExerciseProps {
  exercise: OrderingExercise;
  disabled?: boolean;
  onComplete: (order: number[]) => void;
}

/** Ordering con botones mover arriba/abajo. */
export function OrderingExerciseComponent({
  exercise,
  disabled,
  onComplete,
}: OrderingExerciseProps) {
  const [order, setOrder] = useState<number[]>(() =>
    exercise.options.map((_, i) => i),
  );

  function moveItem(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= order.length) return;
    const next = [...order];
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    setOrder(next);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base font-medium leading-relaxed text-ink">
        {exercise.prompt}
      </p>
      <p className="text-xs text-ink-muted">
        Usá las flechas para ordenar los pasos correctamente.
      </p>

      <div className="flex flex-col gap-2">
        {order.map((itemIndex, position) => (
          <div
            key={itemIndex}
            className="flex items-center gap-2 rounded-xl border-2 border-border bg-surface px-3 py-2"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-ink-muted">
              {position + 1}
            </span>
            <span className="min-w-0 flex-1 text-sm font-medium">
              {exercise.options[itemIndex]}
            </span>
            <div className="flex shrink-0 flex-col gap-0.5">
              <button
                type="button"
                disabled={disabled || position === 0}
                onClick={() => moveItem(position, -1)}
                className="rounded p-0.5 text-ink-muted hover:bg-muted disabled:opacity-30"
                aria-label="Mover arriba"
              >
                <ChevronUp className="size-4" />
              </button>
              <button
                type="button"
                disabled={disabled || position === order.length - 1}
                onClick={() => moveItem(position, 1)}
                className="rounded p-0.5 text-ink-muted hover:bg-muted disabled:opacity-30"
                aria-label="Mover abajo"
              >
                <ChevronDown className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={disabled}
        onClick={() => onComplete(order)}
      >
        Confirmar orden
      </Button>
    </div>
  );
}
