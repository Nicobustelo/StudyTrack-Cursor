export const ONBOARDING_TOTAL_STEPS = 16;

export type OnboardingStepId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

export type MaterialSourceKind = "notes" | "pdf" | "photo" | "pasted_text";

export interface OnboardingMaterial {
  id: string;
  file?: File;
  pastedText?: string;
  fileName: string;
  fileType: string;
  sourceKind: MaterialSourceKind;
}

export interface PastExamMetadata {
  title: string;
  pastExamKind: string;
  teacherMatch: string;
  scopeMatch: string;
  formatMatch: string;
  year?: string;
  difficultyPerceived: string;
  userSimilarityScore: number;
  userNotes?: string;
}

export interface OnboardingPastExam {
  id: string;
  file?: File;
  pastedText?: string;
  fileName: string;
  fileType: string;
  metadata: PastExamMetadata;
}

export type PastExamsChoice = "upload" | "none" | "later";

export interface OnboardingState {
  ageRange?: string;
  educationLevel?: string;
  career?: string;
  subjectName?: string;
  examTypes: string[];
  examDate?: string;
  targetGrade?: string;
  availableMinutesPerDay?: number;
  unavailableDays: string[];
  currentLevel?: string;
  professorStyles: string[];
  materials: OnboardingMaterial[];
  pastExamsChoice?: PastExamsChoice;
  pastExams: OnboardingPastExam[];
}

export const INITIAL_ONBOARDING_STATE: OnboardingState = {
  examTypes: [],
  unavailableDays: [],
  professorStyles: [],
  materials: [],
  pastExams: [],
};

export interface PipelineProgressResponse {
  stage: string;
  hasMore: boolean;
  examId: string;
  lessonId?: string;
  lessonTitle?: string;
  lessonsTotal?: number;
  lessonsCompleted?: number;
  message?: string;
  error?: string;
}
