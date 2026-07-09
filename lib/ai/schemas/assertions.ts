import type {
  ExerciseGenerationResult,
  LessonContentResult,
  PastExamAnalysisResult,
  SourceAnalysisResult,
  TrackGenerationResult,
} from "../types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function assertSourceAnalysisResult(
  parsed: unknown,
): SourceAnalysisResult {
  if (!isRecord(parsed)) throw new Error("Source analysis: respuesta no es objeto");
  if (typeof parsed.summary !== "string") {
    throw new Error("Source analysis: falta summary");
  }
  if (!Array.isArray(parsed.main_topics)) {
    throw new Error("Source analysis: main_topics debe ser array");
  }
  return {
    summary: parsed.summary,
    main_topics: parsed.main_topics as SourceAnalysisResult["main_topics"],
    missing_information: Array.isArray(parsed.missing_information)
      ? (parsed.missing_information as string[])
      : [],
    suggested_focus: Array.isArray(parsed.suggested_focus)
      ? (parsed.suggested_focus as string[])
      : [],
  };
}

export function assertPastExamAnalysisResult(
  parsed: unknown,
): PastExamAnalysisResult {
  if (!isRecord(parsed)) throw new Error("Past exam analysis: respuesta no es objeto");
  return {
    ai_similarity_score: Number(parsed.ai_similarity_score) || 0,
    final_relevance_reasoning: String(parsed.final_relevance_reasoning ?? ""),
    detected_question_types: Array.isArray(parsed.detected_question_types)
      ? (parsed.detected_question_types as string[])
      : [],
    repeated_topics: Array.isArray(parsed.repeated_topics)
      ? (parsed.repeated_topics as string[])
      : [],
    difficulty: Number(parsed.difficulty) || 5,
    style_summary: String(parsed.style_summary ?? ""),
    questions: Array.isArray(parsed.questions)
      ? (parsed.questions as PastExamAnalysisResult["questions"])
      : [],
    recommendations: Array.isArray(parsed.recommendations)
      ? (parsed.recommendations as string[])
      : [],
    similarity_subscores: isRecord(parsed.similarity_subscores)
      ? (parsed.similarity_subscores as PastExamAnalysisResult["similarity_subscores"])
      : undefined,
  };
}

export function assertTrackGenerationResult(
  parsed: unknown,
): TrackGenerationResult {
  if (!isRecord(parsed) || !Array.isArray(parsed.units)) {
    throw new Error("Track generation: units debe ser array");
  }
  return { units: parsed.units as TrackGenerationResult["units"] };
}

export function assertLessonContentResult(parsed: unknown): LessonContentResult {
  if (!isRecord(parsed)) throw new Error("Lesson content: respuesta no es objeto");
  if (!parsed.title || !parsed.content) {
    throw new Error("Lesson content: faltan title o content");
  }
  return {
    title: String(parsed.title),
    summary: String(parsed.summary ?? ""),
    content: String(parsed.content),
  };
}

export function assertExerciseGenerationResult(
  parsed: unknown,
): ExerciseGenerationResult {
  if (!isRecord(parsed) || !Array.isArray(parsed.exercises)) {
    throw new Error("Exercise generation: exercises debe ser array");
  }
  return { exercises: parsed.exercises as Array<Record<string, unknown>> };
}
