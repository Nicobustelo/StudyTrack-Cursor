import { CHUNK_DEFAULTS } from "../constants";

export interface ChunkTextOptions {
  chunkSize?: number;
  overlap?: number;
  minChunkLength?: number;
}

/**
 * Divide texto largo en chunks con solapamiento — spec 19.1.
 */
export function chunkText(
  text: string,
  options: ChunkTextOptions = {},
): string[] {
  const chunkSize = options.chunkSize ?? CHUNK_DEFAULTS.chunkSize;
  const overlap = options.overlap ?? CHUNK_DEFAULTS.overlap;
  const minChunkLength =
    options.minChunkLength ?? CHUNK_DEFAULTS.minChunkLength;

  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];
  if (normalized.length <= chunkSize) {
    return normalized.length >= minChunkLength ? [normalized] : [];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    let end = Math.min(start + chunkSize, normalized.length);

    if (end < normalized.length) {
      const paragraphBreak = normalized.lastIndexOf("\n\n", end);
      if (paragraphBreak > start + chunkSize / 2) {
        end = paragraphBreak;
      } else {
        const lineBreak = normalized.lastIndexOf("\n", end);
        if (lineBreak > start + chunkSize / 2) {
          end = lineBreak;
        }
      }
    }

    const chunk = normalized.slice(start, end).trim();
    if (chunk) chunks.push(chunk);

    if (end >= normalized.length) break;
    start = Math.max(end - overlap, start + 1);
  }

  const valid = chunks.filter((c) => c.length >= minChunkLength);
  if (valid.length === 0 && normalized.length > 0) {
    return [normalized.slice(0, chunkSize)];
  }
  return valid;
}

/**
 * Detecta si un chunk almacenado es inválido/corrupto — spec 41.2.
 */
export function isCorruptChunk(content: string | null | undefined): boolean {
  if (!content) return true;
  const trimmed = content.trim();
  if (trimmed.startsWith("ERROR:")) return true;
  return trimmed.length < CHUNK_DEFAULTS.minChunkLength;
}
