import type { SupabaseClient } from "@supabase/supabase-js";

import {
  calculateReadinessScore,
  estimateInitialReadiness,
} from "@/lib/ai/domain/readiness";

export interface ReadinessUpdateResult {
  previousScore: number;
  newScore: number;
  delta: number;
}

/**
 * Recalcula readiness básico tras completar lección/quiz — spec 15.1 MVP.
 */
export async function recalculateExamReadiness(
  supabase: SupabaseClient,
  examId: string,
  userId: string,
): Promise<ReadinessUpdateResult> {
  const { data: exam } = await supabase
    .from("exams")
    .select(
      "readiness_score, target_grade, current_level, exam_date, subject_name",
    )
    .eq("id", examId)
    .eq("user_id", userId)
    .maybeSingle();

  const previousScore = Number(exam?.readiness_score ?? 0);

  const { count: totalLessons } = await supabase
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("exam_id", examId);

  const { count: completedLessons } = await supabase
    .from("lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("exam_id", examId)
    .eq("user_id", userId)
    .eq("status", "completed");

  const { data: progressRows } = await supabase
    .from("lesson_progress")
    .select("best_score")
    .eq("exam_id", examId)
    .eq("user_id", userId)
    .not("best_score", "is", null);

  const scores = (progressRows ?? [])
    .map((r) => Number(r.best_score))
    .filter((s) => !Number.isNaN(s));

  const quizPerformance =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  const coverage =
    (totalLessons ?? 0) > 0
      ? Math.round(((completedLessons ?? 0) / (totalLessons ?? 1)) * 100)
      : 0;

  const examDate = exam?.exam_date ? new Date(exam.exam_date) : new Date();
  const daysUntilExam = Math.max(
    0,
    Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  const timeRisk =
    daysUntilExam <= 3
      ? 20
      : daysUntilExam <= 7
        ? 40
        : daysUntilExam <= 14
          ? 60
          : 80;

  const topicMastery = Math.min(
    100,
    quizPerformance * 0.6 + coverage * 0.4,
  );

  const newScore =
    (completedLessons ?? 0) === 0 && scores.length === 0
      ? estimateInitialReadiness({
          declaredLevel: exam?.current_level,
          topicsCount: 0,
          lessonsCompleted: 0,
          totalLessons: totalLessons ?? 0,
          daysUntilExam,
        })
      : calculateReadinessScore({
          weighted_topic_mastery: topicMastery,
          coverage_score: coverage,
          quiz_performance_score: quizPerformance,
          recency_score: 70,
          consistency_score: Math.min(100, (completedLessons ?? 0) * 15),
          time_risk_score: timeRisk,
        });

  await supabase
    .from("exams")
    .update({ readiness_score: newScore })
    .eq("id", examId);

  await supabase.from("readiness_scores").insert({
    exam_id: examId,
    user_id: userId,
    score: newScore,
    topic_mastery_score: topicMastery,
    coverage_score: coverage,
    quiz_performance_score: quizPerformance,
    recency_score: 70,
    consistency_score: Math.min(100, (completedLessons ?? 0) * 15),
    time_risk_score: timeRisk,
    explanation: "Actualizado tras completar lección/quiz",
  });

  return {
    previousScore,
    newScore,
    delta: newScore - previousScore,
  };
}
