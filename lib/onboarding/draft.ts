import {
  INITIAL_ONBOARDING_STATE,
  type OnboardingState,
  type OnboardingStepId,
} from "./types";

const DRAFT_VERSION = 1;
const DRAFT_TTL_MS = 14 * 24 * 60 * 60 * 1000;

type SerializableOnboardingState = Omit<
  OnboardingState,
  "materials" | "pastExams"
>;

type StoredDraft = {
  version: number;
  updatedAt: number;
  step: number;
  state: SerializableOnboardingState;
};

export type OnboardingDraft = {
  step: OnboardingStepId;
  state: OnboardingState;
};

function draftKey(userId: string) {
  return `studytrack:onboarding-draft:${userId}`;
}

export function saveOnboardingDraft(
  userId: string,
  step: OnboardingStepId,
  state: OnboardingState,
) {
  if (typeof window === "undefined" || step >= 15) return;

  const serializable: SerializableOnboardingState = {
    ageRange: state.ageRange,
    educationLevel: state.educationLevel,
    career: state.career,
    subjectName: state.subjectName,
    examTypes: state.examTypes,
    examDate: state.examDate,
    targetGrade: state.targetGrade,
    availableMinutesPerDay: state.availableMinutesPerDay,
    unavailableDays: state.unavailableDays,
    currentLevel: state.currentLevel,
    professorStyles: state.professorStyles,
    pastExamsChoice: state.pastExamsChoice,
  };

  const draft: StoredDraft = {
    version: DRAFT_VERSION,
    updatedAt: Date.now(),
    // Los archivos no se pueden restaurar. Si el usuario ya estaba en uploads,
    // vuelve al paso de materiales para seleccionarlos de nuevo.
    step: Math.min(step, 13),
    state: serializable,
  };

  try {
    window.localStorage.setItem(draftKey(userId), JSON.stringify(draft));
  } catch {
    // El onboarding sigue funcionando aunque el navegador bloquee storage.
  }
}

export function loadOnboardingDraft(userId: string): OnboardingDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const key = draftKey(userId);
    const stored = window.localStorage.getItem(key);
    if (!stored) return null;

    const draft = JSON.parse(stored) as StoredDraft;
    if (
      draft.version !== DRAFT_VERSION ||
      !draft.updatedAt ||
      Date.now() - draft.updatedAt > DRAFT_TTL_MS ||
      !draft.state ||
      typeof draft.state !== "object"
    ) {
      window.localStorage.removeItem(key);
      return null;
    }

    const step = Math.max(1, Math.min(13, Number(draft.step) || 1));
    return {
      step: step as OnboardingStepId,
      state: {
        ...INITIAL_ONBOARDING_STATE,
        ...draft.state,
        examTypes: Array.isArray(draft.state.examTypes)
          ? draft.state.examTypes
          : [],
        unavailableDays: Array.isArray(draft.state.unavailableDays)
          ? draft.state.unavailableDays
          : [],
        professorStyles: Array.isArray(draft.state.professorStyles)
          ? draft.state.professorStyles
          : [],
        materials: [],
        pastExams: [],
      },
    };
  } catch {
    return null;
  }
}

export function clearOnboardingDraft(userId: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(draftKey(userId));
  } catch {
    // No bloquear la creaciÃ³n del plan por una preferencia local.
  }
}
