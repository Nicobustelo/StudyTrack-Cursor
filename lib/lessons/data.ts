import { redirect } from "next/navigation";

import { getPassingScore } from "@/lib/lessons/passing-score";
import { getDemoExercises } from "@/lib/lessons/demo-exercises";
import {
  buildExerciseItems,
  type LessonScreenData,
  type QuizScreenData,
} from "@/lib/lessons/types";
import {
  parseQuestions,
  type QuestionRow,
} from "@/lib/exercises/question-to-exercise";
import { checkAccess } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

async function getUnitNumber(
  supabase: Awaited<ReturnType<typeof createClient>>,
  unitId: string,
): Promise<number> {
  const { data } = await supabase
    .from("study_units")
    .select("order_index")
    .eq("id", unitId)
    .maybeSingle();

  return data?.order_index ?? 1;
}

export async function loadLessonScreenData(
  examId: string,
  lessonId: string,
): Promise<LessonScreenData> {
  const { supabase, user } = await requireUser();

  const { data: exam } = await supabase
    .from("exams")
    .select("id, user_id, target_grade, subject_name")
    .eq("id", examId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!exam) {
    redirect("/dashboard");
  }

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title, summary, content, unit_id, exam_id")
    .eq("id", lessonId)
    .eq("exam_id", examId)
    .maybeSingle();

  if (!lesson) {
    redirect(`/exams/${examId}/track`);
  }

  const unitNumber = await getUnitNumber(supabase, lesson.unit_id);

  const access = await checkAccess({
    userId: user.id,
    examId,
    unitNumber,
  });

  if (!access.allowed) {
    redirect(`/exams/${examId}/track?paywall=1`);
  }

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id")
    .eq("lesson_id", lessonId)
    .maybeSingle();

  let exercises = buildExerciseItems([]);

  if (quiz) {
    const { data: questions } = await supabase
      .from("questions")
      .select(
        "id, question_type, prompt, options, correct_answer, explanation, source_reference",
      )
      .eq("quiz_id", quiz.id)
      .order("created_at", { ascending: true });

    exercises = buildExerciseItems(parseQuestions((questions ?? []) as QuestionRow[]));
  }

  const isDemo = exercises.length === 0;
  if (isDemo) {
    exercises = getDemoExercises().map((exercise, index) => ({
      questionId: `demo-${index}`,
      exercise,
      invalid: false,
      errors: [],
    }));
  }

  return {
    examId,
    lessonId,
    title: lesson.title ?? "Lección",
    summary: lesson.summary,
    content: lesson.content,
    unitNumber,
    targetGrade: exam.target_grade,
    passingScore: getPassingScore(exam.target_grade),
    exercises,
    isDemo,
    trackBackUrl: `/exams/${examId}/track`,
  };
}

export async function loadQuizScreenData(
  examId: string,
  quizId: string,
): Promise<QuizScreenData> {
  const { supabase, user } = await requireUser();

  const { data: exam } = await supabase
    .from("exams")
    .select("id, user_id, target_grade")
    .eq("id", examId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!exam) {
    redirect("/dashboard");
  }

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, title, quiz_type, lesson_id, unit_id, exam_id, passing_score")
    .eq("id", quizId)
    .eq("exam_id", examId)
    .maybeSingle();

  if (!quiz) {
    redirect(`/exams/${examId}/track`);
  }

  const unitNumber = quiz.unit_id
    ? await getUnitNumber(supabase, quiz.unit_id)
    : 1;

  const access = await checkAccess({
    userId: user.id,
    examId,
    unitNumber,
  });

  if (!access.allowed) {
    redirect(`/exams/${examId}/track?paywall=1`);
  }

  const { data: questions } = await supabase
    .from("questions")
    .select(
      "id, question_type, prompt, options, correct_answer, explanation, source_reference",
    )
    .eq("quiz_id", quizId)
    .order("created_at", { ascending: true });

  let exercises = buildExerciseItems(parseQuestions((questions ?? []) as QuestionRow[]));

  const isDemo = exercises.length === 0;
  if (isDemo) {
    exercises = getDemoExercises().map((exercise, index) => ({
      questionId: `demo-${index}`,
      exercise,
      invalid: false,
      errors: [],
    }));
  }

  const passingScore =
    quiz.passing_score != null
      ? Number(quiz.passing_score)
      : getPassingScore(exam.target_grade);

  return {
    examId,
    quizId,
    lessonId: quiz.lesson_id,
    title: quiz.title ?? "Quiz",
    quizType: quiz.quiz_type,
    unitNumber,
    targetGrade: exam.target_grade,
    passingScore,
    exercises,
    isDemo,
    trackBackUrl: `/exams/${examId}/track`,
  };
}
