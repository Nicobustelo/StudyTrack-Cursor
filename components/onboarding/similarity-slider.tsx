"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { getSimilarityHelpText } from "@/lib/onboarding/constants";

type SimilaritySliderProps = {
  value: number;
  onChange: (value: number) => void;
  label?: string;
};

export function SimilaritySlider({
  value,
  onChange,
  label = "¿Qué tan parecido creés que va a ser tu examen a este?",
}: SimilaritySliderProps) {
  return (
    <div className="flex flex-col gap-3">
      <Label className="text-sm font-bold leading-snug text-ink">{label}</Label>
      <div className="rounded-2xl border border-border bg-surface px-4 py-4">
        <div className="mb-3 flex items-center justify-between text-sm font-bold">
          <span className="text-ink-muted">1</span>
          <span className="font-heading text-2xl text-brand-dark">{value}</span>
          <span className="text-ink-muted">10</span>
        </div>
        <Slider
          min={1}
          max={10}
          step={1}
          value={[value]}
          onValueChange={(values) => {
            const next = Array.isArray(values) ? values[0] : values;
            if (typeof next === "number") onChange(next);
          }}
          className="py-2"
        />
        <p className="mt-3 text-sm text-ink-muted motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
          {getSimilarityHelpText(value)}
        </p>
      </div>
    </div>
  );
}
