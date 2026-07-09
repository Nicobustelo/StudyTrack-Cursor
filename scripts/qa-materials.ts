import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createClient } from "@supabase/supabase-js";

type PipelineProgress = {
  stage?: string;
  hasMore?: boolean;
  message?: string;
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

function makeSyntheticPdf(text: string) {
  const escapePdfText = (value: string) =>
    value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const stream = `BT /F1 18 Tf 72 720 Td (${escapePdfText(text)}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += `${offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n `).join("\n")}\n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  return Buffer.from(pdf);
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
        fileName: "parkin-oferta-demanda.pdf",
        fileType: "application/pdf",
        sourceKind: "pdf",
        body: readFileSync(parkinPdfPath),
      },
      {
        fileName: "economia-sintetico.pdf",
        fileType: "application/pdf",
        sourceKind: "pdf",
        body: makeSyntheticPdf(
          "Oferta agregada demanda agregada PIB real nivel de precios equilibrio macroeconomico politica fiscal politica monetaria consumo inversion exportaciones importaciones expectativas salarios costos productividad.",
        ),
      },
      {
        fileName: "resumen-macro.txt",
        fileType: "text/plain",
        sourceKind: "notes",
        body: readFileSync(sampleNotesPath),
      },
    ];

    for (const source of sources) {
      const storagePath = `${userId}/${activeExamId}/${source.fileName}`;
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

    const { error: pastedError } = await supabase.from("study_sources").insert({
      exam_id: examId,
      user_id: userId,
      file_name: "texto-pegado",
      file_type: "text/plain",
      raw_text: readFileSync(pastedTextPath, "utf8"),
      source_kind: "pasted_text",
      processing_status: "pending",
    });
    if (pastedError) throw pastedError;

    const started = await postPipelineStep(baseUrl, "start", activeExamId, userId);
    if (started.stage !== "chunk_sources") {
      throw new Error(`Expected chunk_sources, got ${started.stage}`);
    }

    let finalStage: string | undefined = started.stage;
    for (let i = 0; i < 4; i++) {
      if (finalStage !== "chunk_sources") break;
      const progress = await postPipelineStep(baseUrl, "next", activeExamId, userId);
      finalStage = progress.stage;
    }

    if (finalStage === "chunk_sources") {
      throw new Error("Not all material sources were chunked");
    }

    const { data: chunkedSources, error: chunkError } = await supabase
      .from("study_sources")
      .select("id, file_name, raw_text, processing_status, source_chunks(id)")
      .eq("exam_id", activeExamId);
    if (chunkError) throw chunkError;

    const summary = (chunkedSources ?? []).map((source) => ({
      file_name: source.file_name,
      processing_status: source.processing_status,
      raw_text_chars: source.raw_text?.length ?? 0,
      chunks: Array.isArray(source.source_chunks) ? source.source_chunks.length : 0,
    }));

    const failed = summary.filter(
      (source) =>
        source.processing_status !== "completed" ||
        source.raw_text_chars < 50 ||
        source.chunks < 1,
    );
    if (failed.length > 0) {
      throw new Error(`Material QA failed: ${JSON.stringify(failed, null, 2)}`);
    }

    console.log(JSON.stringify({ ok: true, baseUrl, finalStage, summary }, null, 2));
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
