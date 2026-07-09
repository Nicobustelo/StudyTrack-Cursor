import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { DEMO_EXAM_SUBJECT } from "@/lib/demo/constants";
import { getDemoExamSnapshot } from "@/lib/demo/fallback-data";

export type ExamRow = {
  id: string;
  user_id: string;
  subject_name: string;
  exam_date: string;
  target_grade: string | null;
  readiness_score: number;
  status: string;
  is_emergency_mode: boolean;
  current_level: string | null;
  available_minutes_per_day: number | null;
};

export type TopicRow = {
  id: string;
  title: string | null;
  mastery_score: number;
  importance: number | null;
  past_exam_frequency: number;
};

export type StudyUnitRow = {
  id: string;
  title: string | null;
  order_index: number | null;
  is_premium: boolean;
};

export type StudySourceRow = {
  id: string;
  file_name: string | null;
  file_type: string | null;
  processing_status: string;
  created_at: string;
};

export type PastExamRow = {
  id: string;
  title: string | null;
  past_exam_kind: string | null;
  final_relevance_score: number | null;
  user_similarity_score: number | null;
  ai_similarity_score: number | null;
  analysis_summary: string | null;
};

export type DailyActivityRow = {
  activity_date: string;
  xp_earned: number;
};

export async function listUserExams(userId: string): Promise<ExamRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("exams")
    .select(
      "id, user_id, subject_name, exam_date, target_grade, readiness_score, status, is_emergency_mode, current_level, available_minutes_per_day",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getExamById(
  examId: string,
  userId: string,
): Promise<ExamRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("exams")
    .select(
      "id, user_id, subject_name, exam_date, target_grade, readiness_score, status, is_emergency_mode, current_level, available_minutes_per_day",
    )
    .eq("id", examId)
    .eq("user_id", userId)
    .maybeSingle();

  return data;
}

export async function requireExam(examId: string) {
  const user = await requireUser();
  const exam = await getExamById(examId, user.id);

  if (!exam) {
    notFound();
  }

  return { user, exam };
}

export async function getExamTopics(examId: string): Promise<TopicRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("topics")
    .select("id, title, mastery_score, importance, past_exam_frequency")
    .eq("exam_id", examId)
    .order("created_at");

  return data?.length ? data : getDemoExamSnapshot().topics;
}

export async function getExamUnits(examId: string): Promise<StudyUnitRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("study_units")
    .select("id, title, order_index, is_premium")
    .eq("exam_id", examId)
    .order("order_index");

  return data?.length ? data : getDemoExamSnapshot().units;
}

export async function getExamSources(examId: string): Promise<StudySourceRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("study_sources")
    .select("id, file_name, file_type, processing_status, created_at")
    .eq("exam_id", examId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getExamPastExams(examId: string): Promise<PastExamRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("past_exams")
    .select(
      "id, title, past_exam_kind, final_relevance_score, user_similarity_score, ai_similarity_score, analysis_summary",
    )
    .eq("exam_id", examId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getExamDailyActivity(
  examId: string,
  userId: string,
): Promise<DailyActivityRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("daily_activity")
    .select("activity_date, xp_earned")
    .eq("exam_id", examId)
    .eq("user_id", userId)
    .order("activity_date", { ascending: false })
    .limit(30);

  if (data?.length) return data;
  return getDemoExamSnapshot().dailyActivity;
}

export async function getCompletedLessonsCount(
  examId: string,
  userId: string,
): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("exam_id", examId)
    .eq("user_id", userId)
    .eq("status", "completed");

  return count ?? getDemoExamSnapshot().completedLessons;
}

export function isDemoSubject(subjectName: string): boolean {
  return subjectName === DEMO_EXAM_SUBJECT;
}
