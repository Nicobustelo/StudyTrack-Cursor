import type { Exercise } from "./types";
import {
  validateExerciseWithSanitize,
  type ValidationResult,
} from "./validate-exercise";

export interface QuestionRow {
  id: string;
  question_type: string | null;
  prompt: string | null;
  options: unknown;
  correct_answer: unknown;
  explanation: string | null;
  source_reference?: string | null;
}

export interface ParsedQuestion {
  id: string;
  exercise: Exercise | null;
  errors: string[];
}

export function questionToExercise(question: QuestionRow): ParsedQuestion {
  const raw = {
    type: question.question_type,
    prompt: question.prompt,
    options: question.options,
    correct_answer: question.correct_answer,
    explanation: question.explanation,
    source_reference: question.source_reference,
  };

  const result: ValidationResult = validateExerciseWithSanitize(raw);

  if (result.success) {
    return { id: question.id, exercise: result.exercise, errors: [] };
  }

  return { id: question.id, exercise: null, errors: result.errors };
}

export function parseQuestions(questions: QuestionRow[]): ParsedQuestion[] {
  return questions.map(questionToExercise);
}
