import type { Exercise } from "@/lib/exercises/types";

/** Fallback demo cuando no hay preguntas en DB — evita crash de ruta. */
export function getDemoExercises(): Exercise[] {
  return [
    {
      type: "multiple_choice",
      prompt:
        "¿Cuál es la derivada parcial respecto de x de f(x, y) = x²y?",
      options: ["x²", "2xy", "2x", "y²"],
      correct_answer: { kind: "option_index", data: 1 },
      explanation:
        "Al derivar respecto de x, y se trata como constante: ∂/∂x (x²y) = 2xy.",
      source_reference: "Demo — Derivadas parciales",
    },
    {
      type: "true_false",
      prompt:
        "Si las derivadas parciales de f existen en un punto, entonces f es diferenciable en ese punto.",
      correct_answer: { kind: "boolean", data: false },
      explanation:
        "La existencia de derivadas parciales no garantiza diferenciabilidad.",
      source_reference: "Demo — Diferenciabilidad",
    },
    {
      type: "fill_blank",
      prompt:
        "Una función es continua en un punto si el ____ de la función en ese punto existe.",
      options: ["límite", "dominio", "gradiente", "máximo"],
      correct_answer: { kind: "text", data: ["límite", "limite"] },
      explanation: "La continuidad exige que el límite exista y coincida con el valor.",
      source_reference: "Demo — Continuidad",
    },
  ];
}
