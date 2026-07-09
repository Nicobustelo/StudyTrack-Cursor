/**
 * Seed demo idempotente — spec 21 + 41.2.
 * Uso: npm run seed:demo
 * Env: SEED_USER_ID (opcional), carga .env.local automáticamente.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createClient } from "@supabase/supabase-js";

import {
  DEMO_EXAM_MARKER,
  DEMO_EXAM_SUBJECT,
  DEMO_TOPICS,
  DEMO_UNITS,
} from "../lib/demo/constants";
import {
  addLocalDays,
  formatLocalDate,
  recentLocalDates,
} from "../lib/dates/local";

function loadEnvFile(filename: string) {
  const filePath = resolve(process.cwd(), filename);
  if (!existsSync(filePath)) return;

  const content = readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env.local");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function resolveUserId(): Promise<string> {
  const fromEnv = process.env.SEED_USER_ID?.trim();
  if (fromEnv) return fromEnv;

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data?.id) {
    throw new Error(
      "No hay perfiles. Creá un usuario (signup) o definí SEED_USER_ID.",
    );
  }

  return data.id;
}

async function deleteExistingDemo(userId: string) {
  const { data: exams } = await supabase
    .from("exams")
    .select("id")
    .eq("user_id", userId)
    .eq("subject_name", DEMO_EXAM_SUBJECT)
    .contains("professor_styles", [DEMO_EXAM_MARKER]);

  if (!exams?.length) return;

  for (const exam of exams) {
    const { error } = await supabase.from("exams").delete().eq("id", exam.id);
    if (error) {
      throw new Error(`No se pudo borrar demo anterior: ${error.message}`);
    }
  }

  console.log(`Demo anterior eliminado (${exams.length} examen/es).`);
}

async function seed() {
  const userId = await resolveUserId();
  console.log(`Seeding demo para user ${userId}…`);

  await deleteExistingDemo(userId);

  const today = new Date();
  const examDate = formatLocalDate(addLocalDays(today, 10));

  const { data: exam, error: examError } = await supabase
    .from("exams")
    .insert({
      user_id: userId,
      subject_name: DEMO_EXAM_SUBJECT,
      exam_date: examDate,
      target_grade: "8+",
      available_minutes_per_day: 60,
      unavailable_days: ["domingo"],
      current_level: "medio",
      exam_types: ["parcial"],
      professor_styles: [
        DEMO_EXAM_MARKER,
        "fórmulas",
        "conceptual",
        "mucho detalle",
        "preguntas trampa",
      ],
      status: "active",
      readiness_score: 42,
      is_emergency_mode: false,
    })
    .select("id")
    .single();

  if (examError || !exam) {
    throw new Error(`Error creando examen: ${examError?.message}`);
  }

  const examId = exam.id;

  const topicRows = DEMO_TOPICS.map((title, index) => ({
    exam_id: examId,
    title,
    summary: `Tema demo ${index + 1}`,
    importance: 0.95 - index * 0.05,
    difficulty: 0.5 + (index % 3) * 0.1,
    estimated_minutes: 45,
    past_exam_frequency: index % 2 === 0 ? 2 : 1,
    mastery_score: index < 2 ? 70 : index < 4 ? 50 : 35,
  }));

  const { data: topics, error: topicsError } = await supabase
    .from("topics")
    .insert(topicRows)
    .select("id, title");

  if (topicsError || !topics) {
    throw new Error(`Error creando topics: ${topicsError?.message}`);
  }

  const topicIdByTitle = new Map(
    topics.map((t) => [t.title as string, t.id as string]),
  );

  const unitIds: string[] = [];
  const lessonIds: string[] = [];
  let dailyChallengeLessonId: string | null = null;

  for (const [unitIndex, unit] of DEMO_UNITS.entries()) {
    const { data: unitRow, error: unitError } = await supabase
      .from("study_units")
      .insert({
        exam_id: examId,
        title: unit.title,
        description: `Unidad ${unitIndex + 1} — ${unit.title}`,
        order_index: unitIndex + 1,
        is_premium: unit.is_premium,
      })
      .select("id")
      .single();

    if (unitError || !unitRow) {
      throw new Error(`Error creando unidad: ${unitError?.message}`);
    }

    unitIds.push(unitRow.id);

    for (const [lessonIndex, lessonTitle] of unit.lessons.entries()) {
      const isDaily =
        unitIndex === 1 &&
        lessonIndex === 0 &&
        lessonTitle === "Derivadas parciales";

      const { data: lesson, error: lessonError } = await supabase
        .from("lessons")
        .insert({
          exam_id: examId,
          unit_id: unitRow.id,
          topic_id: topicIdByTitle.get(
            DEMO_TOPICS[Math.min(unitIndex + 1, DEMO_TOPICS.length - 1)]!,
          ),
          title: lessonTitle,
          summary: lessonTitle,
          content: `Contenido demo: ${lessonTitle}`,
          order_index: lessonIndex + 1,
          estimated_minutes: 12,
          lesson_type: isDaily ? "daily_challenge" : "concept",
          is_premium: unit.is_premium,
          status:
            unitIndex === 0 && lessonIndex < 2
              ? "completed"
              : unitIndex === 0 && lessonIndex === 2
                ? "available"
                : unit.is_premium
                  ? "locked"
                  : "available",
        })
        .select("id, lesson_type")
        .single();

      if (lessonError || !lesson) {
        throw new Error(`Error creando lección: ${lessonError?.message}`);
      }

      lessonIds.push(lesson.id);
      if (lesson.lesson_type === "daily_challenge") {
        dailyChallengeLessonId = lesson.id;
      }
    }

    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .insert({
        exam_id: examId,
        unit_id: unitRow.id,
        title: `Test — ${unit.title}`,
        quiz_type: "unit_test",
        passing_score: 70,
        is_premium: unit.is_premium,
      })
      .select("id")
      .single();

    if (quizError || !quiz) {
      throw new Error(`Error creando quiz: ${quizError?.message}`);
    }

    const topicId = topicIdByTitle.get(DEMO_TOPICS[unitIndex]!)!;
    await supabase.from("questions").insert([
      {
        quiz_id: quiz.id,
        exam_id: examId,
        topic_id: topicId,
        question_type: "multiple_choice",
        prompt: `Pregunta demo de ${unit.title}`,
        options: [
          { id: "a", text: "Opción A" },
          { id: "b", text: "Opción B" },
        ],
        correct_answer: { kind: "choice", data: "a" },
        explanation: "Explicación demo.",
        difficulty: 0.5,
      },
      {
        quiz_id: quiz.id,
        exam_id: examId,
        topic_id: topicId,
        question_type: "true_false",
        prompt: `Verdadero o falso sobre ${unit.title}`,
        options: null,
        correct_answer: { kind: "boolean", data: true },
        explanation: "Explicación demo.",
        difficulty: 0.4,
      },
    ]);
  }

  const progressRows = lessonIds.map((lessonId, index) => {
    const completed = index < 3;
    return {
      user_id: userId,
      exam_id: examId,
      lesson_id: lessonId,
      status: completed ? "completed" : "not_started",
      best_score: completed ? 85 : null,
      attempts: completed ? 1 : 0,
      completed_at: completed ? new Date().toISOString() : null,
    };
  });

  if (dailyChallengeLessonId) {
    const existing = progressRows.find(
      (p) => p.lesson_id === dailyChallengeLessonId,
    );
    if (existing) {
      existing.status = "completed";
      existing.best_score = 90;
      existing.attempts = 1;
      existing.completed_at = new Date().toISOString();
    } else {
      progressRows.push({
        user_id: userId,
        exam_id: examId,
        lesson_id: dailyChallengeLessonId,
        status: "completed",
        best_score: 90,
        attempts: 1,
        completed_at: new Date().toISOString(),
      });
    }
  }

  const { error: progressError } = await supabase
    .from("lesson_progress")
    .insert(progressRows);

  if (progressError) {
    throw new Error(`Error creando lesson_progress: ${progressError.message}`);
  }

  const activityDates = recentLocalDates(3, today);
  const { error: activityError } = await supabase.from("daily_activity").insert(
    activityDates.map((date, i) => ({
      user_id: userId,
      exam_id: examId,
      activity_date: date,
      xp_earned: 15 + i * 5,
    })),
  );

  if (activityError) {
    throw new Error(`Error creando daily_activity: ${activityError.message}`);
  }

  const { data: source, error: sourceError } = await supabase
    .from("study_sources")
    .insert({
      exam_id: examId,
      user_id: userId,
      file_name: "apuntes-analisis-2.pdf",
      file_type: "application/pdf",
      raw_text: "Mock notes — funciones de varias variables, derivadas parciales.",
      source_kind: "upload",
      processing_status: "completed",
    })
    .select("id")
    .single();

  if (sourceError || !source) {
    throw new Error(`Error creando source: ${sourceError?.message}`);
  }

  await supabase.from("past_exams").insert([
    {
      exam_id: examId,
      title: "Parcial 2024",
      past_exam_kind: "parcial",
      user_similarity_score: 8,
      ai_similarity_score: 7.5,
      final_relevance_score: 8,
      analysis_summary:
        "12 preguntas · 4 temas repetidos · foco en definiciones y casos",
    },
    {
      exam_id: examId,
      title: "Parcial 2023",
      past_exam_kind: "parcial",
      user_similarity_score: 7,
      ai_similarity_score: 6.8,
      final_relevance_score: 7,
      analysis_summary: "10 preguntas · mucho foco en gradiente",
    },
  ]);

  await supabase.from("readiness_scores").insert({
    exam_id: examId,
    user_id: userId,
    score: 42,
    topic_mastery_score: 45,
    coverage_score: 38,
    quiz_performance_score: 50,
    recency_score: 40,
    consistency_score: 42,
    time_risk_score: 35,
    explanation: "Seed demo — preparación inicial moderada.",
  });

  console.log("Seed demo completado.");
  console.log(`  exam_id: ${examId}`);
  console.log(`  subject: ${DEMO_EXAM_SUBJECT}`);
  console.log(`  readiness: 42%`);
  console.log(`  streak: 3 días (${activityDates.join(", ")})`);
  console.log(`  track: /exams/${examId}/track`);
}

seed().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
