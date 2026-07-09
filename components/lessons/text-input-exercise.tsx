"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TextInputExerciseProps {
  prompt: string;
  placeholder?: string;
  disabled?: boolean;
  onConfirm: (text: string) => void;
}

/** Fallback text input — spec 41.1 para fill_blank/fill_sentence/short_case sin options. */
export function TextInputExercise({
  prompt,
  placeholder = "Escribí tu respuesta…",
  disabled,
  onConfirm,
}: TextInputExerciseProps) {
  const [value, setValue] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base font-medium leading-relaxed text-ink">{prompt}</p>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="h-12 rounded-lg"
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.trim()) {
            onConfirm(value.trim());
          }
        }}
      />
      <Button
        size="lg"
        className="w-full"
        disabled={disabled || !value.trim()}
        onClick={() => onConfirm(value.trim())}
      >
        Confirmar
      </Button>
    </div>
  );
}

interface OptionListProps {
  prompt: string;
  options: string[];
  selectedIndex: number | null;
  disabled?: boolean;
  highlightIncorrect?: boolean;
  onSelect: (index: number) => void;
}

export function OptionListExercise({
  prompt,
  options,
  selectedIndex,
  disabled,
  highlightIncorrect,
  onSelect,
}: OptionListProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-base font-medium leading-relaxed text-ink">{prompt}</p>
      <div className="flex flex-col gap-2">
        {options.map((option, index) => (
          <button
            key={index}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(index)}
            className={cn(
              "rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all",
              selectedIndex === index
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-surface hover:border-primary/40",
              disabled && "pointer-events-none opacity-70",
            )}
          >
            {highlightIncorrect ? (
              <span className="text-xs font-bold uppercase tracking-wide text-destructive">
                Incorrecta ·{" "}
              </span>
            ) : null}
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
