export type PlanType = "one_exam" | "three_exams" | "semester";

export interface PlanDefinition {
  id: PlanType;
  name: string;
  description: string;
  priceArs: number;
  currency: "ARS";
  badge?: string;
  highlight?: boolean;
}

/** Beneficios mostrados en el paywall (spec 17.3). */
export const PAYWALL_BENEFITS = [
  "Todas las unidades",
  "Simulacros",
  "Ejercicios tipo examen",
  "Readiness avanzado",
  "Modo Emergencia",
  "Repasos personalizados",
  "Tests calibrados con parciales anteriores",
] as const;

export const PAYWALL_COPY = {
  title: "Desbloqueá tu plan completo para este examen.",
  subtitle:
    "Ya creamos tu plan de estudio. Desbloqueá todas las unidades, repasos, simulacros y ejercicios calibrados con tus exámenes anteriores.",
  cta: "Desbloquear este examen",
} as const;

const DEFAULT_PRICES: Record<PlanType, number> = {
  one_exam: 5900,
  three_exams: 12900,
  semester: 19900,
};

function readPrice(envKey: string, fallback: number): number {
  const raw = process.env[envKey];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const PLANS: Record<PlanType, PlanDefinition> = {
  one_exam: {
    id: "one_exam",
    name: "1 examen",
    description: "Para preparar una materia puntual.",
    priceArs: readPrice("NEXT_PUBLIC_PRICE_ONE_EXAM", DEFAULT_PRICES.one_exam),
    currency: "ARS",
  },
  three_exams: {
    id: "three_exams",
    name: "3 exámenes",
    description: "Para época de parciales/finales.",
    priceArs: readPrice(
      "NEXT_PUBLIC_PRICE_THREE_EXAMS",
      DEFAULT_PRICES.three_exams,
    ),
    currency: "ARS",
    badge: "Popular",
    highlight: true,
  },
  semester: {
    id: "semester",
    name: "Pack semestre",
    description: "Para preparar varias materias durante el semestre.",
    priceArs: readPrice("NEXT_PUBLIC_PRICE_SEMESTER", DEFAULT_PRICES.semester),
    currency: "ARS",
  },
};

export const PLAN_TYPES = Object.keys(PLANS) as PlanType[];

export function isPlanType(value: string): value is PlanType {
  return PLAN_TYPES.includes(value as PlanType);
}

export function getPlan(planType: PlanType): PlanDefinition {
  return PLANS[planType];
}

export function formatPriceArs(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}
