/** Constantes compartidas entre seed y fallback UI. */

export const DEMO_EXAM_SUBJECT = "Análisis Matemático 2";

export const DEMO_EXAM_MARKER = "studytrack-demo-v1";

export const DEMO_TOPICS = [
  "Funciones de varias variables",
  "Límites y continuidad en varias variables",
  "Derivadas parciales y gradiente",
  "Diferenciabilidad y plano tangente",
  "Extremos libres y multiplicadores de Lagrange",
  "Integrales múltiples",
  "Ecuaciones diferenciales de primer orden",
] as const;

export const DEMO_UNITS = [
  {
    title: "Funciones de varias variables",
    is_premium: false,
    lessons: [
      "Dominio, imagen y curvas de nivel",
      "Límites y continuidad",
      "Completar conceptos clave",
    ],
  },
  {
    title: "Derivadas parciales",
    is_premium: false,
    lessons: [
      "Derivadas parciales",
      "Gradiente y derivada direccional",
      "Plano tangente",
    ],
  },
  {
    title: "Extremos y optimización",
    is_premium: true,
    lessons: ["Puntos críticos", "Multiplicadores de Lagrange"],
  },
  {
    title: "Integrales múltiples",
    is_premium: true,
    lessons: ["Integrales dobles", "Coordenadas polares"],
  },
  {
    title: "Simulacro parcial",
    is_premium: true,
    lessons: ["Simulacro calibrado"],
  },
] as const;

export const DEMO_MOCK_EXAMS = [
  {
    id: "quick",
    title: "Simulacro rápido",
    questions: 8,
    minutes: 15,
    similarity: 6,
    topics: ["Derivadas parciales", "Límites"],
  },
  {
    id: "full",
    title: "Simulacro completo",
    questions: 15,
    minutes: 45,
    similarity: 7,
    topics: ["Todo el parcial"],
  },
  {
    id: "calibrated",
    title: "Calibrado con parciales anteriores",
    questions: 12,
    minutes: 35,
    similarity: 9,
    topics: ["Definiciones", "Casos", "Lagrange"],
    premium: true,
  },
  {
    id: "weak",
    title: "Temas débiles",
    questions: 10,
    minutes: 25,
    similarity: 7,
    topics: ["Multiplicadores de Lagrange"],
  },
  {
    id: "emergency",
    title: "Modo Emergencia",
    questions: 6,
    minutes: 12,
    similarity: 8,
    topics: ["Prioridad alta"],
    premium: true,
  },
] as const;
