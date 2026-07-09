import { chatJsonCompletion } from "../client";
import { buildExerciseGenerationPrompts } from "../prompts/exercise-generation";
import { buildLessonContentPrompts } from "../prompts/lesson-content";
import { buildPastExamAnalysisPrompts } from "../prompts/past-exam-analysis";
import { buildSourceAnalysisPrompts } from "../prompts/source-analysis";
import { buildTrackGenerationPrompts } from "../prompts/topic-map";
import {
  assertExerciseGenerationResult,
  assertLessonContentResult,
  assertPastExamAnalysisResult,
  assertSourceAnalysisResult,
  assertTrackGenerationResult,
} from "../schemas/assertions";
import type {
  ExamContext,
  ExerciseGenerationContext,
  PastExamAnalysisResult,
  SourceAnalysisResult,
  SourceTopicDraft,
  TrackGenerationResult,
} from "../types";
import type { PastExamPromptInput } from "../prompts/past-exam-analysis";

export async function runSourceAnalysis(
  exam: ExamContext,
  chunkTexts: string[],
): Promise<SourceAnalysisResult> {
  const prompts = buildSourceAnalysisPrompts(exam, chunkTexts);
  return chatJsonCompletion({
    ...prompts,
    maxTokens: 3000,
    validate: assertSourceAnalysisResult,
  });
}

export async function runPastExamAnalysis(
  exam: ExamContext,
  pastExam: PastExamPromptInput,
): Promise<PastExamAnalysisResult> {
  const prompts = buildPastExamAnalysisPrompts(exam, pastExam);
  return chatJsonCompletion({
    ...prompts,
    maxTokens: 3000,
    validate: assertPastExamAnalysisResult,
  });
}

export async function runTrackGeneration(
  exam: ExamContext,
  topics: SourceTopicDraft[],
  pastExamSummaries: string[],
): Promise<TrackGenerationResult> {
  const prompts = buildTrackGenerationPrompts(exam, topics, pastExamSummaries);
  return chatJsonCompletion({
    ...prompts,
    maxTokens: 4000,
    validate: assertTrackGenerationResult,
  });
}

export async function runLessonContentGeneration(input: {
  subjectName: string;
  topicTitle: string;
  lessonTitle: string;
  lessonType: string;
  sourceChunks: string[];
  targetGrade: string | null;
}) {
  const prompts = buildLessonContentPrompts(input);
  return chatJsonCompletion({
    ...prompts,
    maxTokens: 2000,
    validate: assertLessonContentResult,
  });
}

export async function runExerciseGeneration(ctx: ExerciseGenerationContext) {
  const prompts = buildExerciseGenerationPrompts(ctx);
  return chatJsonCompletion({
    ...prompts,
    maxTokens: 4000,
    validate: assertExerciseGenerationResult,
  });
}
