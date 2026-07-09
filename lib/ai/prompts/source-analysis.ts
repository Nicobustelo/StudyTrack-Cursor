import type { ExamContext } from "../types";

export const SOURCE_ANALYSIS_OUTPUT_SCHEMA = `{
  "summary": "string",
  "main_topics": [
    {
      "title": "string",
      "summary": "string",
      "importance": 1-10,
      "difficulty": 1-10,
      "estimated_minutes": number,
      "source_references": ["string"]
    }
  ],
  "missing_information": ["string"],
  "suggested_focus": ["string"]
}`;

export function buildSourceAnalysisPrompts(
  exam: ExamContext,
  chunkTexts: string[],
): { system: string; user: string } {
  const system = `Sos un asistente pedagógico de StudyTrack. Analizás materiales de estudio y devolvés un mapa de temas en JSON.
No garantices qué temas van a entrar en el examen. Usá lenguaje como "alta prioridad", "probablemente importante", "conviene practicarlo".
Si no detectás temas claros, devolvé main_topics como array vacío.

Schema de salida:
${SOURCE_ANALYSIS_OUTPUT_SCHEMA}`;

  const user = `Materia: ${exam.subjectName}
Tipo de examen: ${(exam.examTypes ?? []).join(", ") || "no especificado"}
Nota objetivo: ${exam.targetGrade ?? "no especificada"}
Fecha de examen: ${exam.examDate}
Nivel actual: ${exam.currentLevel ?? "no especificado"}
Estilo del profesor: ${(exam.professorStyles ?? []).join(", ") || "no especificado"}

Fragmentos del material:
${chunkTexts.map((c, i) => `--- Chunk ${i + 1} ---\n${c}`).join("\n\n")}`;

  return { system, user };
}
