import type { SupabaseClient } from "@supabase/supabase-js";

import { EXERCISE_LIMITS } from "../constants";
import { isCorruptChunk, chunkText } from "../domain/chunking";
import { estimateInitialReadiness } from "../domain/readiness";
import {
  calculateAiSimilarityScore,
  calculateFinalRelevanceScore,
  normalizeSubscores,
} from "../domain/similarity";
import {
  isUsableRawText,
  resolveSourceText,
  sourceNeedsStorageExtraction,
} from "../domain/text-extraction";
import { PipelineError } from "./errors";
import {
  runExerciseGeneration,
  runLessonContentGeneration,
  runPastExamAnalysis,
  runSourceAnalysis,
  runTrackGeneration,
} from "../services/generation";
import type { ExamContext, PipelineProgress, PipelineStage } from "../types";
import {
  exerciseToQuestionRow,
  validateExerciseWithSanitize,
  validateExercises,
} from "@/lib/exercises/validate-exercise";

interface ExamRow {
  id: string;
  user_id: string;
  subject_name: string;
  exam_date: string;
  target_grade: string | null;
  current_level: string | null;
  exam_types: string[] | null;
  professor_styles: string[] | null;
  available_minutes_per_day: number | null;
  status: string;
  readiness_score: number;
}

function toExamContext(exam: ExamRow): ExamContext {
  return {
    examId: exam.id,
    userId: exam.user_id,
    subjectName: exam.subject_name,
    examDate: exam.exam_date,
    targetGrade: exam.target_grade,
    currentLevel: exam.current_level,
    examTypes: exam.exam_types,
    professorStyles: exam.professor_styles,
    availableMinutesPerDay: exam.available_minutes_per_day,
  };
}

async function fetchExam(
  supabase: SupabaseClient,
  examId: string,
): Promise<ExamRow> {
  const { data, error } = await supabase
    .from("exams")
    .select("*")
    .eq("id", examId)
    .single();

  if (error || !data) {
    throw new PipelineError("Examen no encontrado", 404, "fetch_exam");
  }
  return data as ExamRow;
}

export async function detectPipelineStage(
  supabase: SupabaseClient,
  examId: string,
): Promise<PipelineStage> {
  const { data: sources } = await supabase
    .from("study_sources")
    .select("id, raw_text, storage_path, processing_status")
    .eq("exam_id", examId);

  for (const source of sources ?? []) {
    if (sourceNeedsStorageExtraction(source)) {
      return "chunk_sources";
    }
    if (isUsableRawText(source.raw_text)) {
      const { count } = await supabase
        .from("source_chunks")
        .select("id", { count: "exact", head: true })
        .eq("source_id", source.id);
      if (!count || count === 0) return "chunk_sources";
    }
  }

  const { count: topicCount } = await supabase
    .from("topics")
    .select("id", { count: "exact", head: true })
    .eq("exam_id", examId);
  if (!topicCount) return "analyze_sources";

  const { data: pendingPast } = await supabase
    .from("past_exams")
    .select("id")
    .eq("exam_id", examId)
    .is("ai_similarity_score", null)
    .limit(1);
  if (pendingPast && pendingPast.length > 0) return "analyze_past_exam";

  const { count: unitCount } = await supabase
    .from("study_units")
    .select("id", { count: "exact", head: true })
    .eq("exam_id", examId);
  if (!unitCount) return "generate_track";

  const { data: pendingLessons } = await supabase
    .from("lessons")
    .select("id")
    .eq("exam_id", examId)
    .is("content", null)
    .limit(1);
  if (pendingLessons && pendingLessons.length > 0) return "generate_lesson";

  const exam = await fetchExam(supabase, examId);
  if (exam.status !== "ready") return "calculate_readiness";

  return "completed";
}

async function getChunkTexts(
  supabase: SupabaseClient,
  examId: string,
): Promise<string[]> {
  const { data } = await supabase
    .from("source_chunks")
    .select("content")
    .eq("exam_id", examId)
    .order("chunk_index", { ascending: true });

  return (data ?? [])
    .map((c) => c.content)
    .filter((c): c is string => typeof c === "string" && !isCorruptChunk(c));
}

function exerciseCountForLessonType(lessonType: string | null): number {
  if (lessonType === "daily_challenge") {
    return EXERCISE_LIMITS.dailyChallenge.max;
  }
  if (lessonType === "mock_exam") {
    return EXERCISE_LIMITS.mockExam.min;
  }
  return EXERCISE_LIMITS.lesson.min;
}

async function findSourceNeedingChunks(
  supabase: SupabaseClient,
  examId: string,
) {
  const { data: sources } = await supabase
    .from("study_sources")
    .select("id, raw_text, storage_path, processing_status, created_at")
    .eq("exam_id", examId)
    .order("created_at", { ascending: true });

  for (const source of sources ?? []) {
    if (sourceNeedsStorageExtraction(source)) {
      return { source, needsStorage: true, allSources: sources ?? [] };
    }
    if (!isUsableRawText(source.raw_text)) continue;

    const { count } = await supabase
      .from("source_chunks")
      .select("id", { count: "exact", head: true })
      .eq("source_id", source.id);

    if (!count) {
      return { source, needsStorage: false, allSources: sources ?? [] };
    }
  }

  return { source: null, needsStorage: false, allSources: sources ?? [] };
}

async function stageChunkSources(
  supabase: SupabaseClient,
  examId: string,
): Promise<PipelineProgress> {
  const { source, needsStorage, allSources } =
    await findSourceNeedingChunks(supabase, examId);

  if (!source) {
    throw new PipelineError(
      "No hay material de estudio procesable. Subí archivos o pegá texto.",
      400,
      "chunk_sources",
    );
  }

  if (needsStorage) {
    await supabase
      .from("study_sources")
      .update({ processing_status: "error" })
      .eq("id", source.id);
    throw new PipelineError(
      "La extracción desde Storage aún no está implementada para esta fuente. Usá 'Pegar texto' o esperá al worker de archivos.",
      400,
      "chunk_sources",
    );
  }

  const text = resolveSourceText(source);
  if (!text) {
    throw new PipelineError(
      "No hay texto usable en el material subido.",
      400,
      "chunk_sources",
    );
  }

  const chunks = chunkText(text);
  if (chunks.length === 0) {
    throw new PipelineError(
      "El material es demasiado corto para procesar.",
      400,
      "chunk_sources",
    );
  }

  await supabase.from("source_chunks").delete().eq("source_id", source.id);

  const rows = chunks.map((content, index) => ({
    source_id: source.id,
    exam_id: examId,
    chunk_index: index,
    content,
    summary: null,
  }));

  const { error: insertError } = await supabase
    .from("source_chunks")
    .insert(rows);
  if (insertError) {
    throw new PipelineError(insertError.message, 500, "chunk_sources");
  }

  await supabase
    .from("study_sources")
    .update({ processing_status: "completed" })
    .eq("id", source.id);

  const hasMoreSources = allSources.some((s) => {
    if (s.id === source.id) return false;
    return isUsableRawText(s.raw_text) || sourceNeedsStorageExtraction(s);
  });

  const nextStage = await detectPipelineStage(supabase, examId);
  return {
    stage: nextStage === "completed" ? "chunk_sources" : nextStage,
    hasMore: hasMoreSources || nextStage !== "completed",
    examId,
    message: `Material fragmentado en ${chunks.length} chunks`,
  };
}

async function stageAnalyzeSources(
  supabase: SupabaseClient,
  exam: ExamRow,
): Promise<PipelineProgress> {
  const chunks = await getChunkTexts(supabase, exam.id);
  if (chunks.length === 0) {
    throw new PipelineError(
      "No se detectaron temas en tus materiales",
      400,
      "analyze_sources",
    );
  }

  const ctx = toExamContext(exam);
  const analysis = await runSourceAnalysis(ctx, chunks.slice(0, 12));

  if (!analysis.main_topics.length) {
    throw new PipelineError(
      "No se detectaron temas en tus materiales",
      400,
      "analyze_sources",
    );
  }

  await supabase.from("topics").delete().eq("exam_id", exam.id);

  const topicRows = analysis.main_topics.map((topic) => ({
    exam_id: exam.id,
    title: topic.title,
    summary: topic.summary,
    importance: topic.importance,
    difficulty: topic.difficulty,
    estimated_minutes: topic.estimated_minutes,
    source_references: topic.source_references,
    past_exam_frequency: 0,
    mastery_score: 0,
  }));

  const { error } = await supabase.from("topics").insert(topicRows);
  if (error) {
    throw new PipelineError(error.message, 500, "analyze_sources");
  }

  const nextStage = await detectPipelineStage(supabase, exam.id);
  return {
    stage: nextStage,
    hasMore: nextStage !== "completed",
    examId: exam.id,
    message: `${topicRows.length} temas detectados`,
  };
}

async function stageAnalyzePastExam(
  supabase: SupabaseClient,
  exam: ExamRow,
): Promise<PipelineProgress> {
  const { data: pastExam } = await supabase
    .from("past_exams")
    .select("*, study_sources:source_id(raw_text)")
    .eq("exam_id", exam.id)
    .is("ai_similarity_score", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!pastExam) {
    const nextStage = await detectPipelineStage(supabase, exam.id);
    return {
      stage: nextStage,
      hasMore: nextStage !== "completed",
      examId: exam.id,
    };
  }

  let pastExamText = "";
  const linkedSource = pastExam.study_sources as { raw_text?: string } | null;
  if (isUsableRawText(linkedSource?.raw_text)) {
    pastExamText = linkedSource!.raw_text!.trim();
  }

  if (!pastExamText) {
    await supabase
      .from("past_exams")
      .update({
        ai_similarity_score: pastExam.user_similarity_score ?? 5,
        final_relevance_score: pastExam.user_similarity_score ?? 5,
        analysis_summary: "Sin texto disponible para análisis automático.",
      })
      .eq("id", pastExam.id);

    const nextStage = await detectPipelineStage(supabase, exam.id);
    return {
      stage: nextStage,
      hasMore: nextStage !== "completed",
      examId: exam.id,
      message: "Examen anterior sin texto — se usó similitud del usuario",
    };
  }

  const ctx = toExamContext(exam);
  const analysis = await runPastExamAnalysis(ctx, {
    title: pastExam.title,
    pastExamText,
    userSimilarityScore: pastExam.user_similarity_score,
    userNotes: pastExam.user_notes,
    teacherMatch: pastExam.teacher_match,
    scopeMatch: pastExam.scope_match,
    formatMatch: pastExam.format_match,
    year: pastExam.year,
  });

  const subscores = normalizeSubscores(analysis.similarity_subscores);
  const aiScore =
    analysis.ai_similarity_score > 0
      ? analysis.ai_similarity_score
      : calculateAiSimilarityScore(subscores);
  const finalScore = calculateFinalRelevanceScore(
    pastExam.user_similarity_score ?? 5,
    aiScore,
  );

  await supabase
    .from("past_exams")
    .update({
      ai_similarity_score: aiScore,
      final_relevance_score: finalScore,
      analysis_summary: analysis.style_summary || analysis.final_relevance_reasoning,
    })
    .eq("id", pastExam.id);

  if (analysis.questions.length > 0) {
    await supabase
      .from("past_exam_questions")
      .delete()
      .eq("past_exam_id", pastExam.id);

    await supabase.from("past_exam_questions").insert(
      analysis.questions.map((q) => ({
        past_exam_id: pastExam.id,
        exam_id: exam.id,
        question_text: q.question_text,
        question_type: q.question_type,
        detected_topic_title: q.detected_topic_title,
        difficulty: q.difficulty,
        expected_answer: q.expected_answer,
      })),
    );
  }

  const nextStage = await detectPipelineStage(supabase, exam.id);
  return {
    stage: nextStage,
    hasMore: nextStage !== "completed",
    examId: exam.id,
    message: `Examen anterior analizado (similitud IA: ${aiScore}/10)`,
  };
}

async function stageGenerateTrack(
  supabase: SupabaseClient,
  exam: ExamRow,
): Promise<PipelineProgress> {
  const { data: topics } = await supabase
    .from("topics")
    .select(
      "id, title, summary, importance, difficulty, estimated_minutes, source_references",
    )
    .eq("exam_id", exam.id);

  if (!topics?.length) {
    throw new PipelineError(
      "No se detectaron temas en tus materiales",
      400,
      "generate_track",
    );
  }

  const { data: pastExams } = await supabase
    .from("past_exams")
    .select("analysis_summary, final_relevance_score")
    .eq("exam_id", exam.id);

  const pastSummaries = (pastExams ?? [])
    .map((p) => p.analysis_summary)
    .filter((s): s is string => Boolean(s));

  const ctx = toExamContext(exam);
  const track = await runTrackGeneration(
    ctx,
    topics.map((t) => ({
      title: t.title ?? "",
      summary: t.summary ?? "",
      importance: Number(t.importance) || 5,
      difficulty: Number(t.difficulty) || 5,
      estimated_minutes: t.estimated_minutes ?? 15,
      source_references: Array.isArray(t.source_references)
        ? (t.source_references as string[])
        : [],
    })),
    pastSummaries,
  );

  await supabase.from("lessons").delete().eq("exam_id", exam.id);
  await supabase.from("study_units").delete().eq("exam_id", exam.id);

  const topicTitleToId = new Map(
    (topics ?? []).map((t) => [t.title ?? "", t.id as string]),
  );

  let lessonCount = 0;

  for (const unit of track.units) {
    const { data: unitRow, error: unitError } = await supabase
      .from("study_units")
      .insert({
        exam_id: exam.id,
        title: unit.title,
        description: unit.description,
        order_index: unit.order_index,
        is_premium: unit.is_premium,
      })
      .select("id")
      .single();

    if (unitError || !unitRow) {
      throw new PipelineError(unitError?.message ?? "Error creando unidad", 500);
    }

    for (const lesson of unit.lessons) {
      await supabase.from("lessons").insert({
        exam_id: exam.id,
        unit_id: unitRow.id,
        topic_id: topicTitleToId.get(lesson.topic_title) ?? null,
        title: lesson.title,
        lesson_type: lesson.lesson_type,
        estimated_minutes: lesson.estimated_minutes,
        is_premium: lesson.is_premium,
        order_index: lesson.order_index,
        status: lesson.order_index === 1 && unit.order_index === 1 ? "available" : "locked",
        content: null,
        summary: null,
      });
      lessonCount++;
    }
  }

  const nextStage = await detectPipelineStage(supabase, exam.id);
  return {
    stage: nextStage,
    hasMore: nextStage !== "completed",
    examId: exam.id,
    lessonsTotal: lessonCount,
    lessonsCompleted: 0,
    message: `Track creado con ${track.units.length} unidades y ${lessonCount} lecciones`,
  };
}

async function stageGenerateLesson(
  supabase: SupabaseClient,
  exam: ExamRow,
): Promise<PipelineProgress> {
  const { data: lesson } = await supabase
    .from("lessons")
    .select("*, topics(title), study_units(order_index)")
    .eq("exam_id", exam.id)
    .is("content", null)
    .order("order_index", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!lesson) {
    const nextStage = await detectPipelineStage(supabase, exam.id);
    return {
      stage: nextStage,
      hasMore: nextStage !== "completed",
      examId: exam.id,
    };
  }

  const chunks = await getChunkTexts(supabase, exam.id);
  const topicTitle =
    (lesson.topics as { title?: string } | null)?.title ??
    lesson.title ??
    "Tema general";

  const content = await runLessonContentGeneration({
    subjectName: exam.subject_name,
    topicTitle,
    lessonTitle: lesson.title ?? "Lección",
    lessonType: lesson.lesson_type ?? "concept",
    sourceChunks: chunks.slice(0, 6),
    targetGrade: exam.target_grade,
  });

  const exerciseCount = exerciseCountForLessonType(lesson.lesson_type);
  let validExercises: ReturnType<typeof validateExercises>["valid"] = [];

  try {
    const generated = await runExerciseGeneration({
      lessonType: lesson.lesson_type ?? "concept",
      topicTitle,
      lessonTitle: content.title,
      sourceChunks: chunks.slice(0, 6),
      exerciseCount,
    });

    let { valid, rejected } = validateExercises(generated.exercises);

    if (valid.length === 0 && rejected.length > 0) {
      const retry = await runExerciseGeneration({
        lessonType: lesson.lesson_type ?? "concept",
        topicTitle,
        lessonTitle: content.title,
        sourceChunks: chunks.slice(0, 6),
        exerciseCount,
      });
      const retryResult = validateExercises(
        retry.exercises.map((ex) => {
          const sanitized = validateExerciseWithSanitize(ex);
          return sanitized.success ? sanitized.exercise : ex;
        }),
      );
      valid = retryResult.valid;
      rejected = retryResult.rejected;
    } else {
      valid = generated.exercises
        .map((ex) => validateExerciseWithSanitize(ex))
        .filter((r): r is { success: true; exercise: (typeof valid)[0] } => r.success)
        .map((r) => r.exercise);
    }

    validExercises = valid;
  } catch {
    validExercises = [];
  }

  await supabase
    .from("lessons")
    .update({
      title: content.title,
      summary: content.summary,
      content: content.content,
      status: lesson.status === "locked" ? "locked" : "available",
    })
    .eq("id", lesson.id);

  if (validExercises.length > 0) {
    const { data: existingQuiz } = await supabase
      .from("quizzes")
      .select("id")
      .eq("lesson_id", lesson.id)
      .maybeSingle();

    let quizId = existingQuiz?.id;
    if (!quizId) {
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .insert({
          exam_id: exam.id,
          lesson_id: lesson.id,
          unit_id: lesson.unit_id,
          title: `Quiz — ${content.title}`,
          quiz_type: "lesson",
          is_premium: lesson.is_premium,
        })
        .select("id")
        .single();
      if (quizError || !quiz) {
        throw new PipelineError(quizError?.message ?? "Error creando quiz", 500);
      }
      quizId = quiz.id;
    } else {
      await supabase.from("questions").delete().eq("quiz_id", quizId);
    }

    await supabase.from("questions").insert(
      validExercises.map((exercise) =>
        exerciseToQuestionRow(exercise, {
          examId: exam.id,
          quizId: quizId!,
          topicId: lesson.topic_id,
        }),
      ),
    );
  }

  const { count: totalLessons } = await supabase
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("exam_id", exam.id);

  const { count: completedLessons } = await supabase
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("exam_id", exam.id)
    .not("content", "is", null);

  const nextStage = await detectPipelineStage(supabase, exam.id);

  return {
    stage: nextStage,
    hasMore: nextStage !== "completed",
    examId: exam.id,
    lessonId: lesson.id,
    lessonTitle: content.title,
    lessonsTotal: totalLessons ?? 0,
    lessonsCompleted: completedLessons ?? 0,
    message: `Lección generada con ${validExercises.length} ejercicios válidos`,
  };
}

async function stageCalculateReadiness(
  supabase: SupabaseClient,
  exam: ExamRow,
): Promise<PipelineProgress> {
  const { count: totalLessons } = await supabase
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("exam_id", exam.id);

  const { count: topicCount } = await supabase
    .from("topics")
    .select("id", { count: "exact", head: true })
    .eq("exam_id", exam.id);

  const examDate = new Date(exam.exam_date);
  const daysUntilExam = Math.max(
    0,
    Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  const readiness = estimateInitialReadiness({
    declaredLevel: exam.current_level,
    topicsCount: topicCount ?? 0,
    lessonsCompleted: 0,
    totalLessons: totalLessons ?? 0,
    daysUntilExam,
  });

  await supabase
    .from("exams")
    .update({ readiness_score: readiness, status: "ready" })
    .eq("id", exam.id);

  return {
    stage: "completed",
    hasMore: false,
    examId: exam.id,
    message: `Análisis completado. Preparación inicial: ${readiness}%`,
  };
}

export async function startAnalysisPipeline(
  supabase: SupabaseClient,
  examId: string,
): Promise<PipelineProgress> {
  const exam = await fetchExam(supabase, examId);

  if (exam.status === "ready") {
    return {
      stage: "completed",
      hasMore: false,
      examId,
      message: "El examen ya está listo",
    };
  }

  await supabase
    .from("exams")
    .update({ status: "analyzing" })
    .eq("id", examId);

  const stage = await detectPipelineStage(supabase, examId);
  return {
    stage,
    hasMore: stage !== "completed",
    examId,
    message: "Análisis iniciado",
  };
}

export async function runNextPipelineStep(
  supabase: SupabaseClient,
  examId: string,
): Promise<PipelineProgress> {
  const exam = await fetchExam(supabase, examId);
  const stage = await detectPipelineStage(supabase, examId);

  if (stage === "completed") {
    return {
      stage: "completed",
      hasMore: false,
      examId,
      message: "Análisis completado",
    };
  }

  switch (stage) {
    case "chunk_sources":
      return stageChunkSources(supabase, examId);
    case "analyze_sources":
      return stageAnalyzeSources(supabase, exam);
    case "analyze_past_exam":
      return stageAnalyzePastExam(supabase, exam);
    case "generate_track":
      return stageGenerateTrack(supabase, exam);
    case "generate_lesson":
      return stageGenerateLesson(supabase, exam);
    case "calculate_readiness":
      return stageCalculateReadiness(supabase, exam);
    default:
      return {
        stage: "completed",
        hasMore: false,
        examId,
      };
  }
}
