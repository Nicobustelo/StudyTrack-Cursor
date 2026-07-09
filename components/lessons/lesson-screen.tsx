"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ANALYTICS_EVENTS,
  captureClientEvent,
} from "@/lib/analytics/client";
import type { UserAnswer } from "@/lib/exercises/evaluate-answer";
import { evaluateExercise } from "@/lib/exercises/evaluate-answer";
import {
  completeSession,
  getQuizIdForLesson,
  submitAnswer,
} from "@/lib/lessons/actions";
import type {
  ExerciseAttemptResult,
  LessonExerciseItem,
  LessonPhase,
} from "@/lib/lessons/types";

import { ExerciseFeedback } from "./exercise-feedback";
import { ExerciseRenderer } from "./exercise-renderer";
import { LessonHeader } from "./lesson-header";
import { LessonResult } from "./lesson-result";

export interface LessonScreenProps {
  examId: string;
  lessonId?: string;
  quizId?: string | null;
  title: string;
  summary: string | null;
  content: string | null;
  targetGrade: string | null;
  passingScore: number;
  exercises: LessonExerciseItem[];
  trackBackUrl: string;
  mode: "lesson" | "quiz";
  showContent?: boolean;
}

export function LessonScreen({
  examId,
  lessonId,
  quizId: initialQuizId,
  title,
  summary,
  content,
  targetGrade,
  passingScore,
  exercises,
  trackBackUrl,
  mode,
  showContent = true,
}: LessonScreenProps) {
  const [phase, setPhase] = useState<LessonPhase>(
    showContent && (summary || content) ? "content" : "exercise",
  );
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [attempts, setAttempts] = useState<ExerciseAttemptResult[]>([]);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    explanation: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    scorePercent: number;
    passed: boolean;
    xp: number;
    readinessDelta: number;
    readinessScore: number;
    nextLessonId: string | null;
    nextLessonTitle: string | null;
  } | null>(null);
  const [resolvedQuizId, setResolvedQuizId] = useState<string | null>(
    initialQuizId ?? null,
  );

  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (mode === "lesson") {
      captureClientEvent(ANALYTICS_EVENTS.LESSON_STARTED, {
        exam_id: examId,
        lesson_id: lessonId,
      });
    } else {
      captureClientEvent(ANALYTICS_EVENTS.QUIZ_STARTED, {
        exam_id: examId,
      });
    }
  }, [examId, lessonId, mode]);

  useEffect(() => {
    if (!resolvedQuizId && lessonId) {
      void getQuizIdForLesson(examId, lessonId).then(setResolvedQuizId);
    }
  }, [examId, lessonId, resolvedQuizId]);

  const currentItem = exercises[exerciseIndex];
  const totalExercises = exercises.length;

  const progressPercent = useMemo(() => {
    if (phase === "content") return 5;
    if (phase === "result") return 100;
    if (totalExercises === 0) return 100;
    return Math.round(((exerciseIndex + (feedback ? 0.5 : 0)) / totalExercises) * 90) + 10;
  }, [phase, exerciseIndex, feedback, totalExercises]);

  const masteredConcepts = useMemo(
    () =>
      attempts
        .filter((a) => a.isCorrect && !a.skipped)
        .map((_, i) => exercises[i]?.exercise?.source_reference)
        .filter((c): c is string => Boolean(c)),
    [attempts, exercises],
  );

  const missedConcepts = useMemo(
    () =>
      attempts
        .filter((a) => !a.isCorrect && !a.skipped)
        .map((_, i) => exercises[i]?.exercise?.source_reference ?? exercises[i]?.exercise?.prompt?.slice(0, 60))
        .filter((c): c is string => Boolean(c)),
    [attempts, exercises],
  );

  const finishSession = useCallback(
    async (finalAttempts: ExerciseAttemptResult[]) => {
      setSubmitting(true);
      try {
        const serverResult = await completeSession({
          examId,
          lessonId: lessonId ?? null,
          quizId: resolvedQuizId,
          targetGrade,
          attempts: finalAttempts,
          mode,
        });

        setResult({
          scorePercent: serverResult.scorePercent,
          passed: serverResult.passed,
          xp: serverResult.xp,
          readinessDelta: serverResult.readinessDelta,
          readinessScore: serverResult.readinessScore,
          nextLessonId: serverResult.nextLessonId,
          nextLessonTitle: serverResult.nextLessonTitle,
        });
        setPhase("result");
      } finally {
        setSubmitting(false);
      }
    },
    [examId, lessonId, resolvedQuizId, targetGrade, mode],
  );

  const advanceAfterAttempt = useCallback(
    (attempt: ExerciseAttemptResult) => {
      const nextAttempts = [...attempts, attempt];
      setAttempts(nextAttempts);
      setFeedback(null);

      if (exerciseIndex + 1 >= totalExercises) {
        void finishSession(nextAttempts);
      } else {
        setExerciseIndex((i) => i + 1);
      }
    },
    [attempts, exerciseIndex, totalExercises, finishSession],
  );

  const handleAnswer = useCallback(
    async (answer: UserAnswer) => {
      if (!currentItem || feedback || submitting) return;

      const exercise = currentItem.exercise;
      if (!exercise) return;

      const isCorrect =
        answer.kind === "skipped"
          ? false
          : evaluateExercise(exercise, answer);

      setFeedback({
        isCorrect,
        explanation: exercise.explanation,
      });

      if (
        resolvedQuizId &&
        currentItem.questionId &&
        !currentItem.questionId.startsWith("demo-")
      ) {
        try {
          await submitAnswer({
            examId,
            quizId: resolvedQuizId,
            questionId: currentItem.questionId,
            exercise,
            userAnswer: answer,
          });
        } catch {
          // No bloquear UX por error de persistencia.
        }
      }
    },
    [currentItem, feedback, submitting, resolvedQuizId, examId],
  );

  const handleSkip = useCallback(() => {
    advanceAfterAttempt({
      questionId: currentItem?.questionId ?? null,
      isCorrect: false,
      skipped: true,
      userAnswer: { kind: "skipped", data: null },
    });
  }, [advanceAfterAttempt, currentItem?.questionId]);

  const handleContinueFeedback = useCallback(() => {
    if (!feedback || !currentItem) return;

    advanceAfterAttempt({
      questionId: currentItem.questionId,
      isCorrect: feedback.isCorrect,
      skipped: false,
      userAnswer: null,
    });
  }, [feedback, currentItem, advanceAfterAttempt]);

  const handleRetry = useCallback(() => {
    setPhase(showContent && (summary || content) ? "content" : "exercise");
    setExerciseIndex(0);
    setAttempts([]);
    setFeedback(null);
    setResult(null);
  }, [showContent, summary, content]);

  return (
    <MobileShell
      header={
        <LessonHeader
          backUrl={trackBackUrl}
          progressPercent={progressPercent}
          title={title}
        />
      }
    >
      {phase === "content" ? (
        <div className="flex flex-col gap-5 px-4 py-6">
          <div>
            <h1 className="text-2xl font-bold text-ink">{title}</h1>
            {summary ? (
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {summary}
              </p>
            ) : null}
          </div>

          {content ? (
            <Card>
              <CardContent className="prose prose-sm max-w-none pt-6 text-ink">
                {content.split("\n").map((paragraph, i) =>
                  paragraph.trim() ? (
                    <p key={i} className="mb-3 last:mb-0 leading-relaxed">
                      {paragraph}
                    </p>
                  ) : null,
                )}
              </CardContent>
            </Card>
          ) : null}

          <Button
            size="lg"
            className="w-full"
            onClick={() => setPhase("exercise")}
          >
            Empezar ejercicios
          </Button>
        </div>
      ) : null}

      {phase === "exercise" && currentItem ? (
        <div className="flex flex-col gap-5 px-4 py-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Ejercicio {exerciseIndex + 1} de {totalExercises}
          </p>

          <ExerciseRenderer
            exercise={currentItem.exercise}
            invalid={currentItem.invalid}
            disabled={Boolean(feedback) || submitting}
            onAnswer={handleAnswer}
            onSkip={handleSkip}
          />

          {feedback ? (
            <ExerciseFeedback
              isCorrect={feedback.isCorrect}
              explanation={feedback.explanation}
              onContinue={handleContinueFeedback}
            />
          ) : null}

          {submitting ? (
            <p className="text-center text-sm text-ink-muted">
              Guardando resultados…
            </p>
          ) : null}
        </div>
      ) : null}

      {phase === "result" && result ? (
        <LessonResult
          passed={result.passed}
          scorePercent={result.scorePercent}
          xp={result.xp}
          readinessDelta={result.readinessDelta}
          readinessScore={result.readinessScore}
          masteredConcepts={masteredConcepts}
          missedConcepts={missedConcepts}
          passingScore={passingScore}
          nextLessonId={result.nextLessonId}
          nextLessonTitle={result.nextLessonTitle}
          examId={examId}
          trackBackUrl={trackBackUrl}
          onRetry={handleRetry}
        />
      ) : null}
    </MobileShell>
  );
}
