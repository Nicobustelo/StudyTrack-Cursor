import type { Exercise } from "@/lib/exercises/types";
import type { ParsedQuestion } from "@/lib/exercises/question-to-exercise";

export type LessonPhase = "content" | "exercise" | "result";

export interface LessonExerciseItem {
  questionId: string | null;
  exercise: Exercise | null;
  invalid: boolean;
  errors: string[];
}

export interface LessonScreenData {
  examId: string;
  lessonId: string;
  title: string;
  summary: string | null;
  content: string | null;
  unitNumber: number;
  targetGrade: string | null;
  passingScore: number;
  exercises: LessonExerciseItem[];
  isDemo: boolean;
  trackBackUrl: string;
}

export interface QuizScreenData {
  examId: string;
  quizId: string;
  lessonId: string | null;
  title: string;
  quizType: string | null;
  unitNumber: number;
  targetGrade: string | null;
  passingScore: number;
  exercises: LessonExerciseItem[];
  isDemo: boolean;
  trackBackUrl: string;
}

export interface ExerciseAttemptResult {
  questionId: string | null;
  isCorrect: boolean;
  skipped: boolean;
  userAnswer: unknown;
}

export interface SessionResult {
  scorePercent: number;
  correctCount: number;
  totalCount: number;
  skippedCount: number;
  passed: boolean;
  xp: number;
  masteredConcepts: string[];
  missedConcepts: string[];
  attempts: ExerciseAttemptResult[];
}

export function buildExerciseItems(parsed: ParsedQuestion[]): LessonExerciseItem[] {
  return parsed.map((p) => ({
    questionId: p.id,
    exercise: p.exercise,
    invalid: p.exercise === null,
    errors: p.errors,
  }));
}
