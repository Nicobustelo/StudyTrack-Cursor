"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type MultiSelectOptionProps = {
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
};

export function MultiSelectOption({
  options,
  selected,
  onChange,
}: MultiSelectOptionProps) {
  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
      return;
    }
    onChange([...selected, option]);
  };

  return (
    <div className="flex flex-col gap-3">
      {options.map((option, index) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={cn(
              "flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left text-base font-bold transition-all duration-200 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-reduce:animate-none",
              isSelected
                ? "border-brand bg-brand-light text-brand-dark shadow-[0_2px_0_0_var(--st-green-dark)]"
                : "border-border bg-surface text-ink hover:border-brand/40 hover:bg-muted/50",
            )}
            style={{ animationDelay: `${index * 40}ms`, animationFillMode: "both" }}
          >
            <span>{option}</span>
            {isSelected ? (
              <span className="flex size-7 items-center justify-center rounded-full bg-brand text-white">
                <Check className="size-4" />
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
