/**
 * Readiness score — spec 15.1
 */

export interface ReadinessInputs {
  weighted_topic_mastery: number;
  coverage_score: number;
  quiz_performance_score: number;
  recency_score: number;
  consistency_score: number;
  time_risk_score: number;
}

export interface TopicMasteryInputs {
  accuracy: number;
  difficulty_weight: number;
  recency: number;
  confidence_or_attempt_quality: number;
}

function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

/**
 * topic_mastery — spec 15.2
 */
export function calculateTopicMastery(inputs: TopicMasteryInputs): number {
  const raw =
    clampPercent(inputs.accuracy) * 0.5 +
    clampPercent(inputs.difficulty_weight) * 0.2 +
    clampPercent(inputs.recency) * 0.2 +
    clampPercent(inputs.confidence_or_attempt_quality) * 0.1;
  return Math.round(raw);
}

/**
 * readiness_score MVP — spec 15.1
 */
export function calculateReadinessScore(inputs: ReadinessInputs): number {
  const raw =
    clampPercent(inputs.weighted_topic_mastery) * 0.35 +
    clampPercent(inputs.coverage_score) * 0.2 +
    clampPercent(inputs.quiz_performance_score) * 0.15 +
    clampPercent(inputs.recency_score) * 0.1 +
    clampPercent(inputs.consistency_score) * 0.1 +
    clampPercent(inputs.time_risk_score) * 0.1;

  return Math.round(clampPercent(raw));
}

/**
 * Estimación inicial cuando no hay datos de práctica — spec 15.2
 */
export function estimateInitialReadiness(input: {
  declaredLevel?: string | null;
  topicsCount: number;
  lessonsCompleted: number;
  totalLessons: number;
  daysUntilExam: number;
}): number {
  const levelBoost =
    input.declaredLevel === "avanzado"
      ? 15
      : input.declaredLevel === "intermedio"
        ? 8
        : 0;

  const coverage =
    input.totalLessons > 0
      ? (input.lessonsCompleted / input.totalLessons) * 100
      : 0;

  const timeRisk =
    input.daysUntilExam <= 3
      ? 20
      : input.daysUntilExam <= 7
        ? 40
        : input.daysUntilExam <= 14
          ? 60
          : 80;

  return calculateReadinessScore({
    weighted_topic_mastery: Math.min(30 + levelBoost, 50),
    coverage_score: coverage,
    quiz_performance_score: 0,
    recency_score: 50,
    consistency_score: 30,
    time_risk_score: timeRisk,
  });
}
