/**
 * Contratos compartidos de ejercicios — ÚNICA FUENTE DE VERDAD.
 *
 * Estos tipos definen el shape JSON exacto que comparten:
 *   - los prompts de IA (que copian los ejemplos JSON de este archivo),
 *   - el validador server-side (`validate-exercise.ts`),
 *   - el renderer de ejercicios (`ExerciseRenderer`),
 *   - el evaluador de respuestas.
 *
 * Regla histórica (spec 41.1): un mismatch entre el shape que pedía el prompt
 * y el que esperaba el renderer (matching/classification con `options` plano)
 * rompió el track en producción. NO cambiar un shape acá sin actualizar los
 * cuatro consumidores a la vez.
 *
 * Convenciones:
 *   - Todos los índices son 0-based y apuntan a los arrays de `options`.
 *   - `correct_answer` SIEMPRE es un wrapper `{ kind, data }` discriminado.
 *   - `explanation` es obligatoria en todos los tipos.
 *   - `source_reference` es la referencia al material del usuario (opcional).
 *   - Todo el contenido generado va en español.
 */

// ---------------------------------------------------------------------------
// Tipos de ejercicio (spec sección 12)
// ---------------------------------------------------------------------------

export const EXERCISE_TYPES = [
  "multiple_choice",
  "fill_blank",
  "fill_sentence",
  "matching",
  "ordering",
  "true_false",
  "pick_incorrect",
  "classification",
  "short_case",
] as const;

export type ExerciseType = (typeof EXERCISE_TYPES)[number];

export function isExerciseType(value: unknown): value is ExerciseType {
  return (
    typeof value === "string" &&
    (EXERCISE_TYPES as readonly string[]).includes(value)
  );
}

// ---------------------------------------------------------------------------
// Wrappers de correct_answer — SIEMPRE { kind, data }
// ---------------------------------------------------------------------------

/** Índice 0-based de la opción correcta dentro de `options`. */
export interface OptionIndexAnswer {
  kind: "option_index";
  data: number;
}

/**
 * Respuestas de texto aceptadas. `data` es un array no vacío; el primer
 * elemento es la respuesta canónica. El evaluador compara normalizando
 * (lowercase, sin acentos, trim). Si el ejercicio tiene `options`, la opción
 * elegida se compara como texto contra este mismo array.
 */
export interface TextAnswer {
  kind: "text";
  data: string[];
}

/** Pares correctos de matching: índices en `options.left` y `options.right`. */
export interface PairsAnswer {
  kind: "pairs";
  data: Array<{ left: number; right: number }>;
}

/**
 * Orden correcto: `data[i]` es el índice (en `options`) del ítem que va en la
 * posición `i`. Debe ser una permutación completa de `options`.
 */
export interface OrderAnswer {
  kind: "order";
  data: number[];
}

export interface BooleanAnswer {
  kind: "boolean";
  data: boolean;
}

/** Asignaciones de classification: índices en `options.items` y `options.categories`. */
export interface AssignmentsAnswer {
  kind: "assignments";
  data: Array<{ item: number; category: number }>;
}

export type CorrectAnswer =
  | OptionIndexAnswer
  | TextAnswer
  | PairsAnswer
  | OrderAnswer
  | BooleanAnswer
  | AssignmentsAnswer;

export type CorrectAnswerKind = CorrectAnswer["kind"];

// ---------------------------------------------------------------------------
// Base común
// ---------------------------------------------------------------------------

export interface ExerciseBase {
  type: ExerciseType;
  /** Enunciado/consigna del ejercicio. */
  prompt: string;
  /** Explicación pedagógica que se muestra después de responder. Obligatoria. */
  explanation: string;
  /** Referencia al material del usuario (ej: "Apunte U3, pág. 12"). Opcional. */
  source_reference?: string | null;
}

// ---------------------------------------------------------------------------
// 12.1 multiple_choice — 4 opciones, una correcta
// ---------------------------------------------------------------------------
/**
 * Ejemplo JSON (copiar tal cual en los prompts de IA):
 * {
 *   "type": "multiple_choice",
 *   "prompt": "¿Cuál es la derivada parcial respecto de x de f(x, y) = x²y?",
 *   "options": ["x²", "2xy", "2x", "y²"],
 *   "correct_answer": { "kind": "option_index", "data": 1 },
 *   "explanation": "Al derivar respecto de x, la variable y se trata como constante: ∂/∂x (x²y) = 2xy.",
 *   "source_reference": "Unidad 1: Derivadas parciales"
 * }
 */
export interface MultipleChoiceExercise extends ExerciseBase {
  type: "multiple_choice";
  /** Exactamente 4 opciones. */
  options: string[];
  correct_answer: OptionIndexAnswer;
}

// ---------------------------------------------------------------------------
// 12.2 fill_blank — frase con "____" y una palabra correcta
// ---------------------------------------------------------------------------
/**
 * Ejemplo JSON (copiar tal cual en los prompts de IA):
 * {
 *   "type": "fill_blank",
 *   "prompt": "Una función f(x, y) es continua en un punto si el ____ de la función en ese punto existe y coincide con el valor de la función.",
 *   "options": ["límite", "dominio", "gradiente", "máximo"],
 *   "correct_answer": { "kind": "text", "data": ["límite", "limite"] },
 *   "explanation": "La continuidad exige que el límite exista y coincida con el valor de la función en el punto.",
 *   "source_reference": "Unidad 1: Continuidad"
 * }
 *
 * `options` puede ser null/ausente: en ese caso el renderer muestra un
 * <input type="text"> y el evaluador compara contra `correct_answer.data`.
 */
export interface FillBlankExercise extends ExerciseBase {
  type: "fill_blank";
  /** Opciones para elegir. Si falta, el renderer usa input de texto libre. */
  options?: string[] | null;
  correct_answer: TextAnswer;
}

// ---------------------------------------------------------------------------
// 12.3 fill_sentence — texto incompleto con fragmento correcto
// ---------------------------------------------------------------------------
/**
 * Ejemplo JSON (copiar tal cual en los prompts de IA):
 * {
 *   "type": "fill_sentence",
 *   "prompt": "Para hallar los extremos de f sujeta a una restricción g(x, y) = 0 se usa ____.",
 *   "options": [
 *     "el método de multiplicadores de Lagrange",
 *     "la regla de la cadena",
 *     "el teorema de Green",
 *     "la integral doble"
 *   ],
 *   "correct_answer": { "kind": "text", "data": ["el método de multiplicadores de Lagrange"] },
 *   "explanation": "Los multiplicadores de Lagrange permiten optimizar con restricciones de igualdad.",
 *   "source_reference": "Unidad 4: Optimización con restricciones"
 * }
 *
 * Igual que fill_blank: sin `options`, el renderer cae a input de texto.
 */
export interface FillSentenceExercise extends ExerciseBase {
  type: "fill_sentence";
  /** Opciones para completar. Si falta, el renderer usa input de texto libre. */
  options?: string[] | null;
  correct_answer: TextAnswer;
}

// ---------------------------------------------------------------------------
// 12.4 matching — dos columnas, options SIEMPRE {left, right} (NUNCA array plano)
// ---------------------------------------------------------------------------
/**
 * Ejemplo JSON (copiar tal cual en los prompts de IA):
 * {
 *   "type": "matching",
 *   "prompt": "Uní cada concepto con su definición.",
 *   "options": {
 *     "left": ["Gradiente", "Matriz Hessiana", "Derivada direccional"],
 *     "right": [
 *       "Vector de derivadas parciales primeras",
 *       "Matriz de derivadas parciales segundas",
 *       "Tasa de cambio en una dirección dada"
 *     ]
 *   },
 *   "correct_answer": {
 *     "kind": "pairs",
 *     "data": [
 *       { "left": 0, "right": 0 },
 *       { "left": 1, "right": 1 },
 *       { "left": 2, "right": 2 }
 *     ]
 *   },
 *   "explanation": "El gradiente agrupa las derivadas primeras, la Hessiana las segundas y la derivada direccional mide el cambio en una dirección.",
 *   "source_reference": "Unidad 2: Derivadas"
 * }
 *
 * NOTA: `right` se muestra mezclado en la UI; los índices de `data` refieren
 * SIEMPRE al orden original de estos arrays.
 */
export interface MatchingExercise extends ExerciseBase {
  type: "matching";
  options: {
    left: string[];
    right: string[];
  };
  correct_answer: PairsAnswer;
}

// ---------------------------------------------------------------------------
// 12.5 ordering — ordenar pasos
// ---------------------------------------------------------------------------
/**
 * Ejemplo JSON (copiar tal cual en los prompts de IA):
 * {
 *   "type": "ordering",
 *   "prompt": "Ordená los pasos para encontrar y clasificar los extremos de una función de dos variables.",
 *   "options": [
 *     "Clasificar cada punto crítico según el signo del determinante",
 *     "Calcular las derivadas parciales primeras",
 *     "Igualar las derivadas a cero y hallar los puntos críticos",
 *     "Evaluar la matriz Hessiana en cada punto crítico"
 *   ],
 *   "correct_answer": { "kind": "order", "data": [1, 2, 3, 0] },
 *   "explanation": "Primero se derivan, luego se hallan los puntos críticos, se evalúa la Hessiana y por último se clasifica.",
 *   "source_reference": "Unidad 3: Extremos"
 * }
 *
 * `options` puede venir ya desordenado; `data[i]` = índice del ítem que
 * corresponde a la posición i del orden correcto.
 */
export interface OrderingExercise extends ExerciseBase {
  type: "ordering";
  options: string[];
  correct_answer: OrderAnswer;
}

// ---------------------------------------------------------------------------
// 12.6 true_false — afirmación con explicación obligatoria
// ---------------------------------------------------------------------------
/**
 * Ejemplo JSON (copiar tal cual en los prompts de IA):
 * {
 *   "type": "true_false",
 *   "prompt": "Si las derivadas parciales de f existen en un punto, entonces f es diferenciable en ese punto.",
 *   "correct_answer": { "kind": "boolean", "data": false },
 *   "explanation": "La existencia de derivadas parciales no garantiza diferenciabilidad; se necesita que el límite del cociente incremental total exista.",
 *   "source_reference": "Unidad 1: Diferenciabilidad"
 * }
 *
 * true_false NO lleva `options`: el renderer muestra botones fijos
 * Verdadero / Falso.
 */
export interface TrueFalseExercise extends ExerciseBase {
  type: "true_false";
  correct_answer: BooleanAnswer;
}

// ---------------------------------------------------------------------------
// 12.7 pick_incorrect — 4 afirmaciones, elegir la incorrecta
// ---------------------------------------------------------------------------
/**
 * Ejemplo JSON (copiar tal cual en los prompts de IA):
 * {
 *   "type": "pick_incorrect",
 *   "prompt": "¿Cuál de estas afirmaciones sobre el gradiente es INCORRECTA?",
 *   "options": [
 *     "El gradiente apunta en la dirección de máximo crecimiento",
 *     "El gradiente es perpendicular a las curvas de nivel",
 *     "El gradiente siempre apunta hacia el mínimo de la función",
 *     "La norma del gradiente mide la tasa máxima de cambio"
 *   ],
 *   "correct_answer": { "kind": "option_index", "data": 2 },
 *   "explanation": "El gradiente apunta hacia el máximo crecimiento, no hacia el mínimo (para eso se usa -∇f).",
 *   "source_reference": "Unidad 2: Gradiente"
 * }
 *
 * `correct_answer.data` es el índice de la afirmación INCORRECTA (la que el
 * usuario debe elegir).
 */
export interface PickIncorrectExercise extends ExerciseBase {
  type: "pick_incorrect";
  /** Exactamente 4 afirmaciones. */
  options: string[];
  correct_answer: OptionIndexAnswer;
}

// ---------------------------------------------------------------------------
// 12.8 classification — options SIEMPRE {items, categories} (NUNCA array plano)
// ---------------------------------------------------------------------------
/**
 * Ejemplo JSON (copiar tal cual en los prompts de IA):
 * {
 *   "type": "classification",
 *   "prompt": "Clasificá cada punto crítico según el criterio de la Hessiana.",
 *   "options": {
 *     "items": [
 *       "det(H) > 0 y fxx > 0",
 *       "det(H) > 0 y fxx < 0",
 *       "det(H) < 0"
 *     ],
 *     "categories": ["Mínimo local", "Máximo local", "Punto silla"]
 *   },
 *   "correct_answer": {
 *     "kind": "assignments",
 *     "data": [
 *       { "item": 0, "category": 0 },
 *       { "item": 1, "category": 1 },
 *       { "item": 2, "category": 2 }
 *     ]
 *   },
 *   "explanation": "El signo del determinante de la Hessiana y de fxx determina si el punto crítico es mínimo, máximo o silla.",
 *   "source_reference": "Unidad 3: Clasificación de puntos críticos"
 * }
 *
 * Cada ítem de `options.items` debe aparecer exactamente una vez en `data`.
 */
export interface ClassificationExercise extends ExerciseBase {
  type: "classification";
  options: {
    items: string[];
    categories: string[];
  };
  correct_answer: AssignmentsAnswer;
}

// ---------------------------------------------------------------------------
// 12.9 short_case — mini caso con pregunta
// ---------------------------------------------------------------------------
/**
 * Ejemplo JSON con opciones (copiar tal cual en los prompts de IA):
 * {
 *   "type": "short_case",
 *   "prompt": "Una empresa quiere minimizar el costo del material de una caja rectangular sin tapa con volumen fijo. ¿Qué técnica de Análisis Matemático 2 conviene usar?",
 *   "options": [
 *     "Multiplicadores de Lagrange",
 *     "Integrales dobles",
 *     "Regla de la cadena",
 *     "Series de Taylor"
 *   ],
 *   "correct_answer": { "kind": "option_index", "data": 0 },
 *   "explanation": "Es un problema de optimización con una restricción (el volumen fijo), el caso típico de multiplicadores de Lagrange.",
 *   "source_reference": "Unidad 4: Optimización"
 * }
 *
 * Variante sin opciones (respuesta de texto corto):
 * {
 *   "type": "short_case",
 *   "prompt": "Una chapa se calienta de forma no uniforme y T(x, y) da la temperatura. ¿Cómo se llama el vector que indica hacia dónde crece más rápido la temperatura?",
 *   "options": null,
 *   "correct_answer": { "kind": "text", "data": ["gradiente", "el gradiente", "vector gradiente"] },
 *   "explanation": "El gradiente de T apunta en la dirección de máximo crecimiento de la temperatura.",
 *   "source_reference": "Unidad 2: Gradiente"
 * }
 *
 * Sin `options`, el renderer cae a <input type="text"> + Confirmar.
 */
export interface ShortCaseExercise extends ExerciseBase {
  type: "short_case";
  /** Opciones para elegir. Si falta, el renderer usa input de texto libre. */
  options?: string[] | null;
  correct_answer: OptionIndexAnswer | TextAnswer;
}

// ---------------------------------------------------------------------------
// Union y mapa tipo → ejercicio
// ---------------------------------------------------------------------------

export type Exercise =
  | MultipleChoiceExercise
  | FillBlankExercise
  | FillSentenceExercise
  | MatchingExercise
  | OrderingExercise
  | TrueFalseExercise
  | PickIncorrectExercise
  | ClassificationExercise
  | ShortCaseExercise;

export interface ExerciseTypeMap {
  multiple_choice: MultipleChoiceExercise;
  fill_blank: FillBlankExercise;
  fill_sentence: FillSentenceExercise;
  matching: MatchingExercise;
  ordering: OrderingExercise;
  true_false: TrueFalseExercise;
  pick_incorrect: PickIncorrectExercise;
  classification: ClassificationExercise;
  short_case: ShortCaseExercise;
}

// ---------------------------------------------------------------------------
// Type guards / helpers de discriminación
// ---------------------------------------------------------------------------

export function isExerciseOfType<T extends ExerciseType>(
  exercise: Exercise,
  type: T,
): exercise is ExerciseTypeMap[T] {
  return exercise.type === type;
}

export function isMultipleChoice(ex: Exercise): ex is MultipleChoiceExercise {
  return ex.type === "multiple_choice";
}

export function isFillBlank(ex: Exercise): ex is FillBlankExercise {
  return ex.type === "fill_blank";
}

export function isFillSentence(ex: Exercise): ex is FillSentenceExercise {
  return ex.type === "fill_sentence";
}

export function isMatching(ex: Exercise): ex is MatchingExercise {
  return ex.type === "matching";
}

export function isOrdering(ex: Exercise): ex is OrderingExercise {
  return ex.type === "ordering";
}

export function isTrueFalse(ex: Exercise): ex is TrueFalseExercise {
  return ex.type === "true_false";
}

export function isPickIncorrect(ex: Exercise): ex is PickIncorrectExercise {
  return ex.type === "pick_incorrect";
}

export function isClassification(ex: Exercise): ex is ClassificationExercise {
  return ex.type === "classification";
}

export function isShortCase(ex: Exercise): ex is ShortCaseExercise {
  return ex.type === "short_case";
}

/**
 * Ejercicios que pueden venir sin `options` y deben caer al fallback de
 * <input type="text"> en el renderer (spec 41.1).
 */
export function allowsFreeTextFallback(
  ex: Exercise,
): ex is FillBlankExercise | FillSentenceExercise | ShortCaseExercise {
  return (
    ex.type === "fill_blank" ||
    ex.type === "fill_sentence" ||
    ex.type === "short_case"
  );
}

/** Discriminadores del wrapper correct_answer. */
export function isOptionIndexAnswer(a: CorrectAnswer): a is OptionIndexAnswer {
  return a.kind === "option_index";
}

export function isTextAnswer(a: CorrectAnswer): a is TextAnswer {
  return a.kind === "text";
}

export function isPairsAnswer(a: CorrectAnswer): a is PairsAnswer {
  return a.kind === "pairs";
}

export function isOrderAnswer(a: CorrectAnswer): a is OrderAnswer {
  return a.kind === "order";
}

export function isBooleanAnswer(a: CorrectAnswer): a is BooleanAnswer {
  return a.kind === "boolean";
}

export function isAssignmentsAnswer(a: CorrectAnswer): a is AssignmentsAnswer {
  return a.kind === "assignments";
}
