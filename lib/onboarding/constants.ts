export const AGE_OPTIONS = [
  "Menos de 18",
  "18–22",
  "23–29",
  "30+",
] as const;

export const EDUCATION_OPTIONS = [
  "Secundario",
  "Universidad",
  "Tecnicatura",
  "Curso o certificación",
  "Otro",
] as const;

export const EXAM_TYPE_OPTIONS = [
  "Parcial",
  "Final",
  "Global",
  "Recuperatorio",
  "Multiple choice",
  "Desarrollo",
  "Práctico",
  "Mixto",
] as const;

export const TARGET_GRADE_OPTIONS = [
  { label: "Solo quiero aprobar", value: "aprobar" },
  { label: "7+", value: "7" },
  { label: "8+", value: "8" },
  { label: "9+", value: "9" },
  { label: "10", value: "10" },
] as const;

export const AVAILABILITY_OPTIONS = [
  { label: "20 minutos", minutes: 20 },
  { label: "45 minutos", minutes: 45 },
  { label: "1 hora", minutes: 60 },
  { label: "2 horas", minutes: 120 },
  { label: "3 horas o más", minutes: 180 },
] as const;

export const WEEKDAY_OPTIONS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;

export const CURRENT_LEVEL_OPTIONS = [
  "No empecé",
  "Sé algo",
  "Vengo bien",
  "Solo necesito practicar",
] as const;

export const PROFESSOR_STYLE_OPTIONS = [
  "Memorístico",
  "Conceptual",
  "Casos",
  "Fórmulas",
  "Definiciones",
  "Preguntas trampa",
  "Mucho detalle",
  "No sé",
] as const;

export const PAST_EXAM_KIND_OPTIONS = [
  "Parcial",
  "Final",
  "Global",
  "Recuperatorio",
  "Multiple choice",
  "Desarrollo",
  "Mixto",
] as const;

export const TEACHER_MATCH_OPTIONS = [
  "Mismo profesor",
  "Misma cátedra",
  "Otro profesor",
  "No sé",
] as const;

export const SCOPE_MATCH_OPTIONS = [
  "Mismos temas",
  "Algunos temas",
  "Otros temas",
  "No sé",
] as const;

export const FORMAT_MATCH_OPTIONS = [
  "Igual al que voy a rendir",
  "Parecido",
  "Distinto",
  "No sé",
] as const;

export const DIFFICULTY_OPTIONS = [
  "Fácil",
  "Media",
  "Difícil",
  "No sé",
] as const;

export const ANALYSIS_MESSAGES = [
  "Leyendo tus apuntes…",
  "Detectando temas importantes…",
  "Comparando exámenes anteriores…",
  "Estimando dificultad…",
  "Priorizando lo que más puede entrar…",
  "Creando ejercicios…",
  "Armando tu track diario…",
] as const;

export const MAX_FREE_MATERIALS = 5;

export const ACCEPTED_MATERIAL_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
];

export function daysUntilExam(examDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${examDate}T00:00:00`);
  const diff = target.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getSimilarityHelpText(score: number): string {
  if (score <= 3) {
    return "Casi no se parece, pero puede servir como práctica general.";
  }
  if (score <= 6) {
    return "Referencia útil, pero no exactamente igual.";
  }
  if (score <= 8) {
    return "Bastante parecido.";
  }
  return "Muy parecido: mismo profesor, formato y temas.";
}
