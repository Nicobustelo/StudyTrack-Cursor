import type { ExerciseType } from "@/lib/exercises/types";

// ---------------------------------------------------------------------------
// Source analysis — spec 19.2
// ---------------------------------------------------------------------------

export interface SourceTopicDraft {
  title: string;
  summary: string;
  importance: number;
  difficulty: number;
  estimated_minutes: number;
  source_references: string[];
}

export interface SourceAnalysisResult {
  summary: string;
  main_topics: SourceTopicDraft[];
  missing_information: string[];
  suggested_focus: string[];
}

// ---------------------------------------------------------------------------
// Past exam analysis — spec 19.3
// ---------------------------------------------------------------------------

export interface PastExamQuestionDraft {
  question_text: string;
  question_type: string;
  detected_topic_title: string;
  difficulty: number;
  expected_answer: string;
}

export interface PastExamAnalysisResult {
  ai_similarity_score: number;
  final_relevance_reasoning: string;
  detected_question_types: string[];
  repeated_topics: string[];
  difficulty: number;
  style_summary: string;
  questions: PastExamQuestionDraft[];
  recommendations: string[];
  /** Subscores 0–10 para calcular ai_similarity_score — spec 10.1 */
  similarity_subscores?: {
    teacher_match_score: number;
    exam_type_match_score: number;
    scope_match_score: number;
    format_match_score: number;
    recency_score: number;
    semantic_overlap_score: number;
  };
}

// ---------------------------------------------------------------------------
// Topic map / track generation — spec 19.4
// ---------------------------------------------------------------------------

export interface TrackLessonDraft {
  title: string;
  lesson_type: string;
  topic_title: string;
  estimated_minutes: number;
  is_premium: boolean;
  order_index: number;
}

export interface TrackUnitDraft {
  title: string;
  description: string;
  order_index: number;
  is_premium: boolean;
  lessons: TrackLessonDraft[];
}

export interface TrackGenerationResult {
  units: TrackUnitDraft[];
}

// ---------------------------------------------------------------------------
// Lesson content generation
// ---------------------------------------------------------------------------

export interface LessonContentResult {
  title: string;
  summary: string;
  content: string;
}

// ---------------------------------------------------------------------------
// Exercise generation
// ---------------------------------------------------------------------------

export interface ExerciseGenerationResult {
  exercises: Array<Record<string, unknown>>;
}

export type PipelineStage =
  | "chunk_sources"
  | "analyze_sources"
  | "analyze_past_exam"
  | "generate_track"
  | "generate_lesson"
  | "calculate_readiness"
  | "completed";

export interface PipelineProgress {
  stage: PipelineStage;
  hasMore: boolean;
  examId: string;
  /** Etapa que acaba de ejecutarse en este paso (si aplica). */
  completedStage?: PipelineStage;
  lessonId?: string;
  lessonTitle?: string;
  lessonsTotal?: number;
  lessonsCompleted?: number;
  message?: string;
}

export interface ExamContext {
  examId: string;
  userId: string;
  subjectName: string;
  examDate: string;
  targetGrade: string | null;
  currentLevel: string | null;
  examTypes: string[] | null;
  professorStyles: string[] | null;
  availableMinutesPerDay: number | null;
}

export interface ExerciseGenerationContext {
  lessonType: string;
  topicTitle: string;
  lessonTitle: string;
  sourceChunks: string[];
  pastExamSummary?: string;
  exerciseCount: number;
  allowedTypes?: ExerciseType[];
}
