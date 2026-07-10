export class ModelJsonParseError extends Error {
  constructor(
    message: string,
    public readonly rawText?: string,
  ) {
    super(message);
    this.name = "ModelJsonParseError";
  }
}

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/**
 * Extrae el primer objeto o array JSON balanceado desde `start`.
 */
function extractBalancedJson(
  text: string,
  start: number,
  openChar: "{" | "[",
): string | null {
  const closeChar = openChar === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === openChar) {
      depth++;
    } else if (ch === closeChar) {
      depth--;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  return null;
}

function tryParseJson(candidate: string): unknown | null {
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

/**
 * Parser tolerante de JSON devuelto por el modelo — spec 41.1.
 * 1. JSON.parse directo
 * 2. Bloque fenced ```json
 * 3. Primer objeto `{...}` o array `[...]` balanceado
 */
export function parseModelJson(text: string): unknown {
  const trimmed = stripBom(text.trim());
  if (!trimmed) {
    throw new ModelJsonParseError(
      "El modelo devolvió una respuesta vacía. Reintentá en unos segundos.",
      text,
    );
  }

  const direct = tryParseJson(trimmed);
  if (direct !== null) return direct;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    const parsed = tryParseJson(fenced[1].trim());
    if (parsed !== null) return parsed;
  }

  const objectStart = trimmed.search(/[{[]/);
  if (objectStart !== -1) {
    const openChar = trimmed[objectStart] as "{" | "[";
    const balanced = extractBalancedJson(trimmed, objectStart, openChar);
    if (balanced) {
      const parsed = tryParseJson(balanced);
      if (parsed !== null) return parsed;
    }
  }

  throw new ModelJsonParseError(
    "No pudimos interpretar la respuesta del modelo. Reintentá en unos segundos.",
    text.slice(0, 500),
  );
}

export interface JsonRetryOptions<T> {
  /** Reintentos adicionales ante JSON inválido (default 2 → 3 intentos totales). */
  maxRetries?: number;
  validate?: (parsed: unknown) => T;
  onRetry?: (attempt: number, error: unknown) => void;
}

/**
 * Ejecuta una llamada al modelo y parsea JSON con reintentos — spec 41.1.
 */
export async function callModelWithJsonRetry<T>(
  call: (attempt: number) => Promise<string>,
  options: JsonRetryOptions<T> = {},
): Promise<T> {
  const maxRetries = options.maxRetries ?? 2;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const raw = await call(attempt);
      const parsed = parseModelJson(raw);
      if (options.validate) {
        return options.validate(parsed);
      }
      return parsed as T;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        options.onRetry?.(attempt + 1, error);
      }
    }
  }

  throw lastError;
}
