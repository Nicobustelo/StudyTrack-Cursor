"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ANALYTICS_EVENTS,
  captureClientEvent,
  identifyUser,
  trackOnboardingCompleted,
} from "@/lib/analytics/client";
import {
  AGE_OPTIONS,
  AVAILABILITY_OPTIONS,
  CURRENT_LEVEL_OPTIONS,
  EDUCATION_OPTIONS,
  EXAM_TYPE_OPTIONS,
  PROFESSOR_STYLE_OPTIONS,
  TARGET_GRADE_OPTIONS,
  WEEKDAY_OPTIONS,
  daysUntilExam,
} from "@/lib/onboarding/constants";
import { getContextualFeedback } from "@/lib/onboarding/feedback";
import {
  clearOnboardingDraft,
  loadOnboardingDraft,
  saveOnboardingDraft,
} from "@/lib/onboarding/draft";
import { persistOnboardingData } from "@/lib/onboarding/persist";
import {
  INITIAL_ONBOARDING_STATE,
  ONBOARDING_TOTAL_STEPS,
  type OnboardingState,
  type OnboardingStepId,
} from "@/lib/onboarding/types";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

import { AnalyzingScreen } from "./analyzing-screen";
import { DateStep } from "./date-step";
import { FileUploadStep } from "./file-upload-step";
import { MultiSelectOption } from "./multi-select-option";
import { OnboardingLayout } from "./onboarding-layout";
import { OptionCard } from "./option-card";
import { PastExamUploadStep } from "./past-exam-upload-step";

const STEP_NAMES: Record<number, string> = {
  1: "welcome",
  2: "age",
  3: "education",
  4: "career",
  5: "subject",
  6: "exam_types",
  7: "exam_date",
  8: "target_grade",
  9: "availability",
  10: "unavailable_days",
  11: "current_level",
  12: "professor_style",
  13: "materials",
  14: "past_exams",
  15: "analyzing",
  16: "complete",
};

type OnboardingFlowProps = {
  userId: string;
  userEmail?: string | null;
};

export function OnboardingFlow({ userId, userEmail }: OnboardingFlowProps) {
  const router = useRouter();
  const supabase = React.useMemo(() => createBrowserSupabaseClient(), []);

  const [step, setStep] = React.useState<OnboardingStepId>(1);
  const [state, setState] = React.useState<OnboardingState>(INITIAL_ONBOARDING_STATE);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [examId, setExamId] = React.useState<string | null>(null);
  const [persistError, setPersistError] = React.useState<string | null>(null);
  const [persisting, setPersisting] = React.useState(false);
  const [draftReady, setDraftReady] = React.useState(false);
  const [draftRestored, setDraftRestored] = React.useState(false);

  React.useEffect(() => {
    const draft = loadOnboardingDraft(userId);
    const frame = window.requestAnimationFrame(() => {
      if (draft) {
        setStep(draft.step);
        setState(draft.state);
        setDraftRestored(true);
      }
      setDraftReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [userId]);

  React.useEffect(() => {
    if (!draftReady) return;
    saveOnboardingDraft(userId, step, state);
  }, [draftReady, state, step, userId]);

  React.useEffect(() => {
    identifyUser(
      userId,
      userEmail ? { email: userEmail } : undefined,
    );
    captureClientEvent(ANALYTICS_EVENTS.ONBOARDING_STARTED, {});
  }, [userId, userEmail]);

  const patchState = (partial: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  };

  const trackStepCompleted = (completedStep: number) => {
    captureClientEvent(ANALYTICS_EVENTS.ONBOARDING_STEP_COMPLETED, {
      step: completedStep,
      step_name: STEP_NAMES[completedStep],
      subject_name: state.subjectName,
      target_grade: state.targetGrade,
      available_minutes_per_day: state.availableMinutesPerDay,
      has_past_exams: state.pastExams.length > 0,
      number_of_files: state.materials.length,
      number_of_past_exams: state.pastExams.length,
    });
  };

  const goNext = (completedStep: number = step) => {
    setDraftRestored(false);
    trackStepCompleted(completedStep);
    setFeedback(null);
    setStep((prev) => Math.min(16, prev + 1) as OnboardingStepId);
  };

  const goBack = () => {
    setDraftRestored(false);
    setFeedback(null);
    setStep((prev) => Math.max(1, prev - 1) as OnboardingStepId);
  };

  const selectSingle = (
    field: keyof OnboardingState,
    value: string,
    autoAdvance = true,
  ) => {
    patchState({ [field]: value } as Partial<OnboardingState>);
    const message = getContextualFeedback(step, { ...state, [field]: value }, value);
    setFeedback(message);
    if (autoAdvance) {
      window.setTimeout(() => goNext(), message ? 650 : 280);
    }
  };

  const handleFinishUploads = async () => {
    setPersistError(null);
    setPersisting(true);

    try {
      const id = await persistOnboardingData(supabase, userId, state);
      clearOnboardingDraft(userId);
      setExamId(id);

      captureClientEvent(ANALYTICS_EVENTS.EXAM_CREATED, {
        exam_id: id,
        subject_name: state.subjectName,
        target_grade: state.targetGrade,
        days_until_exam: state.examDate
          ? daysUntilExam(state.examDate)
          : undefined,
        available_minutes_per_day: state.availableMinutesPerDay,
        has_past_exams: state.pastExams.length > 0,
        number_of_files: state.materials.length,
        number_of_past_exams: state.pastExams.length,
      });

      for (let index = 0; index < state.materials.length; index += 1) {
        captureClientEvent(ANALYTICS_EVENTS.STUDY_MATERIAL_UPLOADED, {
          exam_id: id,
          number_of_files: state.materials.length,
        });
      }

      for (let index = 0; index < state.pastExams.length; index += 1) {
        captureClientEvent(ANALYTICS_EVENTS.PAST_EXAM_UPLOADED, { exam_id: id });
        captureClientEvent(ANALYTICS_EVENTS.PAST_EXAM_METADATA_COMPLETED, {
          exam_id: id,
        });
        captureClientEvent(ANALYTICS_EVENTS.PAST_EXAM_SIMILARITY_SET, {
          exam_id: id,
        });
      }

      trackStepCompleted(14);
      setStep(15);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No pudimos guardar tus datos. Probá de nuevo.";
      setPersistError(message);
      captureClientEvent(ANALYTICS_EVENTS.STUDY_MATERIAL_UPLOAD_FAILED, {
        subject_name: state.subjectName,
        number_of_files: state.materials.length,
        error_message: message,
      });
    } finally {
      setPersisting(false);
    }
  };

  const handleAnalysisComplete = () => {
    if (!examId) return;

    trackOnboardingCompleted({
      exam_id: examId,
      subject_name: state.subjectName,
      target_grade: state.targetGrade,
      days_until_exam: state.examDate
        ? daysUntilExam(state.examDate)
        : undefined,
      has_past_exams: state.pastExams.length > 0,
      number_of_files: state.materials.length,
      number_of_past_exams: state.pastExams.length,
    });

    trackStepCompleted(15);
    setStep(16);

    window.setTimeout(() => {
      router.push(`/exams/${examId}/track`);
    }, 1800);
  };

  const previewCard =
    state.subjectName || state.examDate || state.targetGrade ? (
      <Card size="sm" className="border-brand/20 bg-brand-light/30">
        <CardContent className="py-3 text-sm">
          <p className="font-bold text-brand-dark">Tu plan en construcción</p>
          {state.subjectName ? (
            <p className="mt-1 text-ink">{state.subjectName}</p>
          ) : null}
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-ink-muted">
            {state.examDate ? (
              <span>{daysUntilExam(state.examDate)} días</span>
            ) : null}
            {state.targetGrade ? (
              <span>
                Meta:{" "}
                {TARGET_GRADE_OPTIONS.find((o) => o.value === state.targetGrade)
                  ?.label ?? state.targetGrade}
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>
    ) : null;

  const canContinue = (): boolean => {
    switch (step) {
      case 2:
        return Boolean(state.ageRange);
      case 3:
        return Boolean(state.educationLevel);
      case 5:
        return Boolean(state.subjectName?.trim());
      case 6:
        return state.examTypes.length > 0;
      case 7:
        return Boolean(state.examDate);
      case 8:
        return Boolean(state.targetGrade);
      case 9:
        return Boolean(state.availableMinutesPerDay);
      case 11:
        return Boolean(state.currentLevel);
      case 14:
        return Boolean(state.pastExamsChoice);
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-brand-light motion-safe:animate-bounce motion-reduce:animate-none">
              <Target className="size-10 text-brand-dark" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-ink">
              Vamos a armar tu camino para aprobar.
            </h1>
            <p className="mt-3 max-w-sm text-ink-muted">
              Te vamos a hacer algunas preguntas rápidas para crear un plan
              específico para tu examen.
            </p>
          </div>
        );

      case 2:
        return (
          <StepShell
            title="¿Cuántos años tenés?"
            feedback={feedback}
          >
            <div className="flex flex-col gap-3">
              {AGE_OPTIONS.map((option, index) => (
                <OptionCard
                  key={option}
                  label={option}
                  selected={state.ageRange === option}
                  index={index}
                  onSelect={() => selectSingle("ageRange", option)}
                />
              ))}
            </div>
          </StepShell>
        );

      case 3:
        return (
          <StepShell title="¿Qué estás estudiando?" feedback={feedback}>
            <div className="flex flex-col gap-3">
              {EDUCATION_OPTIONS.map((option, index) => (
                <OptionCard
                  key={option}
                  label={option}
                  selected={state.educationLevel === option}
                  index={index}
                  onSelect={() => selectSingle("educationLevel", option)}
                />
              ))}
            </div>
          </StepShell>
        );

      case 4:
        return (
          <StepShell
            title="¿Qué carrera o área estás estudiando?"
            subtitle="Podés saltearlo si no aplica."
          >
            <div className="flex flex-col gap-3">
              <Input
                value={state.career ?? ""}
                onChange={(event) => patchState({ career: event.target.value })}
                placeholder="Ej: Ingeniería, Medicina, Psicología…"
                className="h-12"
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  patchState({ career: "No aplica" });
                  goNext();
                }}
              >
                No aplica
              </Button>
            </div>
          </StepShell>
        );

      case 5:
        return (
          <StepShell
            title="¿Qué materia vas a rendir?"
            feedback={feedback}
          >
            <Input
              value={state.subjectName ?? ""}
              onChange={(event) => {
                patchState({ subjectName: event.target.value });
                setFeedback(
                  getContextualFeedback(step, {
                    ...state,
                    subjectName: event.target.value,
                  }),
                );
              }}
              placeholder="Ej: Análisis Matemático 2, Física 1…"
              className="h-12"
            />
          </StepShell>
        );

      case 6:
        return (
          <StepShell title="¿Qué tipo de examen vas a rendir?">
            <MultiSelectOption
              options={EXAM_TYPE_OPTIONS}
              selected={state.examTypes}
              onChange={(examTypes) => patchState({ examTypes })}
            />
          </StepShell>
        );

      case 7:
        return (
          <StepShell
            title={
              state.subjectName
                ? `¿Cuándo rendís ${state.subjectName}?`
                : "¿Cuándo rendís?"
            }
            feedback={feedback}
          >
            <DateStep
              subjectName={state.subjectName}
              value={state.examDate}
              onChange={(examDate) => {
                patchState({ examDate });
                setFeedback(
                  getContextualFeedback(step, { ...state, examDate }, examDate),
                );
              }}
            />
          </StepShell>
        );

      case 8:
        return (
          <StepShell title="¿A qué nota querés llegar?" feedback={feedback}>
            <div className="flex flex-col gap-3">
              {TARGET_GRADE_OPTIONS.map((option, index) => (
                <OptionCard
                  key={option.value}
                  label={option.label}
                  selected={state.targetGrade === option.value}
                  index={index}
                  onSelect={() => selectSingle("targetGrade", option.value)}
                />
              ))}
            </div>
          </StepShell>
        );

      case 9:
        return (
          <StepShell
            title="¿Cuánto podés estudiar por día?"
            feedback={feedback}
          >
            <div className="flex flex-col gap-3">
              {AVAILABILITY_OPTIONS.map((option, index) => (
                <OptionCard
                  key={option.minutes}
                  label={option.label}
                  selected={state.availableMinutesPerDay === option.minutes}
                  index={index}
                  onSelect={() => {
                    patchState({ availableMinutesPerDay: option.minutes });
                    setFeedback(
                      getContextualFeedback(step, {
                        ...state,
                        availableMinutesPerDay: option.minutes,
                      }),
                    );
                    window.setTimeout(() => goNext(), 400);
                  }}
                />
              ))}
            </div>
          </StepShell>
        );

      case 10:
        return (
          <StepShell title="¿Qué días no podés estudiar?">
            <MultiSelectOption
              options={WEEKDAY_OPTIONS}
              selected={state.unavailableDays}
              onChange={(unavailableDays) => patchState({ unavailableDays })}
            />
            <Button
              type="button"
              variant="ghost"
              className="mt-3"
              onClick={() => {
                patchState({ unavailableDays: [] });
                goNext();
              }}
            >
              Puedo todos los días
            </Button>
            {state.unavailableDays.length > 0 ? (
              <div className="mt-4 grid grid-cols-7 gap-1">
                {WEEKDAY_OPTIONS.map((day) => {
                  const blocked = state.unavailableDays.includes(day);
                  return (
                    <div
                      key={day}
                      className={cn(
                        "rounded-lg py-2 text-center text-[10px] font-bold transition-colors duration-200",
                        blocked
                          ? "bg-muted text-ink-muted line-through"
                          : "bg-brand-light text-brand-dark",
                      )}
                    >
                      {day.slice(0, 3)}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </StepShell>
        );

      case 11:
        return (
          <StepShell title="¿Cómo venís con la materia?" feedback={feedback}>
            <div className="flex flex-col gap-3">
              {CURRENT_LEVEL_OPTIONS.map((option, index) => (
                <OptionCard
                  key={option}
                  label={option}
                  selected={state.currentLevel === option}
                  index={index}
                  onSelect={() => selectSingle("currentLevel", option)}
                />
              ))}
            </div>
          </StepShell>
        );

      case 12:
        return (
          <StepShell
            title="¿Cómo suele tomar el profesor?"
            subtitle="Elegí todo lo que aplique. Si no sabés, no pasa nada."
          >
            <MultiSelectOption
              options={PROFESSOR_STYLE_OPTIONS}
              selected={state.professorStyles}
              onChange={(professorStyles) => patchState({ professorStyles })}
            />
          </StepShell>
        );

      case 13:
        return (
          <StepShell
            title="Subí tus apuntes y materiales"
            subtitle="Podés subir PDFs, fotos, resúmenes, guías o pegar texto."
          >
            <FileUploadStep
              materials={state.materials}
              onChange={(materials) => patchState({ materials })}
            />
          </StepShell>
        );

      case 14:
        return (
          <StepShell
            title="¿Tenés parciales o finales anteriores?"
            subtitle="Si los subís, generamos ejercicios más parecidos a cómo suelen tomar."
          >
            {persistError ? (
              <p className="mb-3 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {persistError}
              </p>
            ) : null}
            <PastExamUploadStep
              choice={state.pastExamsChoice}
              pastExams={state.pastExams}
              onChoiceChange={(pastExamsChoice) =>
                patchState({ pastExamsChoice })
              }
              onPastExamsChange={(pastExams) => patchState({ pastExams })}
            />
          </StepShell>
        );

      case 15:
        return examId ? (
          <AnalyzingScreen
            examId={examId}
            userId={userId}
            subjectName={state.subjectName ?? "Tu materia"}
            onComplete={handleAnalysisComplete}
          />
        ) : null;

      case 16:
        return (
          <div className="flex flex-1 flex-col items-center justify-center text-center motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-300">
            <div className="rounded-2xl border border-brand/30 bg-brand-light px-6 py-8 shadow-card">
              <h2 className="font-heading text-2xl font-bold text-ink">
                Tu plan de estudio está listo.
              </h2>
              <p className="mt-2 text-sm text-ink-muted">
                Te armamos un camino hasta el examen según tus apuntes, tiempo
                disponible y nota objetivo.
              </p>
              {state.subjectName ? (
                <p className="mt-4 font-bold text-brand-dark">
                  {state.subjectName}
                </p>
              ) : null}
              <p className="mt-4 text-xs text-ink-muted">
                Redirigiendo a tu plan…
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const showFooter =
    step !== 1 &&
    step !== 15 &&
    step !== 16 &&
    ![2, 3, 8, 9, 11].includes(step);

  const footer = showFooter ? (
    <Button
      type="button"
      size="lg"
      className="w-full"
      disabled={!canContinue() || persisting}
      onClick={() => {
        if (step === 14) {
          void handleFinishUploads();
          return;
        }
        goNext();
      }}
    >
      {persisting ? "Guardando…" : step === 14 ? "Crear mi plan de estudio" : "Continuar"}
    </Button>
  ) : step === 1 ? null : null;

  const primaryFooter =
    step === 1 ? (
      <Button type="button" size="lg" className="w-full" onClick={() => goNext()}>
        Empezar
      </Button>
    ) : (
      footer
    );

  const resumeBanner = draftRestored ? (
    <p className="rounded-xl border border-brand/20 bg-brand-light px-3 py-2.5 text-sm font-medium text-brand-dark">
      Retomamos tu plan donde lo dejaste. Los archivos, por seguridad, se
      vuelven a seleccionar al llegar al paso de materiales.
    </p>
  ) : null;

  const preview = step >= 5 && step <= 14 ? previewCard : null;

  return (
    <OnboardingLayout
      step={step}
      totalSteps={ONBOARDING_TOTAL_STEPS}
      onBack={goBack}
      showBack={step < 15}
      preview={
        resumeBanner || preview ? (
          <div className="flex flex-col gap-3">
            {resumeBanner}
            {preview}
          </div>
        ) : undefined
      }
      footer={primaryFooter ?? undefined}
    >
      {renderStep()}
    </OnboardingLayout>
  );
}

function StepShell({
  title,
  subtitle,
  feedback,
  children,
}: {
  title: string;
  subtitle?: string;
  feedback?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col gap-5 pb-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink">{title}</h1>
        {subtitle ? (
          <p className="mt-2 text-sm text-ink-muted">{subtitle}</p>
        ) : null}
      </div>
      {feedback ? (
        <p className="rounded-xl border border-brand/20 bg-brand-light px-3 py-2.5 text-sm font-medium text-brand-dark motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-safe:duration-300">
          {feedback}
        </p>
      ) : null}
      {children}
    </div>
  );
}
