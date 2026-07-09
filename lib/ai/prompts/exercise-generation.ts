import type { ExerciseGenerationContext } from "../types";
import {
  EXERCISE_GENERATION_RULES,
  EXERCISE_JSON_EXAMPLES,
} from "./exercise-examples";

export const EXERCISE_GENERATION_OUTPUT_SCHEMA = `{
  "exercises": [
    { /* ejercicio según tipo — ver ejemplos */ }
  ]
}`;

export function buildExerciseGenerationPrompts(
  ctx: ExerciseGenerationContext,
): { system: string; user: string } {
  const system = `Sos un generador de ejercicios de StudyTrack. Creás ejercicios variados, rápidos y alineados al material.
${EXERCISE_GENERATION_RULES}

Ejemplos JSON obligatorios por tipo:
${EXERCISE_JSON_EXAMPLES}

Schema de salida:
${EXERCISE_GENERATION_OUTPUT_SCHEMA}`;

  const user = `Materia/lección: ${ctx.lessonTitle}
Tema: ${ctx.topicTitle}
Tipo de lección: ${ctx.lessonType}
Cantidad de ejercicios: ${ctx.exerciseCount}
${ctx.allowedTypes ? `Tipos permitidos: ${ctx.allowedTypes.join(", ")}` : "Mezclá tipos variados."}
${ctx.pastExamSummary ? `Patrones de exámenes anteriores:\n${ctx.pastExamSummary}` : ""}

Material:
${ctx.sourceChunks.map((c, i) => `--- ${i + 1} ---\n${c}`).join("\n\n")}`;

  return { system, user };
}
