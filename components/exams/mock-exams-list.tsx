"use client";

import { useState } from "react";
import { Clock, Lock, Target } from "lucide-react";

import { PaywallModal } from "@/components/monetization/paywall-modal";
import { PremiumBadge } from "@/components/monetization/premium-badge";
import { Button } from "@/components/ui/button";
import type { DEMO_MOCK_EXAMS } from "@/lib/demo/constants";
import { cn } from "@/lib/utils";

type MockExam = (typeof DEMO_MOCK_EXAMS)[number];

type MockExamsListProps = {
  examId: string;
  mockExams: readonly MockExam[];
  hasPremium: boolean;
};

export function MockExamsList({
  examId,
  mockExams,
  hasPremium,
}: MockExamsListProps) {
  const [paywallOpen, setPaywallOpen] = useState(false);

  function handleStart(mock: MockExam) {
    const locked = "premium" in mock && mock.premium && !hasPremium;
    if (locked) {
      setPaywallOpen(true);
      return;
    }
  }

  return (
    <>
      <ul className="flex flex-col gap-3">
        {mockExams.map((mock) => {
          const locked = "premium" in mock && mock.premium && !hasPremium;
          return (
            <li
              key={mock.id}
              className={cn(
                "rounded-2xl bg-surface p-4 ring-1 ring-border",
                locked && "opacity-90",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-ink">{mock.title}</h3>
                    {locked ? <PremiumBadge /> : null}
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">
                    {mock.questions} preguntas · ~{mock.minutes} min
                  </p>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-brand-light px-2 py-0.5 text-xs font-bold text-brand-dark">
                  <Target className="size-3" />
                  {mock.similarity}/10
                </span>
              </div>
              <p className="mt-2 text-xs text-ink-muted">
                Temas: {mock.topics.join(" · ")}
              </p>
              <Button
                className="mt-3 w-full"
                variant={locked ? "outline" : "default"}
                onClick={() => handleStart(mock)}
              >
                {locked ? (
                  <>
                    <Lock className="size-4" />
                    Desbloquear
                  </>
                ) : (
                  <>
                    <Clock className="size-4" />
                    Empezar simulacro
                  </>
                )}
              </Button>
            </li>
          );
        })}
      </ul>

      <PaywallModal
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        examId={examId}
        location="mock_exams_page"
      />
    </>
  );
}
