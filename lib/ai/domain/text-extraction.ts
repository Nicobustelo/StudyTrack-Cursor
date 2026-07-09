import { CHUNK_DEFAULTS } from "../constants";

export interface StudySourceTextInput {
  raw_text?: string | null;
  storage_path?: string | null;
}

/**
 * Extrae texto usable desde raw_text pegado — spec 41.2.
 * No exige storage_path.
 */
export function extractTextFromRawText(
  rawText: string | null | undefined,
): string {
  return (rawText ?? "").replace(/\r\n/g, "\n").trim();
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
