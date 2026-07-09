import type { ExamContext } from "../types";

export const PAST_EXAM_ANALYSIS_OUTPUT_SCHEMA = `{
  "ai_similarity_score": 0-10,
  "final_relevance_reasoning": "string",
  "detected_question_types": ["string"],
  "repeated_topics": ["string"],
  "difficulty": 1-10,
  "style_summary": "string",
  "questions": [
    {
      "question_text": "string",
      "question_type": "string",
      "detected_topic_title": "string",
      "difficulty": 1-10,
      "expected_answer": "string"
    }
  ],
  "recommendations": ["string"],
  "similarity_subscores": {
    "teacher_match_score": 0-10,
    "exam_type_match_score": 0-10,
    "scope_match_score": 0-10,
    "format_match_score": 0-10,
    "recency_score": 0-10,
    "semantic_overlap_score": 0-10
  }
}`;

export interface PastExamPromptInput {
  title: string | null;
  pastExamText: string;
  userSimilarityScore: number | null;
  userNotes: string | null;
  teacherMatch: string | null;
  scopeMatch: string | null;
  formatMatch: string | null;
  year: string | null;
}

export function buildPastExamAnalysisPrompts(
  exam: ExamContext,
  pastExam: PastExamPromptInput,
): { system: string; user: string } {
  const system = `Sos un asistente de StudyTrack que analiza exámenes anteriores para estimar similitud y extraer patrones.
La similitud es una estimación, no una predicción exacta.
Calculá similarity_subscores de 0 a 10 y ai_similarity_score coherente con ellos.

Schema de salida:
${PAST_EXAM_ANALYSIS_OUTPUT_SCHEMA}`;

  const user = `Examen actual — materia: ${exam.subjectName}
Tipos de evaluación: ${(exam.examTypes ?? []).join(", ") || "no especificado"}

Examen anterior: ${pastExam.title ?? "sin título"}
Año: ${pastExam.year ?? "desconocido"}
Coincidencia profesor (usuario): ${pastExam.teacherMatch ?? "no indicado"}
Coincidencia alcance (usuario): ${pastExam.scopeMatch ?? "no indicado"}
Coincidencia formato (usuario): ${pastExam.formatMatch ?? "no indicado"}
Similitud declarada por el usuario (1-10): ${pastExam.userSimilarityScore ?? "no indicada"}
Notas del usuario: ${pastExam.userNotes ?? "ninguna"}

Texto del examen anterior:
${pastExam.pastExamText}`;

  return { system, user };
}
