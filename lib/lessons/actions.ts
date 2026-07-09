"use server";

import { revalidatePath } from "next/cache";

import type { UserAnswer } from "@/lib/exercises/evaluate-answer";
import { evaluateExercise } from "@/lib/exercises/evaluate-answer";
import type { Exercise } from "@/lib/exercises/types";
import { captureServerEvent } from "@/lib/analytics/server";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import {
  computeScorePercent,
  computeXp,
  didPass,
  getPassingScore,
} from "@/lib/lessons/passing-score";
import { recalculateExamReadiness } from "@/lib/lessons/readiness-update";
import {
  markLessonCompletedInTrack,
  unlockNextLesson,
} from "@/lib/lessons/unlock";
import type { ExerciseAttemptResult } from "@/lib/lessons/types";
import { createClient } from "@/lib/supabase/server";

export interface SubmitAnswerInput {
  examId: string;
  quizId: string;
  questionId: string;
  exercise: Exercise;
  userAnswer: UserAnswer;
}

export interface SubmitAnswerResult {
  isCorrect: boolean;
  explanation: string;
}

export async function submitAnswer(
  input: SubmitAnswerInput,
): Promise<SubmitAnswerResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  const isCorrect =
    input.userAnswer.kind === "skipped"
      ? false
      : evaluateExercise(input.exercise, input.userAnswer);

  if (!input.questionId.startsWith("demo-")) {
    await supabase.from("answers").insert({
      user_id: user.id,
      exam_id: input.examId,
      quiz_id: input.quizId,
      question_id: input.questionId,
      answer: input.userAnswer,
      is_correct: isCorrect,
      score: isCorrect ? 1 : 0,
      feedback: input.exercise.explanation,
    });
  }

  return {
    isCorrect,
    explanation: input.exercise.explanation,
  };
}

export interface CompleteSessionInput {
  examId: string;
  lessonId?: string | null;
  quizId?: string | null;
  targetGrade?: string | null;
  attempts: ExerciseAttemptResult[];
  mode: "lesson" | "quiz";
}

export interface CompleteSessionResult {
  scorePercent: number;
  passed: boolean;
  xp: number;
  readinessDelta: number;
  readinessScore: number;
  nextLessonId: string | null;
  nextLessonTitle: string | null;
  unitCompleted: boolean;
  completedUnitOrder: number | null;
}

export async function completeSession(
  input: CompleteSessionInput,
): Promise<CompleteSessionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  const totalCount = input.attempts.length;
  const skippedCount = input.attempts.filter((a) => a.skipped).length;
  const correctCount = input.attempts.filter((a) => a.isCorrect).length;
  const scorePercent = computeScorePercent(
    correctCount,
    totalCount,
    skippedCount,
  );
  const passed = didPass(scorePercent, input.targetGrade);
  const xp = computeXp(scorePercent, passed);

  let nextLessonId: string | null = null;
  let nextLessonTitle: string | null = null;
  let unitCompleted = false;
  let completedUnitOrder: number | null = null;

  if (input.lessonId) {
    const { data: existing } = await supabase
      .from("lesson_progress")
      .select("id, attempts, best_score")
      .eq("user_id", user.id)
      .eq("lesson_id", input.lessonId)
      .maybeSingle();

    const attempts = (existing?.attempts ?? 0) + 1;
    const bestScore = Math.max(
      Number(existing?.best_score ?? 0),
      scorePercent,
    );

    const progressPayload = {
      user_id: user.id,
      exam_id: input.examId,
      lesson_id: input.lessonId,
      status: passed ? "completed" : "failed",
      best_score: bestScore,
      attempts,
      completed_at: passed ? new Date().toISOString() : null,
    };

    if (existing) {
      await supabase
        .from("lesson_progress")
        .update(progressPayload)
        .eq("id", existing.id);
    } else {
      await supabase.from("lesson_progress").insert(progressPayload);
    }

    if (passed) {
      await markLessonCompletedInTrack(supabase, input.lessonId);
      const unlock = await unlockNextLesson(
        supabase,
        input.examId,
        input.lessonId,
      );
      nextLessonId = unlock.nextLessonId;
      nextLessonTitle = unlock.nextLessonTitle;
      unitCompleted = unlock.unitCompleted;
      completedUnitOrder = unlock.completedUnitOrder;
    }
  }

  const readiness = await recalculateExamReadiness(
    supabase,
    input.examId,
    user.id,
  );

  const today = new Date();
  const activityDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const { data: existingActivity } = await supabase
    .from("daily_activity")
    .select("id, xp_earned")
    .eq("user_id", user.id)
    .eq("exam_id", input.examId)
    .eq("activity_date", activityDate)
    .maybeSingle();

  if (existingActivity) {
    await supabase
      .from("daily_activity")
      .update({ xp_earned: (existingActivity.xp_earned ?? 0) + xp })
      .eq("id", existingActivity.id);
  } else {
    await supabase.from("daily_activity").insert({
      user_id: user.id,
      exam_id: input.examId,
      activity_date: activityDate,
      xp_earned: xp,
    });
  }

  const baseProps = {
    exam_id: input.examId,
    readiness_score: readiness.newScore,
  };

  if (input.mode === "lesson") {
    captureServerEvent(user.id, ANALYTICS_EVENTS.LESSON_COMPLETED, {
      ...baseProps,
      lesson_id: input.lessonId ?? undefined,
    });
  } else {
    captureServerEvent(user.id, ANALYTICS_EVENTS.QUIZ_COMPLETED, {
      ...baseProps,
      score: scorePercent,
    });

    if (passed) {
      captureServerEvent(user.id, ANALYTICS_EVENTS.QUIZ_PASSED, {
        ...baseProps,
        score: scorePercent,
      });
    } else {
      captureServerEvent(user.id, ANALYTICS_EVENTS.QUIZ_FAILED, {
        ...baseProps,
        score: scorePercent,
      });
    }
  }

  if (unitCompleted && completedUnitOrder != null) {
    captureServerEvent(user.id, ANALYTICS_EVENTS.UNIT_COMPLETED, {
      ...baseProps,
      current_unit: completedUnitOrder,
    });
  }

  revalidatePath(`/exams/${input.examId}/track`);
  if (input.lessonId) {
    revalidatePath(`/exams/${input.examId}/lesson/${input.lessonId}`);
  }
  if (input.quizId) {
    revalidatePath(`/exams/${input.examId}/quiz/${input.quizId}`);
  }

  return {
    scorePercent,
    passed,
    xp,
    readinessDelta: readiness.delta,
    readinessScore: readiness.newScore,
    nextLessonId,
    nextLessonTitle,
    unitCompleted,
    completedUnitOrder,
  };
}

export async function getQuizIdForLesson(
  examId: string,
  lessonId: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quizzes")
    .select("id")
    .eq("exam_id", examId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  return data?.id ?? null;
}

export { getPassingScore };
