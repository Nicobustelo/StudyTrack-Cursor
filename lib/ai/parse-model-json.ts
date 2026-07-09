export class ModelJsonParseError extends Error {
  constructor(
    message: string,
    public readonly rawText?: string,
  ) {
    super(message);
    this.name = "ModelJsonParseError";
  }
}

/**
 * Extrae el primer objeto JSON balanceado `{...}` desde `start`.
 */
function extractBalancedObject(text: string, start: number): string | null {
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

    if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  return null;
}

/**
 * Parser tolerante de JSON devuelto por el modelo — spec 41.1.
 * 1. JSON.parse directo
 * 2. Bloque fenced ```json
 * 3. Primer objeto `{...}` balanceado
 */
export function parseModelJson(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new ModelJsonParseError("Respuesta vacía del modelo", text);
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    // continuar
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {
      // continuar
    }
  }

  const objectStart = trimmed.indexOf("{");
  if (objectStart !== -1) {
    const balanced = extractBalancedObject(trimmed, objectStart);
    if (balanced) {
      try {
        return JSON.parse(balanced);
      } catch {
        // continuar
      }
    }
  }

  throw new ModelJsonParseError(
    "No se pudo parsear JSON del modelo",
    text.slice(0, 500),
  );
}

export interface JsonRetryOptions<T> {
  /** Reintentos adicionales ante JSON inválido (default 1 → 2 intentos totales). */
  maxRetries?: number;
  validate?: (parsed: unknown) => T;
  onRetry?: (attempt: number, error: unknown) => void;
}

/**
 * Ejecuta una llamada al modelo y parsea JSON con al menos 1 reintento — spec 41.1.
 */
export async function callModelWithJsonRetry<T>(
  call: () => Promise<string>,
  options: JsonRetryOptions<T> = {},
): Promise<T> {
  const maxRetries = options.maxRetries ?? 1;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const raw = await call();
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
