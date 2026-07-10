export { getOpenAIClient, chatJsonCompletion } from "./client";
export { getOpenAIModel, getOpenAIApiKey, isOpenAIConfigured } from "./config";
export {
  parseModelJson,
  callModelWithJsonRetry,
  ModelJsonParseError,
} from "./parse-model-json";
export {
  EXERCISE_LIMITS,
  CHUNK_DEFAULTS,
  JSON_ONLY_INSTRUCTION,
  PIPELINE_MAX_DURATION,
} from "./constants";
export type {
  SourceAnalysisResult,
  PastExamAnalysisResult,
  TrackGenerationResult,
  LessonContentResult,
  ExerciseGenerationResult,
  PipelineStage,
  PipelineProgress,
  ExamContext,
} from "./types";

export {
  calculateAiSimilarityScore,
  calculateFinalRelevanceScore,
  normalizeSubscores,
} from "./domain/similarity";
export type { SimilaritySubscores } from "./domain/similarity";
export {
  calculateReadinessScore,
  calculateTopicMastery,
  estimateInitialReadiness,
} from "./domain/readiness";
export type { ReadinessInputs, TopicMasteryInputs } from "./domain/readiness";
export { chunkText, isCorruptChunk } from "./domain/chunking";
export {
  extractTextFromRawText,
  humanizeExtractionError,
  isUnrecoverableFailedSource,
  isUsableRawText,
  resolveSourceText,
  sourceNeedsStorageExtraction,
} from "./domain/text-extraction";

export {
  startAnalysisPipeline,
  runNextPipelineStep,
  detectPipelineStage,
} from "./pipeline/orchestrator";
export { PipelineError, isPipelineError } from "./pipeline/errors";

export {
  runSourceAnalysis,
  runPastExamAnalysis,
  runTrackGeneration,
  runLessonContentGeneration,
  runExerciseGeneration,
} from "./services/generation";

export { EXERCISE_JSON_EXAMPLES, EXERCISE_GENERATION_RULES } from "./prompts/exercise-examples";
