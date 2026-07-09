import { redirect } from "next/navigation";

import { hasExamPremiumAccess } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";

import { buildDemoTrackViewModel } from "./demo";
import { resolveTrackStatuses, type TrackNodeFacts } from "./status";
import type {
  DailyChallengeVM,
  TrackNodeKind,
  TrackNodeVM,
  TrackUnitVM,
  TrackViewModel,
} from "./types";

interface ExamRow {
  id: string;
  subject_name: string | null;
  exam_date: string | null;
  target_grade: string | null;
  readiness_score: number | string | null;
  status: string | null;
  is_emergency_mode: boolean | null;
}

interface UnitRow {
  id: string;
  title: string | null;
  description: string | null;
  order_index: number | null;
  is_premium: boolean | null;
}

interface LessonRow {
  id: string;
  unit_id: string | null;
  title: string | null;
  order_index: number | null;
  estimated_minutes: number | null;
  lesson_type: string | null;
  is_premium: boolean | null;
  status: string | null;
  has_content: boolean;
}

interface ProgressRow {
  lesson_id: string | null;
  status: string | null;
  best_score: number | string | null;
  completed_at: string | null;
}

interface QuizRow {
  id: string;
  lesson_id: string | null;
}

const REVIEW_DUE_AFTER_DAYS = 3;
const DAILY_CHALLENGE_XP = 15;

function lessonKind(lessonType: string | null): TrackNodeKind {
  switch (lessonType) {
    case "practice":
      return "practice";
    case "review":
      return "review";
    case "daily_challenge":
      return "daily_challenge";
    case "quiz":
      return "quiz";
    case "mock_exam":
      return "mock_exam";
    default:
      return "lesson";
  }
}

function toLocalMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Días hasta el examen usando fechas LOCALES (spec 41.2: no UTC). */
export function daysUntil(examDateISO: string | null): number {
  if (!examDateISO) return 0;
  const [y, m, d] = examDateISO.split("-").map(Number);
  if (!y || !m || !d) return 0;
  const exam = new Date(y, m - 1, d);
  const today = toLocalMidnight(new Date());
  return Math.max(0, Math.round((exam.getTime() - today.getTime()) / 86_400_000));
}

/** Racha de días consecutivos con actividad, terminando hoy o ayer. */
export function computeStreak(activityDates: string[], today = new Date()): number {
  if (activityDates.length === 0) return 0;

  const days = new Set(activityDates);
  const cursor = toLocalMidnight(today);

  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;

  // La racha sigue viva si hubo actividad hoy o ayer.
  if (!days.has(iso(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(iso(cursor))) return 0;
  }

  let streak = 0;
  while (days.has(iso(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function isOlderThanDays(dateISO: string | null, daysCount: number): boolean {
  if (!dateISO) return false;
  const then = new Date(dateISO);
  if (Number.isNaN(then.getTime())) return false;
  return Date.now() - then.getTime() > daysCount * 86_400_000;
}

/**
 * Carga el view model del track desde Supabase. Si el examen no existe o no
 * tiene contenido suficiente, devuelve el track demo (la ruta nunca se
 * bloquea por seed ausente — tarea W5.5).
 */
export async function loadTrackViewModel(examId: string): Promise<TrackViewModel> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/exams/${examId}/track`);
  }

  try {
    const { data: exam } = await supabase
      .from("exams")
      .select(
        "id, subject_name, exam_date, target_grade, readiness_score, status, is_emergency_mode",
      )
      .eq("id", examId)
      .eq("user_id", user.id)
      .maybeSingle<ExamRow>();

    if (!exam) {
      return buildDemoTrackViewModel(examId);
    }

    let hasPremiumAccess = false;
    try {
      hasPremiumAccess = await hasExamPremiumAccess(user.id, examId);
    } catch {
      hasPremiumAccess = false;
    }

    const [unitsRes, lessonsRes, progressRes, quizzesRes, activityRes] =
      await Promise.all([
        supabase
          .from("study_units")
          .select("id, title, description, order_index, is_premium")
          .eq("exam_id", examId)
          .order("order_index", { ascending: true }),
        supabase
          .from("lessons")
          .select(
            "id, unit_id, title, order_index, estimated_minutes, lesson_type, is_premium, status, content",
          )
          .eq("exam_id", examId)
          .order("order_index", { ascending: true }),
        supabase
          .from("lesson_progress")
          .select("lesson_id, status, best_score, completed_at")
          .eq("exam_id", examId)
          .eq("user_id", user.id),
        supabase
          .from("quizzes")
          .select("id, lesson_id")
          .eq("exam_id", examId),
        supabase
          .from("daily_activity")
          .select("activity_date")
          .eq("user_id", user.id)
          .order("activity_date", { ascending: false })
          .limit(90),
      ]);

    const units = (unitsRes.data ?? []) as UnitRow[];
    const lessons: LessonRow[] = (
      (lessonsRes.data ?? []) as Array<
        Omit<LessonRow, "has_content"> & { content: string | null }
      >
    ).map(({ content, ...rest }) => ({
      ...rest,
      has_content: content != null && content.length > 0,
    }));

    if (units.length === 0 || lessons.length === 0) {
      const demo = buildDemoTrackViewModel(examId, { hasPremiumAccess });
      return {
        ...demo,
        subjectName: exam.subject_name ?? demo.subjectName,
        examDateISO: exam.exam_date ?? demo.examDateISO,
        daysUntilExam: exam.exam_date
          ? daysUntil(exam.exam_date)
          : demo.daysUntilExam,
        targetGrade: exam.target_grade ?? demo.targetGrade,
        generating: exam.status !== "ready",
      };
    }

    const progressByLesson = new Map<string, ProgressRow>();
    for (const row of (progressRes.data ?? []) as ProgressRow[]) {
      if (row.lesson_id) progressByLesson.set(row.lesson_id, row);
    }

    const quizByLesson = new Map<string, string>();
    for (const row of (quizzesRes.data ?? []) as QuizRow[]) {
      if (row.lesson_id) quizByLesson.set(row.lesson_id, row.id);
    }

    const streakDays = computeStreak(
      ((activityRes.data ?? []) as Array<{ activity_date: string | null }>)
        .map((r) => r.activity_date)
        .filter((d): d is string => Boolean(d)),
    );

    // Orden global: unidades por order_index, lecciones por order_index.
    const orderedUnits = units
      .slice()
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

    const lessonsByUnit = new Map<string, LessonRow[]>();
    for (const lesson of lessons) {
      if (!lesson.unit_id) continue;
      const list = lessonsByUnit.get(lesson.unit_id) ?? [];
      list.push(lesson);
      lessonsByUnit.set(lesson.unit_id, list);
    }
    lessonsByUnit.forEach((list) =>
      list.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)),
    );

    const examReady = exam.status === "ready";

    const facts: TrackNodeFacts[] = [];
    const factMeta = new Map<
      string,
      { lesson: LessonRow; unitNumber: number; kind: TrackNodeKind }
    >();

    orderedUnits.forEach((unit, unitIdx) => {
      const unitNumber = unit.order_index ?? unitIdx + 1;
      for (const lesson of lessonsByUnit.get(unit.id) ?? []) {
        const kind = lessonKind(lesson.lesson_type);
        const progress = progressByLesson.get(lesson.id);
        const completed =
          progress?.status === "completed" || lesson.status === "completed";
        facts.push({
          id: lesson.id,
          kind,
          premiumRequired: Boolean(
            unitNumber >= 3 ||
              unit.is_premium ||
              lesson.is_premium ||
              kind === "mock_exam",
          ),
          completed,
          failed: progress?.status === "failed",
          reviewDue:
            kind === "review" &&
            completed &&
            isOlderThanDays(progress?.completed_at ?? null, REVIEW_DUE_AFTER_DAYS),
        });
        factMeta.set(lesson.id, { lesson, unitNumber, kind });
      }
    });

    const resolved = resolveTrackStatuses(facts, hasPremiumAccess);

    let dailyChallenge: DailyChallengeVM | null = null;

    const unitVMs: TrackUnitVM[] = orderedUnits
      .map((unit, unitIdx) => {
        const unitNumber = unit.order_index ?? unitIdx + 1;
        const unitLessons = lessonsByUnit.get(unit.id) ?? [];

        const nodes: TrackNodeVM[] = unitLessons.map((lesson) => {
          const meta = factMeta.get(lesson.id);
          const kind = meta?.kind ?? "lesson";
          const res = resolved.get(lesson.id) ?? {
            status: "locked" as const,
            isCurrent: false,
          };
          const progress = progressByLesson.get(lesson.id);
          const quizId = quizByLesson.get(lesson.id);

          const href =
            kind === "quiz" && quizId
              ? `/exams/${examId}/quiz/${quizId}`
              : `/exams/${examId}/lesson/${lesson.id}`;

          const completed = res.status === "completed" || res.status === "review_due";
          const bestScore =
            progress?.best_score != null ? Number(progress.best_score) : null;

          const vm: TrackNodeVM = {
            id: lesson.id,
            kind,
            title: lesson.title ?? "Lección",
            durationMinutes: lesson.estimated_minutes,
            status: res.status,
            isCurrent: res.isCurrent,
            href,
            score: completed && bestScore != null ? Math.round(bestScore) : null,
            premiumGated: res.status === "premium_locked",
            // Contenido que falló al generarse: se marca para mostrar
            // fallback visual, pero el href sigue siendo válido (la pantalla
            // de lección de W7 tiene su propio fallback + saltar).
            broken:
              examReady &&
              !lesson.has_content &&
              res.status !== "locked" &&
              res.status !== "premium_locked" &&
              !completed,
          };

          if (
            kind === "daily_challenge" &&
            !dailyChallenge &&
            (vm.status === "available" ||
              vm.status === "failed_retry" ||
              vm.status === "completed")
          ) {
            dailyChallenge = {
              id: vm.id,
              title: vm.title,
              xp: DAILY_CHALLENGE_XP,
              durationMinutes: vm.durationMinutes ?? 7,
              status:
                vm.status === "completed"
                  ? "completed"
                  : vm.status === "failed_retry"
                    ? "failed_retry"
                    : "available",
              href: vm.href,
            };
          }

          return vm;
        });

        return {
          id: unit.id,
          number: unitNumber,
          title: unit.title ?? `Unidad ${unitNumber}`,
          description: unit.description,
          isPremiumUnit: Boolean(unit.is_premium || unitNumber >= 3),
          totalLessons: nodes.length,
          completedLessons: nodes.filter(
            (n) => n.status === "completed" || (n.status === "review_due" && !n.isCurrent),
          ).length,
          nodes,
        };
      })
      .filter((unit) => unit.nodes.length > 0);

    const daysUntilExam = daysUntil(exam.exam_date);
    const readiness = exam.readiness_score != null ? Number(exam.readiness_score) : 0;

    return {
      examId,
      subjectName: exam.subject_name ?? "Tu examen",
      examDateISO: exam.exam_date ?? "",
      daysUntilExam,
      targetGrade: exam.target_grade,
      readinessScore: Math.max(0, Math.min(100, Math.round(readiness))),
      streakDays,
      hasPremiumAccess,
      emergencyMode: Boolean(exam.is_emergency_mode) || daysUntilExam <= 3,
      isDemo: false,
      generating: !examReady,
      dailyChallenge,
      units: unitVMs,
    };
  } catch {
    // Cualquier error inesperado degrada a demo: el track nunca se rompe.
    return buildDemoTrackViewModel(examId);
  }
}
