import type { SupabaseClient } from "@supabase/supabase-js";

import { CHUNK_DEFAULTS } from "../constants";

export interface StudySourceTextInput {
  raw_text?: string | null;
  storage_path?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  processing_status?: string | null;
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
 * Fuente que ya falló extracción y no tiene raw_text usable.
 * Debe saltarse para no reintentar en bucle (errores de producción).
 */
export function isUnrecoverableFailedSource(
  source: StudySourceTextInput,
): boolean {
  return source.processing_status === "error" && !isUsableRawText(source.raw_text);
}

/**
 * Indica si hay que ir a Storage para obtener el texto (upload con archivo).
 */
export function sourceNeedsStorageExtraction(
  source: StudySourceTextInput,
): boolean {
  if (isUnrecoverableFailedSource(source)) return false;
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
  const name =
    source.file_name?.toLowerCase() ?? source.storage_path?.toLowerCase() ?? "";

  // Prefer extension when MIME is missing/generic — browsers often send octet-stream.
  if (
    !explicitType ||
    explicitType === "application/octet-stream" ||
    explicitType === "binary/octet-stream"
  ) {
    if (name.endsWith(".pdf")) return "application/pdf";
    if (name.endsWith(".md") || name.endsWith(".markdown")) return "text/markdown";
    if (name.endsWith(".txt")) return "text/plain";
  }

  if (explicitType) return explicitType;

  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".md") || name.endsWith(".markdown")) return "text/markdown";
  if (name.endsWith(".txt")) return "text/plain";
  return "application/octet-stream";
}

export function humanizeExtractionError(error: unknown): string {
  const raw =
    error instanceof Error ? error.message : "No pudimos leer este archivo.";
  const lower = raw.toLowerCase();

  if (
    lower.includes("bad xref") ||
    lower.includes("xref") ||
    lower.includes("invalid pdf") ||
    lower.includes("formaterror") ||
    lower.includes("password") ||
    lower.includes("encrypted")
  ) {
    return "Este PDF está dañado, protegido o es solo imagen. Exportalo de nuevo con texto seleccionable o pegá el contenido manualmente.";
  }

  if (lower.includes("tipo de archivo no soportado")) {
    return "Tipo de archivo no soportado para extracción automática. Pegá el texto manualmente o subí un PDF/TXT.";
  }

  if (lower.includes("no se pudo descargar") || lower.includes("storage")) {
    return "No pudimos descargar el archivo subido. Reintentá o pegá el texto manualmente.";
  }

  return raw;
}

async function extractTextFromPdfBuffer(buffer: Buffer) {
  const pdfParseModule = await import("pdf-parse/lib/pdf-parse.js");
  const pdfParse = pdfParseModule.default;
  const maxPages = Number(process.env.PDF_MAX_PAGES_PER_FILE ?? 120);
  try {
    const result = await pdfParse(buffer, {
      max: Number.isFinite(maxPages) && maxPages > 0 ? maxPages : undefined,
    });
    const text = normalizeExtractedText(result.text ?? "");
    if (!text || text.length < CHUNK_DEFAULTS.minChunkLength) {
      throw new Error(
        "Este PDF no tiene texto seleccionable (puede ser un escaneo). Pegá el contenido manualmente o usá un PDF con texto.",
      );
    }
    return text;
  } catch (error) {
    throw new Error(humanizeExtractionError(error));
  }
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
