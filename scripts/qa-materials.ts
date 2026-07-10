import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createClient } from "@supabase/supabase-js";

import { buildStudyMaterialStoragePath } from "../lib/storage/sanitize-key";

type PipelineProgress = {
  stage?: string;
  hasMore?: boolean;
  message?: string;
  lessonsTotal?: number;
  lessonsCompleted?: number;
};

function loadEnvFile(filename: string) {
  const filePath = resolve(process.cwd(), filename);
  if (!existsSync(filePath)) return;

  for (const line of readFileSync(filePath, "utf8").split("\n")) {
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
    process.env[key] ||= value;
  }
}

const sampleNotesPath = resolve(
  process.cwd(),
  "tests/fixtures/studytrack-sample-notes.txt",
);
const pastedTextPath = resolve(
  process.cwd(),
  "tests/fixtures/studytrack-pasted-text.txt",
);

function getArg(name: string) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

async function postPipelineStep(
  baseUrl: string,
  step: "start" | "next",
  examId: string,
  userId: string,
) {
  const response = await fetch(`${baseUrl}/api/analysis/${step}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ examId, userId }),
  });
  const body = (await response.json()) as PipelineProgress & { error?: string };

  if (!response.ok) {
    throw new Error(
      `/api/analysis/${step} failed (${response.status}): ${
        body.error ?? JSON.stringify(body)
      }`,
    );
  }

  return body;
}

async function main() {
  loadEnvFile(".env.local");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const baseUrl =
    getArg("--base-url") ?? process.env.STUDYTRACK_BASE_URL ?? "http://localhost:3000";
  const positionalPdf = process.argv[2]?.startsWith("--") ? undefined : process.argv[2];
  const parkinPdfPath =
    getArg("--pdf") ??
    positionalPdf ??
    resolve(process.cwd(), "Oferta y Demanda Agregada - Cap. 7 Parkin .pdf");
  if (!existsSync(parkinPdfPath)) {
    throw new Error(`PDF fixture not found: ${parkinPdfPath}`);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const runId = randomUUID();
  const email = `qa-materials-${runId}@studytrack.local`;
  const password = `Qa-${runId}-StudyTrack!`;
  const uploadedPaths: string[] = [];
  let userId: string | null = null;
  let examId: string | null = null;

  try {
    const { data: userData, error: userError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: "QA Materials" },
      });
    if (userError || !userData.user) {
      throw userError ?? new Error("No QA user returned");
    }
    userId = userData.user.id;

    await supabase.from("profiles").upsert({
      id: userId,
      email,
      full_name: "QA Materials",
      education_level: "Universidad",
      career: "Economía",
    });

    const { data: exam, error: examError } = await supabase
      .from("exams")
      .insert({
        user_id: userId,
        subject_name: `QA Materiales ${runId}`,
        exam_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
        target_grade: "8+",
        available_minutes_per_day: 60,
        unavailable_days: ["domingo"],
        current_level: "Sé algo",
        exam_types: ["Parcial", "Desarrollo"],
        professor_styles: ["Conceptual", "Definiciones"],
        status: "draft",
      })
      .select("id")
      .single();
    if (examError || !exam) throw examError ?? new Error("No exam returned");
    examId = exam.id;
    const activeExamId = exam.id;

    const sources = [
      {
        fileName: "Parkin — Oferta y Demanda Agregada, capítulo 7.pdf",
        fileType: "application/pdf",
        sourceKind: "pdf",
        body: readFileSync(parkinPdfPath),
      },
      {
        fileName: "resumen-macro.txt",
        fileType: "text/plain",
        sourceKind: "notes",
        body: readFileSync(sampleNotesPath),
      },
    ];

    for (const source of sources) {
      const storagePath = buildStudyMaterialStoragePath(
        userId,
        activeExamId,
        source.fileName,
      );
      const { error: uploadError } = await supabase.storage
        .from("study-materials")
        .upload(storagePath, source.body, {
          contentType: source.fileType,
          upsert: true,
        });
      if (uploadError) throw uploadError;
      uploadedPaths.push(storagePath);

      const { error: insertError } = await supabase.from("study_sources").insert({
        exam_id: examId,
        user_id: userId,
        file_name: source.fileName,
        file_type: source.fileType,
        storage_path: storagePath,
        source_kind: source.sourceKind,
        processing_status: "pending",
      });
      if (insertError) throw insertError;
    }

    const { data: pastedSource, error: pastedError } = await supabase
      .from("study_sources")
      .insert({
        exam_id: examId,
        user_id: userId,
        file_name: "texto-pegado",
        file_type: "text/plain",
        raw_text: readFileSync(pastedTextPath, "utf8"),
        source_kind: "pasted_text",
        processing_status: "pending",
      })
      .select("id")
      .single();
    if (pastedError || !pastedSource) {
      throw pastedError ?? new Error("No pasted source returned");
    }

    const { error: corruptChunkError } = await supabase
      .from("source_chunks")
      .insert({
        source_id: pastedSource.id,
        exam_id: examId,
        chunk_index: 0,
        content: "ERROR: simulated corrupt chunk",
        summary: null,
      });
    if (corruptChunkError) throw corruptChunkError;

    const started = await postPipelineStep(baseUrl, "start", activeExamId, userId);
    if (started.stage !== "chunk_sources") {
      throw new Error(`Expected chunk_sources, got ${started.stage}`);
    }

    const stepLog: PipelineProgress[] = [started];
    let current = started;
    for (let i = 0; i < 80 && current.hasMore; i++) {
      current = await postPipelineStep(baseUrl, "next", activeExamId, userId);
      stepLog.push(current);
    }

    if (current.hasMore) {
      throw new Error(
        `Pipeline did not finish within 80 steps. Last stage: ${current.stage}`,
      );
    }

    if (current.stage !== "completed") {
      throw new Error(`Expected completed, got ${current.stage}`);
    }

    const { data: chunkedSources, error: chunkError } = await supabase
      .from("study_sources")
      .select(
        "id, file_name, raw_text, processing_status, source_chunks(id, content)",
      )
      .eq("exam_id", activeExamId);
    if (chunkError) throw chunkError;

    const summary = (chunkedSources ?? []).map((source) => ({
      file_name: source.file_name,
      processing_status: source.processing_status,
      raw_text_chars: source.raw_text?.length ?? 0,
      chunks: Array.isArray(source.source_chunks) ? source.source_chunks.length : 0,
      corrupt_chunks: Array.isArray(source.source_chunks)
        ? source.source_chunks.filter(
            (chunk) =>
              typeof chunk.content !== "string" ||
              chunk.content.trim().startsWith("ERROR:") ||
              chunk.content.trim().length < 50,
          ).length
        : 0,
    }));

    const failed = summary.filter(
      (source) =>
        source.processing_status !== "completed" ||
        source.raw_text_chars < 50 ||
        source.chunks < 1 ||
        source.corrupt_chunks > 0,
    );
    if (failed.length > 0) {
      throw new Error(`Material QA failed: ${JSON.stringify(failed, null, 2)}`);
    }

    const { data: finalState, error: finalStateError } = await supabase
      .from("exams")
      .select(
        "id, status, readiness_score, topics(id), study_units(id), lessons(id, content), quizzes(id), questions(id)",
      )
      .eq("id", activeExamId)
      .single();
    if (finalStateError || !finalState) {
      throw finalStateError ?? new Error("No final exam state returned");
    }

    const topics = Array.isArray(finalState.topics) ? finalState.topics.length : 0;
    const units = Array.isArray(finalState.study_units)
      ? finalState.study_units.length
      : 0;
    const lessons = Array.isArray(finalState.lessons)
      ? finalState.lessons.length
      : 0;
    const readyLessons = Array.isArray(finalState.lessons)
      ? finalState.lessons.filter((lesson) => Boolean(lesson.content)).length
      : 0;
    const quizzes = Array.isArray(finalState.quizzes) ? finalState.quizzes.length : 0;
    const questions = Array.isArray(finalState.questions)
      ? finalState.questions.length
      : 0;

    const finalSummary = {
      status: finalState.status,
      readiness_score: finalState.readiness_score,
      topics,
      units,
      lessons,
      readyLessons,
      quizzes,
      questions,
    };

    if (
      finalState.status !== "ready" ||
      topics < 1 ||
      units < 1 ||
      lessons < 1 ||
      readyLessons !== lessons ||
      quizzes < 1 ||
      questions < 1
    ) {
      throw new Error(`Final QA failed: ${JSON.stringify(finalSummary, null, 2)}`);
    }

    console.log(
      JSON.stringify(
        {
          ok: true,
          baseUrl,
          finalStage: current.stage,
          steps: stepLog.map((step, index) => ({
            index,
            stage: step.stage,
            message: step.message,
            lessonsCompleted: step.lessonsCompleted,
            lessonsTotal: step.lessonsTotal,
          })),
          sources: summary,
          finalSummary,
        },
        null,
        2,
      ),
    );
  } finally {
    if (examId) {
      await supabase.from("exams").delete().eq("id", examId);
    }
    for (const storagePath of uploadedPaths) {
      await supabase.storage.from("study-materials").remove([storagePath]);
    }
    if (userId) {
      await supabase.auth.admin.deleteUser(userId);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
