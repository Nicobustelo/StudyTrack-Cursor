import type { SupabaseClient } from "@supabase/supabase-js";

import { CHUNK_DEFAULTS } from "../constants";

export interface StudySourceTextInput {
  raw_text?: string | null;
  storage_path?: string | null;
  file_name?: string | null;
  file_type?: string | null;
}

/**
 * Extrae texto usable desde raw_text pegado — spec 41.2.
 * No exige storage_path.
 */
export function extractTextFromRawText(
  rawText: string | null | undefined,
): string {
  return normalizeExtractedText(rawText ?? "");
}

export function isUsableRawText(rawText: string | null | undefined): boolean {
  const text = extractTextFromRawText(rawText);
  if (!text) return false;
  if (text.startsWith("ERROR:")) return false;
  return text.length >= CHUNK_DEFAULTS.minChunkLength;
}

/**
 * Indica si hay que ir a Storage para obtener el texto (upload con archivo).
 */
export function sourceNeedsStorageExtraction(
  source: StudySourceTextInput,
): boolean {
  if (!source.storage_path?.trim()) return false;
  return !isUsableRawText(source.raw_text);
}

/**
 * Resuelve el texto de una fuente priorizando raw_text — spec 41.2.
 * storage_path solo se usa si no hay raw_text usable (workers posteriores).
 */
export function resolveSourceText(source: StudySourceTextInput): string | null {
  if (isUsableRawText(source.raw_text)) {
    return extractTextFromRawText(source.raw_text);
  }
  return null;
}

function normalizeExtractedText(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

function inferFileType(source: StudySourceTextInput) {
  const explicitType = source.file_type?.toLowerCase() ?? "";
  if (explicitType) return explicitType;

  const name = source.file_name?.toLowerCase() ?? source.storage_path?.toLowerCase() ?? "";
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".md") || name.endsWith(".markdown")) return "text/markdown";
  if (name.endsWith(".txt")) return "text/plain";
  return "application/octet-stream";
}

async function extractTextFromPdfBuffer(buffer: Buffer) {
  const pdfParseModule = await import("pdf-parse/lib/pdf-parse.js");
  const pdfParse = pdfParseModule.default;
  const maxPages = Number(process.env.PDF_MAX_PAGES_PER_FILE ?? 120);
  const result = await pdfParse(buffer, {
    max: Number.isFinite(maxPages) && maxPages > 0 ? maxPages : undefined,
  });
  return normalizeExtractedText(result.text ?? "");
}

/**
 * Descarga una fuente privada de Supabase Storage y extrae texto para el pipeline.
 * Nunca escribe mensajes de error en raw_text: el caller decide el processing_status.
 */
export async function extractTextFromStorageSource(
  supabase: SupabaseClient,
  source: StudySourceTextInput,
) {
  if (!source.storage_path?.trim()) return null;

  const { data, error } = await supabase.storage
    .from("study-materials")
    .download(source.storage_path);

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo descargar el archivo subido.");
  }

  const arrayBuffer = await data.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileType = inferFileType(source);

  if (fileType.includes("pdf")) {
    return extractTextFromPdfBuffer(buffer);
  }

  if (
    fileType.startsWith("text/") ||
    fileType.includes("markdown") ||
    fileType.includes("json")
  ) {
    return normalizeExtractedText(buffer.toString("utf8"));
  }

  throw new Error(
    "Tipo de archivo no soportado para extracción automática. Pegá el texto manualmente o subí un PDF/TXT.",
  );
}
