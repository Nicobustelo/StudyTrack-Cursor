/**
 * View model del Learning Track (spec 5.1 / 11 / 23).
 * Todo serializable: se computa server-side y se pasa a componentes cliente.
 */

/** Los 7 estados de nodo de la spec 11.3. */
export type TrackNodeStatus =
  | "completed"
  | "current"
  | "available"
  | "locked"
  | "premium_locked"
  | "failed_retry"
  | "review_due";

/** Tipos de nodo (spec 11.4, mapeados desde lessons.lesson_type). */
export type TrackNodeKind =
  | "lesson"
  | "practice"
  | "quiz"
  | "review"
  | "mock_exam"
  | "daily_challenge";

export interface TrackNodeVM {
  id: string;
  kind: TrackNodeKind;
  title: string;
  durationMinutes: number | null;
  status: TrackNodeStatus;
  /**
   * Invariante del track: exactamente UN nodo de todo el track tiene
   * isCurrent=true (garantizado por resolveTrackStatuses). Puede tener
   * status "current", "failed_retry", "review_due" o "premium_locked",
   * pero siempre es el CTA principal del camino.
   */
  isCurrent: boolean;
  href: string;
  /** Mejor score (0-100) si está completado. */
  score: number | null;
  /** Requiere premium y el usuario no lo tiene. */
  premiumGated: boolean;
  /** El contenido falló al generarse: mostrar fallback, nunca nodo muerto. */
  broken: boolean;
}

export interface TrackUnitVM {
  id: string;
  /** order_index 1-based. */
  number: number;
  title: string;
  description: string | null;
  isPremiumUnit: boolean;
  totalLessons: number;
  completedLessons: number;
  nodes: TrackNodeVM[];
}

export interface DailyChallengeVM {
  id: string;
  title: string;
  xp: number;
  durationMinutes: number;
  status: "available" | "completed" | "failed_retry";
  href: string;
}

export interface TrackViewModel {
  examId: string;
  subjectName: string;
  /** 'YYYY-MM-DD' local. */
  examDateISO: string;
  daysUntilExam: number;
  targetGrade: string | null;
  /** 0-100. */
  readinessScore: number;
  streakDays: number;
  hasPremiumAccess: boolean;
  /** true si faltan <= 3 días (Modo Emergencia, spec 16). */
  emergencyMode: boolean;
  /** true cuando se muestra el track demo (sin datos suficientes en DB). */
  isDemo: boolean;
  /** true si el examen existe pero el pipeline sigue generando contenido. */
  generating: boolean;
  dailyChallenge: DailyChallengeVM | null;
  units: TrackUnitVM[];
}
