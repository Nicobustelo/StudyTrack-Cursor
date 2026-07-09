"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type OptionCardProps = {
  label: string;
  selected?: boolean;
  onSelect: () => void;
  index?: number;
};

export function OptionCard({
  label,
  selected = false,
  onSelect,
  index = 0,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left text-base font-bold transition-all duration-200 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-reduce:animate-none",
        selected
          ? "border-brand bg-brand-light text-brand-dark shadow-[0_2px_0_0_var(--st-green-dark)] motion-safe:scale-[1.02]"
          : "border-border bg-surface text-ink hover:border-brand/40 hover:bg-muted/50 active:scale-[0.99]",
      )}
      style={
        typeof index === "number"
          ? { animationDelay: `${index * 50}ms`, animationFillMode: "both" }
          : undefined
      }
    >
      <span>{label}</span>
      {selected ? (
        <span className="flex size-7 items-center justify-center rounded-full bg-brand text-white motion-safe:animate-in motion-safe:zoom-in motion-safe:duration-200">
          <Check className="size-4" />
        </span>
      ) : null}
    </button>
  );
}
