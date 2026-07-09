import type { ExamContext, SourceTopicDraft } from "../types";

export const TRACK_GENERATION_OUTPUT_SCHEMA = `{
  "units": [
    {
      "title": "string",
      "description": "string",
      "order_index": number,
      "is_premium": boolean,
      "lessons": [
        {
          "title": "string",
          "lesson_type": "concept|practice|review|daily_challenge|quiz|mock_exam",
          "topic_title": "string",
          "estimated_minutes": number,
          "is_premium": boolean,
          "order_index": number
        }
      ]
    }
  ]
}`;

export function buildTrackGenerationPrompts(
  exam: ExamContext,
  topics: SourceTopicDraft[],
  pastExamSummaries: string[],
): { system: string; user: string } {
  const system = `Sos un asistente de StudyTrack que diseña un track de estudio gamificado.
Reglas de acceso:
- Unidades 1 y 2: is_premium = false
- Unidad 3 en adelante: is_premium = true
Generá entre 4 y 6 unidades con 2-4 lecciones cada una, priorizando temas de mayor importancia.
NO incluyas ejercicios en este paso — solo estructura del track.

Schema de salida:
${TRACK_GENERATION_OUTPUT_SCHEMA}`;

  const user = `Materia: ${exam.subjectName}
Fecha de examen: ${exam.examDate}
Nota objetivo: ${exam.targetGrade ?? "no especificada"}
Minutos disponibles por día: ${exam.availableMinutesPerDay ?? "no indicado"}
Nivel actual: ${exam.currentLevel ?? "no especificado"}

Temas detectados:
${JSON.stringify(topics, null, 2)}

Resúmenes de exámenes anteriores:
${pastExamSummaries.length > 0 ? pastExamSummaries.join("\n---\n") : "Ninguno"}`;

  return { system, user };
}
