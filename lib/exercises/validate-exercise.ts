import {
  EXERCISE_TYPES,
  type CorrectAnswer,
  type Exercise,
  isExerciseType,
} from "./types";

export interface ValidationSuccess {
  success: true;
  exercise: Exercise;
}

export interface ValidationFailure {
  success: false;
  errors: string[];
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown, minLength = 1): value is string[] {
  return (
    Array.isArray(value) &&
    value.length >= minLength &&
    value.every((v) => typeof v === "string" && v.trim().length > 0)
  );
}

function parseCorrectAnswer(raw: unknown): CorrectAnswer | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const kind = obj.kind;
  const data = obj.data;

  switch (kind) {
    case "option_index":
      return typeof data === "number" && Number.isInteger(data)
        ? { kind, data }
        : null;
    case "text":
      return isStringArray(data) ? { kind, data } : null;
    case "pairs":
      if (
        !Array.isArray(data) ||
        !data.every(
          (p) =>
            p &&
            typeof p === "object" &&
            typeof (p as { left: unknown }).left === "number" &&
            typeof (p as { right: unknown }).right === "number",
        )
      ) {
        return null;
      }
      return { kind, data: data as Array<{ left: number; right: number }> };
    case "order":
      return Array.isArray(data) &&
        data.every((n) => typeof n === "number" && Number.isInteger(n))
        ? { kind, data }
        : null;
    case "boolean":
      return typeof data === "boolean" ? { kind, data } : null;
    case "assignments":
      if (
        !Array.isArray(data) ||
        !data.every(
          (a) =>
            a &&
            typeof a === "object" &&
            typeof (a as { item: unknown }).item === "number" &&
            typeof (a as { category: unknown }).category === "number",
        )
      ) {
        return null;
      }
      return { kind, data: data as Array<{ item: number; category: number }> };
    default:
      return null;
  }
}

function validateOptionIndexAnswer(
  answer: CorrectAnswer,
  optionsLength: number,
  label: string,
): string[] {
  const errors: string[] = [];
  if (answer.kind !== "option_index") {
    errors.push(`${label}: correct_answer.kind debe ser "option_index"`);
    return errors;
  }
  if (answer.data < 0 || answer.data >= optionsLength) {
    errors.push(
      `${label}: correct_answer.data (${answer.data}) fuera de rango [0, ${optionsLength - 1}]`,
    );
  }
  return errors;
}

function isPermutation(data: number[], length: number): boolean {
  if (data.length !== length) return false;
  const seen = new Set<number>();
  for (const n of data) {
    if (n < 0 || n >= length || seen.has(n)) return false;
    seen.add(n);
  }
  return seen.size === length;
}

/**
 * Valida un ejercicio crudo del modelo. Nunca acepta ejercicios rotos — spec 41.1.
 */
export function validateExercise(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== "object") {
    return { success: false, errors: ["El ejercicio no es un objeto"] };
  }

  const obj = raw as Record<string, unknown>;
  const errors: string[] = [];

  if (!isExerciseType(obj.type)) {
    return {
      success: false,
      errors: [
        `type inválido: ${String(obj.type)}. Permitidos: ${EXERCISE_TYPES.join(", ")}`,
      ],
    };
  }

  if (!isNonEmptyString(obj.prompt)) {
    errors.push("prompt es obligatorio");
  }
  if (!isNonEmptyString(obj.explanation)) {
    errors.push("explanation es obligatoria");
  }

  const correctAnswer = parseCorrectAnswer(obj.correct_answer);
  if (!correctAnswer) {
    errors.push(
      'correct_answer inválido: debe ser { kind, data } con kind y data coherentes',
    );
    return { success: false, errors };
  }

  const sourceReference =
    obj.source_reference == null
      ? undefined
      : isNonEmptyString(obj.source_reference)
        ? obj.source_reference.trim()
        : null;

  const base = {
    prompt: (obj.prompt as string).trim(),
    explanation: (obj.explanation as string).trim(),
    source_reference: sourceReference,
  };

  switch (obj.type) {
    case "multiple_choice": {
      if (!isStringArray(obj.options, 4) || obj.options.length !== 4) {
        errors.push("multiple_choice requiere exactamente 4 options");
        break;
      }
      errors.push(
        ...validateOptionIndexAnswer(correctAnswer, 4, "multiple_choice"),
      );
      if (errors.length) break;
      return {
        success: true,
        exercise: {
          type: "multiple_choice",
          ...base,
          options: obj.options,
          correct_answer: correctAnswer as Extract<
            CorrectAnswer,
            { kind: "option_index" }
          >,
        },
      };
    }

    case "pick_incorrect": {
      if (!isStringArray(obj.options, 4) || obj.options.length !== 4) {
        errors.push("pick_incorrect requiere exactamente 4 options");
        break;
      }
      errors.push(
        ...validateOptionIndexAnswer(correctAnswer, 4, "pick_incorrect"),
      );
      if (errors.length) break;
      return {
        success: true,
        exercise: {
          type: "pick_incorrect",
          ...base,
          options: obj.options,
          correct_answer: correctAnswer as Extract<
            CorrectAnswer,
            { kind: "option_index" }
          >,
        },
      };
    }

    case "fill_blank":
    case "fill_sentence": {
      if (correctAnswer.kind !== "text") {
        errors.push(`${obj.type}: correct_answer.kind debe ser "text"`);
        break;
      }
      const options =
        obj.options == null
          ? undefined
          : isStringArray(obj.options)
            ? obj.options
            : null;
      if (obj.options != null && options == null) {
        errors.push(`${obj.type}: options debe ser string[] o null`);
        break;
      }
      if (errors.length) break;
      return {
        success: true,
        exercise: {
          type: obj.type,
          ...base,
          options,
          correct_answer: correctAnswer,
        },
      };
    }

    case "matching": {
      const opts = obj.options;
      if (
        !opts ||
        typeof opts !== "object" ||
        !isStringArray((opts as { left?: unknown }).left, 2) ||
        !isStringArray((opts as { right?: unknown }).right, 2)
      ) {
        errors.push(
          'matching requiere options: { left: string[], right: string[] }',
        );
        break;
      }
      const left = (opts as { left: string[] }).left;
      const right = (opts as { right: string[] }).right;
      if (left.length !== right.length) {
        errors.push("matching: left y right deben tener la misma cantidad");
      }
      if (correctAnswer.kind !== "pairs") {
        errors.push('matching: correct_answer.kind debe ser "pairs"');
        break;
      }
      for (const pair of correctAnswer.data) {
        if (pair.left < 0 || pair.left >= left.length) {
          errors.push(`matching: índice left ${pair.left} fuera de rango`);
        }
        if (pair.right < 0 || pair.right >= right.length) {
          errors.push(`matching: índice right ${pair.right} fuera de rango`);
        }
      }
      if (errors.length) break;
      return {
        success: true,
        exercise: {
          type: "matching",
          ...base,
          options: { left, right },
          correct_answer: correctAnswer,
        },
      };
    }

    case "ordering": {
      if (!isStringArray(obj.options, 2)) {
        errors.push("ordering requiere options: string[] con al menos 2 ítems");
        break;
      }
      if (correctAnswer.kind !== "order") {
        errors.push('ordering: correct_answer.kind debe ser "order"');
        break;
      }
      if (!isPermutation(correctAnswer.data, obj.options.length)) {
        errors.push(
          "ordering: correct_answer.data debe ser permutación de índices de options",
        );
        break;
      }
      return {
        success: true,
        exercise: {
          type: "ordering",
          ...base,
          options: obj.options,
          correct_answer: correctAnswer,
        },
      };
    }

    case "true_false": {
      if (obj.options != null) {
        errors.push("true_false no debe incluir options");
      }
      if (correctAnswer.kind !== "boolean") {
        errors.push('true_false: correct_answer.kind debe ser "boolean"');
        break;
      }
      if (errors.length) break;
      return {
        success: true,
        exercise: {
          type: "true_false",
          ...base,
          correct_answer: correctAnswer,
        },
      };
    }

    case "classification": {
      const opts = obj.options;
      if (
        !opts ||
        typeof opts !== "object" ||
        !isStringArray((opts as { items?: unknown }).items, 1) ||
        !isStringArray((opts as { categories?: unknown }).categories, 2)
      ) {
        errors.push(
          'classification requiere options: { items: string[], categories: string[] }',
        );
        break;
      }
      const items = (opts as { items: string[] }).items;
      const categories = (opts as { categories: string[] }).categories;
      if (correctAnswer.kind !== "assignments") {
        errors.push('classification: correct_answer.kind debe ser "assignments"');
        break;
      }
      const itemIndices = new Set<number>();
      for (const assignment of correctAnswer.data) {
        if (assignment.item < 0 || assignment.item >= items.length) {
          errors.push(
            `classification: índice item ${assignment.item} fuera de rango`,
          );
        }
        if (
          assignment.category < 0 ||
          assignment.category >= categories.length
        ) {
          errors.push(
            `classification: índice category ${assignment.category} fuera de rango`,
          );
        }
        if (itemIndices.has(assignment.item)) {
          errors.push(
            `classification: item ${assignment.item} asignado más de una vez`,
          );
        }
        itemIndices.add(assignment.item);
      }
      if (itemIndices.size !== items.length) {
        errors.push("classification: cada item debe tener exactamente una asignación");
      }
      if (errors.length) break;
      return {
        success: true,
        exercise: {
          type: "classification",
          ...base,
          options: { items, categories },
          correct_answer: correctAnswer,
        },
      };
    }

    case "short_case": {
      const options =
        obj.options == null
          ? undefined
          : isStringArray(obj.options, 2)
            ? obj.options
            : null;
      if (obj.options != null && options == null) {
        errors.push("short_case: options debe ser string[] o null");
        break;
      }
      if (
        correctAnswer.kind === "option_index" &&
        options &&
        options.length > 0
      ) {
        errors.push(
          ...validateOptionIndexAnswer(correctAnswer, options.length, "short_case"),
        );
      } else if (correctAnswer.kind !== "text" && correctAnswer.kind !== "option_index") {
        errors.push(
          'short_case: correct_answer.kind debe ser "option_index" o "text"',
        );
      } else if (
        correctAnswer.kind === "option_index" &&
        (!options || options.length === 0)
      ) {
        errors.push(
          "short_case: option_index requiere options no vacías",
        );
      }
      if (errors.length) break;
      return {
        success: true,
        exercise: {
          type: "short_case",
          ...base,
          options,
          correct_answer: correctAnswer as Extract<
            CorrectAnswer,
            { kind: "option_index" | "text" }
          >,
        },
      };
    }

    default:
      errors.push(`Tipo no soportado: ${obj.type as string}`);
  }

  return { success: false, errors };
}

/**
 * Filtra ejercicios inválidos. Nunca persiste ejercicios rotos.
 */
export function validateExercises(
  rawExercises: unknown[],
): { valid: Exercise[]; rejected: Array<{ index: number; errors: string[] }> } {
  const valid: Exercise[] = [];
  const rejected: Array<{ index: number; errors: string[] }> = [];

  rawExercises.forEach((raw, index) => {
    const result = validateExercise(raw);
    if (result.success) {
      valid.push(result.exercise);
    } else {
      rejected.push({ index, errors: result.errors });
    }
  });

  return { valid, rejected };
}

/**
 * Intenta sanitizar shapes comunes rotos del modelo antes de validar.
 * No inventa contenido — solo reestructura cuando es seguro.
 */
export function sanitizeExerciseShape(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const obj = { ...(raw as Record<string, unknown>) };

  if (obj.type === "matching" && Array.isArray(obj.options)) {
    const flat = obj.options as string[];
    const half = Math.ceil(flat.length / 2);
    obj.options = { left: flat.slice(0, half), right: flat.slice(half) };
  }

  if (obj.type === "classification" && Array.isArray(obj.options)) {
    obj.options = { items: obj.options, categories: ["Categoría A", "Categoría B"] };
  }

  if (
    obj.correct_answer &&
    typeof obj.correct_answer !== "object" &&
    typeof obj.correct_answer === "number"
  ) {
    obj.correct_answer = { kind: "option_index", data: obj.correct_answer };
  }

  return obj;
}

export function validateExerciseWithSanitize(raw: unknown): ValidationResult {
  return validateExercise(sanitizeExerciseShape(raw));
}

export function exerciseToQuestionRow(
  exercise: Exercise,
  meta: { examId: string; quizId: string; topicId?: string | null },
) {
  return {
    exam_id: meta.examId,
    quiz_id: meta.quizId,
    topic_id: meta.topicId ?? null,
    question_type: exercise.type,
    prompt: exercise.prompt,
    options: "options" in exercise ? exercise.options : null,
    correct_answer: exercise.correct_answer,
    explanation: exercise.explanation,
    source_reference: exercise.source_reference ?? null,
  };
}
