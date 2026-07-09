"use client";

import { Progress } from "@/components/ui/progress";

type ProgressBarProps = {
  step: number;
  totalSteps: number;
};

export function ProgressBar({ step, totalSteps }: ProgressBarProps) {
  const value = Math.round((step / totalSteps) * 100);

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-ink-muted">
        <span>Paso {step} de {totalSteps}</span>
        <span>{value}%</span>
      </div>
      <Progress value={value} className="w-full">
        <></>
      </Progress>
    </div>
  );
}
