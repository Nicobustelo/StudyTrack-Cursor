"use client";

import { CalendarDays } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { daysUntilExam, formatLocalDate } from "@/lib/onboarding/constants";
import { cn } from "@/lib/utils";

type DateStepProps = {
  subjectName?: string;
  value?: string;
  onChange: (date: string) => void;
};

export function DateStep({ subjectName, value, onChange }: DateStepProps) {
  const minDate = formatLocalDate(new Date());
  const daysLeft = value ? daysUntilExam(value) : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="exam-date" className="text-sm font-bold text-ink">
          Fecha del examen
        </Label>
        <div className="relative">
          <CalendarDays className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-ink-muted" />
          <Input
            id="exam-date"
            type="date"
            min={minDate}
            value={value ?? ""}
            onChange={(event) => onChange(event.target.value)}
            className="h-12 rounded-lg pl-11"
          />
        </div>
      </div>

      {daysLeft !== null ? (
        <div
          className={cn(
            "rounded-2xl border px-4 py-3 text-sm font-medium motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300",
            daysLeft < 3
              ? "border-accent-orange/30 bg-accent-orange/10 text-ink"
              : "border-brand/20 bg-brand-light text-brand-dark",
          )}
        >
          {subjectName ? (
            <p className="font-bold">{subjectName}</p>
          ) : null}
          <p className="mt-1">
            Te quedan{" "}
            <span className="font-heading text-lg font-bold">{daysLeft}</span>{" "}
            {daysLeft === 1 ? "día" : "días"}.
          </p>
          {daysLeft < 3 ? (
            <p className="mt-1 text-ink-muted">
              Poco tiempo — te recomendamos activar Modo emergencia.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
