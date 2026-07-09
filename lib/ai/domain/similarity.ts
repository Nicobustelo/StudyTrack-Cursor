/**
 * Similarity scores — spec 10.1
 */

export interface SimilaritySubscores {
  teacher_match_score: number;
  exam_type_match_score: number;
  scope_match_score: number;
  format_match_score: number;
  recency_score: number;
  semantic_overlap_score: number;
}

function clampScore(value: number, min = 0, max = 10): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/**
 * ai_similarity_score ponderado — spec 10.1
 */
export function calculateAiSimilarityScore(
  scores: SimilaritySubscores,
): number {
  const weighted =
    clampScore(scores.teacher_match_score) * 0.2 +
    clampScore(scores.exam_type_match_score) * 0.2 +
    clampScore(scores.scope_match_score) * 0.2 +
    clampScore(scores.format_match_score) * 0.15 +
    clampScore(scores.recency_score) * 0.1 +
    clampScore(scores.semantic_overlap_score) * 0.15;

  return Math.round(weighted * 10) / 10;
}

/**
 * final_relevance_score — spec 10.1
 * Si la IA no puede calcular, usar solo user_similarity_score.
 */
export function calculateFinalRelevanceScore(
  userSimilarityScore: number,
  aiSimilarityScore: number | null | undefined,
): number {
  const user = clampScore(userSimilarityScore, 1, 10);
  if (
    aiSimilarityScore == null ||
    Number.isNaN(aiSimilarityScore) ||
    aiSimilarityScore <= 0
  ) {
    return user;
  }
  const ai = clampScore(aiSimilarityScore);
  const final = user * 0.4 + ai * 0.6;
  return Math.round(final * 10) / 10;
}

export function normalizeSubscores(
  partial: Partial<SimilaritySubscores> | undefined,
): SimilaritySubscores {
  return {
    teacher_match_score: clampScore(partial?.teacher_match_score ?? 5),
    exam_type_match_score: clampScore(partial?.exam_type_match_score ?? 5),
    scope_match_score: clampScore(partial?.scope_match_score ?? 5),
    format_match_score: clampScore(partial?.format_match_score ?? 5),
    recency_score: clampScore(partial?.recency_score ?? 5),
    semantic_overlap_score: clampScore(partial?.semantic_overlap_score ?? 5),
  };
}
