import type { SupabaseClient } from "@supabase/supabase-js";

import { daysUntilExam } from "./constants";
import type { OnboardingMaterial, OnboardingState } from "./types";

function inferSourceKind(material: OnboardingMaterial): string {
  if (material.pastedText) return "pasted_text";
  if (material.fileType.startsWith("image/")) return "photo";
  if (material.fileType === "application/pdf") return "pdf";
  return "notes";
}

async function uploadMaterialFile(
  supabase: SupabaseClient,
  userId: string,
  examId: string,
  material: OnboardingMaterial,
): Promise<string | null> {
  if (!material.file) return null;

  const safeName = material.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${userId}/${examId}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from("study-materials")
    .upload(path, material.file, {
      contentType: material.fileType,
      upsert: false,
    });

  if (error) {
    throw new Error(`No pudimos subir ${material.fileName}: ${error.message}`);
  }

  return path;
}

export async function persistOnboardingData(
  supabase: SupabaseClient,
  userId: string,
  state: OnboardingState,
): Promise<string> {
  if (!state.subjectName?.trim() || !state.examDate) {
    throw new Error("Faltan datos obligatorios del examen.");
  }

  const daysLeft = daysUntilExam(state.examDate);
  const isEmergency = daysLeft < 3;

  await supabase
    .from("profiles")
    .update({
      age_range: state.ageRange ?? null,
      education_level: state.educationLevel ?? null,
      career: state.career ?? null,
    })
    .eq("id", userId);

  const { data: exam, error: examError } = await supabase
    .from("exams")
    .insert({
      user_id: userId,
      subject_name: state.subjectName.trim(),
      exam_date: state.examDate,
      target_grade: state.targetGrade ?? null,
      available_minutes_per_day: state.availableMinutesPerDay ?? null,
      unavailable_days:
        state.unavailableDays.length > 0 ? state.unavailableDays : null,
      current_level: state.currentLevel ?? null,
      exam_types: state.examTypes.length > 0 ? state.examTypes : null,
      professor_styles:
        state.professorStyles.length > 0 ? state.professorStyles : null,
      status: "analyzing",
      is_emergency_mode: isEmergency,
    })
    .select("id")
    .single();

  if (examError || !exam) {
    throw new Error(examError?.message ?? "No pudimos crear el examen.");
  }

  const examId = exam.id as string;

  for (const material of state.materials) {
    const storagePath = await uploadMaterialFile(
      supabase,
      userId,
      examId,
      material,
    );

    const { error: sourceError } = await supabase.from("study_sources").insert({
      exam_id: examId,
      user_id: userId,
      file_name: material.fileName,
      file_type: material.fileType,
      storage_path: storagePath,
      raw_text: material.pastedText ?? null,
      source_kind: inferSourceKind(material),
      processing_status: "pending",
    });

    if (sourceError) {
      throw new Error(
        `No pudimos guardar el material ${material.fileName}: ${sourceError.message}`,
      );
    }
  }

  for (const pastExam of state.pastExams) {
    let storagePath: string | null = null;
    const rawText: string | null = pastExam.pastedText ?? null;

    if (pastExam.file) {
      const safeName = pastExam.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${userId}/${examId}/past-exams/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("study-materials")
        .upload(path, pastExam.file, {
          contentType: pastExam.fileType,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(
          `No pudimos subir ${pastExam.fileName}: ${uploadError.message}`,
        );
      }
      storagePath = path;
    }

    let sourceId: string | null = null;

    if (storagePath || rawText) {
      const { data: source, error: sourceError } = await supabase
        .from("study_sources")
        .insert({
          exam_id: examId,
          user_id: userId,
          file_name: pastExam.fileName,
          file_type: pastExam.fileType,
          storage_path: storagePath,
          raw_text: rawText,
          source_kind: rawText && !storagePath ? "pasted_text" : "pdf",
          processing_status: "pending",
        })
        .select("id")
        .single();

      if (sourceError || !source) {
        throw new Error(
          sourceError?.message ?? "No pudimos guardar el examen anterior.",
        );
      }
      sourceId = source.id as string;
    }

    const { error: pastError } = await supabase.from("past_exams").insert({
      exam_id: examId,
      source_id: sourceId,
      title: pastExam.metadata.title,
      past_exam_kind: pastExam.metadata.pastExamKind,
      teacher_match: pastExam.metadata.teacherMatch,
      scope_match: pastExam.metadata.scopeMatch,
      format_match: pastExam.metadata.formatMatch,
      year: pastExam.metadata.year ?? null,
      difficulty_perceived: pastExam.metadata.difficultyPerceived,
      user_similarity_score: pastExam.metadata.userSimilarityScore,
      user_notes: pastExam.metadata.userNotes ?? null,
    });

    if (pastError) {
      throw new Error(pastError.message);
    }
  }

  return examId;
}
