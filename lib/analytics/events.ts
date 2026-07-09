/**
 * Taxonomía de eventos PostHog — spec sección 20.
 * Fuente única de verdad para nombres de eventos y propiedades compartidas.
 */

/** Propiedades compartidas documentadas en la spec (sección 20). */
export interface AnalyticsProperties {
  exam_id?: string;
  subject_name?: string;
  exam_type?: string;
  days_until_exam?: number;
  target_grade?: string;
  available_minutes_per_day?: number;
  has_past_exams?: boolean;
  number_of_files?: number;
  number_of_past_exams?: number;
  readiness_score?: number;
  current_unit?: number;
  is_premium?: boolean;
  plan_type?: string;
}

/** Propiedades extra para fallos del pipeline de IA (spec 41.1 / 41.6). */
export interface PipelineFailureProperties extends AnalyticsProperties {
  error_message?: string;
  stage?: string;
  route?: string;
  status_code?: number;
}

export const ANALYTICS_EVENTS = {
  LANDING_VIEWED: "landing_viewed",
  CTA_CLICKED: "cta_clicked",
  SIGNUP_STARTED: "signup_started",
  SIGNUP_COMPLETED: "signup_completed",
  ONBOARDING_STARTED: "onboarding_started",
  ONBOARDING_STEP_COMPLETED: "onboarding_step_completed",
  ONBOARDING_COMPLETED: "onboarding_completed",
  EXAM_CREATED: "exam_created",
  STUDY_MATERIAL_UPLOADED: "study_material_uploaded",
  STUDY_MATERIAL_UPLOAD_FAILED: "study_material_upload_failed",
  PAST_EXAM_UPLOADED: "past_exam_uploaded",
  PAST_EXAM_METADATA_COMPLETED: "past_exam_metadata_completed",
  PAST_EXAM_SIMILARITY_SET: "past_exam_similarity_set",
  ANALYSIS_STARTED: "analysis_started",
  ANALYSIS_COMPLETED: "analysis_completed",
  ANALYSIS_FAILED: "analysis_failed",
  TRACK_GENERATED: "track_generated",
  TRACK_VIEWED: "track_viewed",
  LESSON_STARTED: "lesson_started",
  LESSON_COMPLETED: "lesson_completed",
  QUIZ_STARTED: "quiz_started",
  QUIZ_COMPLETED: "quiz_completed",
  QUIZ_FAILED: "quiz_failed",
  QUIZ_PASSED: "quiz_passed",
  UNIT_COMPLETED: "unit_completed",
  PAYWALL_SEEN: "paywall_seen",
  PAYWALL_CTA_CLICKED: "paywall_cta_clicked",
  CHECKOUT_STARTED: "checkout_started",
  CHECKOUT_SUCCESS: "checkout_success",
  CHECKOUT_FAILURE: "checkout_failure",
  CHECKOUT_PENDING: "checkout_pending",
  PREMIUM_UNLOCKED: "premium_unlocked",
  READINESS_SCORE_VIEWED: "readiness_score_viewed",
  MOCK_EXAM_STARTED: "mock_exam_started",
  MOCK_EXAM_COMPLETED: "mock_exam_completed",
  EMERGENCY_MODE_VIEWED: "emergency_mode_viewed",
  EMERGENCY_MODE_STARTED: "emergency_mode_started",
} as const;

export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/** Mapa tipado de propiedades por evento (extensible por workers). */
export type EventPropertiesMap = {
  [ANALYTICS_EVENTS.LANDING_VIEWED]: AnalyticsProperties & {
    referrer?: string;
  };
  [ANALYTICS_EVENTS.CTA_CLICKED]: AnalyticsProperties & {
    cta_id?: string;
    cta_label?: string;
    location?: string;
  };
  [ANALYTICS_EVENTS.SIGNUP_STARTED]: AnalyticsProperties;
  [ANALYTICS_EVENTS.SIGNUP_COMPLETED]: AnalyticsProperties;
  [ANALYTICS_EVENTS.ONBOARDING_STARTED]: AnalyticsProperties;
  [ANALYTICS_EVENTS.ONBOARDING_STEP_COMPLETED]: AnalyticsProperties & {
    step: number;
    step_name?: string;
  };
  [ANALYTICS_EVENTS.ONBOARDING_COMPLETED]: AnalyticsProperties & {
    exam_id: string;
  };
  [ANALYTICS_EVENTS.EXAM_CREATED]: AnalyticsProperties & {
    exam_id: string;
  };
  [ANALYTICS_EVENTS.STUDY_MATERIAL_UPLOADED]: AnalyticsProperties & {
    number_of_files?: number;
  };
  [ANALYTICS_EVENTS.STUDY_MATERIAL_UPLOAD_FAILED]: AnalyticsProperties & {
    error_message?: string;
  };
  [ANALYTICS_EVENTS.PAST_EXAM_UPLOADED]: AnalyticsProperties;
  [ANALYTICS_EVENTS.PAST_EXAM_METADATA_COMPLETED]: AnalyticsProperties;
  [ANALYTICS_EVENTS.PAST_EXAM_SIMILARITY_SET]: AnalyticsProperties;
  [ANALYTICS_EVENTS.ANALYSIS_STARTED]: AnalyticsProperties & {
    exam_id: string;
  };
  [ANALYTICS_EVENTS.ANALYSIS_COMPLETED]: AnalyticsProperties & {
    exam_id: string;
  };
  [ANALYTICS_EVENTS.ANALYSIS_FAILED]: PipelineFailureProperties;
  [ANALYTICS_EVENTS.TRACK_GENERATED]: AnalyticsProperties & {
    exam_id: string;
  };
  [ANALYTICS_EVENTS.TRACK_VIEWED]: AnalyticsProperties & {
    exam_id: string;
  };
  [ANALYTICS_EVENTS.LESSON_STARTED]: AnalyticsProperties & {
    exam_id: string;
    lesson_id?: string;
  };
  [ANALYTICS_EVENTS.LESSON_COMPLETED]: AnalyticsProperties & {
    exam_id: string;
    lesson_id?: string;
  };
  [ANALYTICS_EVENTS.QUIZ_STARTED]: AnalyticsProperties & {
    exam_id: string;
    unit_id?: string;
  };
  [ANALYTICS_EVENTS.QUIZ_COMPLETED]: AnalyticsProperties & {
    exam_id: string;
    score?: number;
  };
  [ANALYTICS_EVENTS.QUIZ_FAILED]: AnalyticsProperties & {
    exam_id: string;
    score?: number;
  };
  [ANALYTICS_EVENTS.QUIZ_PASSED]: AnalyticsProperties & {
    exam_id: string;
    score?: number;
  };
  [ANALYTICS_EVENTS.UNIT_COMPLETED]: AnalyticsProperties & {
    exam_id: string;
    current_unit: number;
  };
  [ANALYTICS_EVENTS.PAYWALL_SEEN]: AnalyticsProperties & {
    exam_id?: string;
    location?: string;
  };
  [ANALYTICS_EVENTS.PAYWALL_CTA_CLICKED]: AnalyticsProperties & {
    plan_type?: string;
  };
  [ANALYTICS_EVENTS.CHECKOUT_STARTED]: AnalyticsProperties & {
    plan_type: string;
  };
  [ANALYTICS_EVENTS.CHECKOUT_SUCCESS]: AnalyticsProperties & {
    plan_type?: string;
  };
  [ANALYTICS_EVENTS.CHECKOUT_FAILURE]: AnalyticsProperties & {
    plan_type?: string;
  };
  [ANALYTICS_EVENTS.CHECKOUT_PENDING]: AnalyticsProperties & {
    plan_type?: string;
  };
  [ANALYTICS_EVENTS.PREMIUM_UNLOCKED]: AnalyticsProperties & {
    exam_id?: string;
    plan_type?: string;
  };
  [ANALYTICS_EVENTS.READINESS_SCORE_VIEWED]: AnalyticsProperties & {
    exam_id: string;
    readiness_score?: number;
  };
  [ANALYTICS_EVENTS.MOCK_EXAM_STARTED]: AnalyticsProperties & {
    exam_id: string;
  };
  [ANALYTICS_EVENTS.MOCK_EXAM_COMPLETED]: AnalyticsProperties & {
    exam_id: string;
    score?: number;
  };
  [ANALYTICS_EVENTS.EMERGENCY_MODE_VIEWED]: AnalyticsProperties & {
    exam_id?: string;
  };
  [ANALYTICS_EVENTS.EMERGENCY_MODE_STARTED]: AnalyticsProperties & {
    exam_id?: string;
  };
};

export type EventProperties<E extends AnalyticsEvent> =
  E extends keyof EventPropertiesMap ? EventPropertiesMap[E] : AnalyticsProperties;
