/**
 * Ejemplos JSON completos por tipo de ejercicio — copiados de lib/exercises/types.ts.
 * Única fuente de verdad para prompts de IA (spec 41.1).
 */
export const EXERCISE_JSON_EXAMPLES = `
### multiple_choice
{
  "type": "multiple_choice",
  "prompt": "¿Cuál es la derivada parcial respecto de x de f(x, y) = x²y?",
  "options": ["x²", "2xy", "2x", "y²"],
  "correct_answer": { "kind": "option_index", "data": 1 },
  "explanation": "Al derivar respecto de x, la variable y se trata como constante: ∂/∂x (x²y) = 2xy.",
  "source_reference": "Unidad 1: Derivadas parciales"
}

### fill_blank
{
  "type": "fill_blank",
  "prompt": "Una función f(x, y) es continua en un punto si el ____ de la función en ese punto existe y coincide con el valor de la función.",
  "options": ["límite", "dominio", "gradiente", "máximo"],
  "correct_answer": { "kind": "text", "data": ["límite", "limite"] },
  "explanation": "La continuidad exige que el límite exista y coincida con el valor de la función en el punto.",
  "source_reference": "Unidad 1: Continuidad"
}

### fill_sentence
{
  "type": "fill_sentence",
  "prompt": "Para hallar los extremos de f sujeta a una restricción g(x, y) = 0 se usa ____.",
  "options": [
    "el método de multiplicadores de Lagrange",
    "la regla de la cadena",
    "el teorema de Green",
    "la integral doble"
  ],
  "correct_answer": { "kind": "text", "data": ["el método de multiplicadores de Lagrange"] },
  "explanation": "Los multiplicadores de Lagrange permiten optimizar con restricciones de igualdad.",
  "source_reference": "Unidad 4: Optimización con restricciones"
}

### matching — options SIEMPRE {left, right}
{
  "type": "matching",
  "prompt": "Uní cada concepto con su definición.",
  "options": {
    "left": ["Gradiente", "Matriz Hessiana", "Derivada direccional"],
    "right": [
      "Vector de derivadas parciales primeras",
      "Matriz de derivadas parciales segundas",
      "Tasa de cambio en una dirección dada"
    ]
  },
  "correct_answer": {
    "kind": "pairs",
    "data": [
      { "left": 0, "right": 0 },
      { "left": 1, "right": 1 },
      { "left": 2, "right": 2 }
    ]
  },
  "explanation": "El gradiente agrupa las derivadas primeras, la Hessiana las segundas y la derivada direccional mide el cambio en una dirección.",
  "source_reference": "Unidad 2: Derivadas"
}

### ordering
{
  "type": "ordering",
  "prompt": "Ordená los pasos para encontrar y clasificar los extremos de una función de dos variables.",
  "options": [
    "Clasificar cada punto crítico según el signo del determinante",
    "Calcular las derivadas parciales primeras",
    "Igualar las derivadas a cero y hallar los puntos críticos",
    "Evaluar la matriz Hessiana en cada punto crítico"
  ],
  "correct_answer": { "kind": "order", "data": [1, 2, 3, 0] },
  "explanation": "Primero se derivan, luego se hallan los puntos críticos, se evalúa la Hessiana y por último se clasifica.",
  "source_reference": "Unidad 3: Extremos"
}

### true_false — sin options
{
  "type": "true_false",
  "prompt": "Si las derivadas parciales de f existen en un punto, entonces f es diferenciable en ese punto.",
  "correct_answer": { "kind": "boolean", "data": false },
  "explanation": "La existencia de derivadas parciales no garantiza diferenciabilidad; se necesita que el límite del cociente incremental total exista.",
  "source_reference": "Unidad 1: Diferenciabilidad"
}

### pick_incorrect
{
  "type": "pick_incorrect",
  "prompt": "¿Cuál de estas afirmaciones sobre el gradiente es INCORRECTA?",
  "options": [
    "El gradiente apunta en la dirección de máximo crecimiento",
    "El gradiente es perpendicular a las curvas de nivel",
    "El gradiente siempre apunta hacia el mínimo de la función",
    "La norma del gradiente mide la tasa máxima de cambio"
  ],
  "correct_answer": { "kind": "option_index", "data": 2 },
  "explanation": "El gradiente apunta hacia el máximo crecimiento, no hacia el mínimo (para eso se usa -∇f).",
  "source_reference": "Unidad 2: Gradiente"
}

### classification — options SIEMPRE {items, categories}
{
  "type": "classification",
  "prompt": "Clasificá cada punto crítico según el criterio de la Hessiana.",
  "options": {
    "items": [
      "det(H) > 0 y fxx > 0",
      "det(H) > 0 y fxx < 0",
      "det(H) < 0"
    ],
    "categories": ["Mínimo local", "Máximo local", "Punto silla"]
  },
  "correct_answer": {
    "kind": "assignments",
    "data": [
      { "item": 0, "category": 0 },
      { "item": 1, "category": 1 },
      { "item": 2, "category": 2 }
    ]
  },
  "explanation": "El signo del determinante de la Hessiana y de fxx determina si el punto crítico es mínimo, máximo o silla.",
  "source_reference": "Unidad 3: Clasificación de puntos críticos"
}

### short_case
{
  "type": "short_case",
  "prompt": "Una empresa quiere minimizar el costo del material de una caja rectangular sin tapa con volumen fijo. ¿Qué técnica de Análisis Matemático 2 conviene usar?",
  "options": [
    "Multiplicadores de Lagrange",
    "Integrales dobles",
    "Regla de la cadena",
    "Series de Taylor"
  ],
  "correct_answer": { "kind": "option_index", "data": 0 },
  "explanation": "Es un problema de optimización con una restricción (el volumen fijo), el caso típico de multiplicadores de Lagrange.",
  "source_reference": "Unidad 4: Optimización"
}
`.trim();

export const EXERCISE_GENERATION_RULES = `
Reglas obligatorias para ejercicios:
- correct_answer SIEMPRE es { "kind": "<tipo>", "data": <valor> }.
- matching: options DEBE ser { "left": string[], "right": string[] } — NUNCA un array plano.
- classification: options DEBE ser { "items": string[], "categories": string[] } — NUNCA un array plano.
- true_false NO lleva options.
- multiple_choice y pick_incorrect: exactamente 4 options.
- explanation es obligatoria en todos los tipos.
- Todo el contenido en español.
- Evitar afirmaciones no respaldadas por el material.
- Incluir source_reference cuando sea posible.
`.trim();
