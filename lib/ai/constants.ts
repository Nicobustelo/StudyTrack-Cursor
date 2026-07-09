/** Límites de ejercicios por tipo de generación — spec 41.1 */
export const EXERCISE_LIMITS = {
  lesson: { min: 4, max: 6 },
  dailyChallenge: { min: 4, max: 5 },
  mockExam: { min: 6, max: 8 },
} as const;

/** Chunking de material — spec 19.1 */
export const CHUNK_DEFAULTS = {
  chunkSize: 2000,
  overlap: 200,
  minChunkLength: 50,
} as const;

/** Instrucción estándar para respuestas JSON del modelo — spec 41.1 */
export const JSON_ONLY_INSTRUCTION =
  "Respondé ÚNICAMENTE con JSON válido, sin texto adicional, sin markdown ni comentarios.";

export const PIPELINE_MAX_DURATION = 60;
