import { resolveTrackStatuses, type TrackNodeFacts } from "./status";
import type {
  DailyChallengeVM,
  TrackNodeKind,
  TrackNodeVM,
  TrackUnitVM,
  TrackViewModel,
} from "./types";

/**
 * Track demo robusto (fallback cuando no hay datos suficientes en la DB).
 * Cubre los 7 estados de nodo y todos los tipos, con scroll largo para
 * verificar pb-36 / bottom nav en 390×844. Nunca bloquea la ruta.
 */

interface DemoNodeSeed {
  id: string;
  kind: TrackNodeKind;
  title: string;
  minutes: number;
  completed?: boolean;
  failed?: boolean;
  reviewDue?: boolean;
  score?: number;
  premium?: boolean;
}

interface DemoUnitSeed {
  id: string;
  title: string;
  description: string;
  premium?: boolean;
  nodes: DemoNodeSeed[];
}

const DEMO_UNITS: DemoUnitSeed[] = [
  {
    id: "demo-u1",
    title: "Funciones de varias variables",
    description: "Los conceptos mínimos para arrancar.",
    nodes: [
      { id: "demo-l1", kind: "lesson", title: "Dominio e imagen", minutes: 10, completed: true, score: 92 },
      { id: "demo-l2", kind: "practice", title: "Conceptos clave", minutes: 8, completed: true, score: 85 },
      { id: "demo-l3", kind: "review", title: "Repaso — Definiciones", minutes: 6, completed: true, score: 80, reviewDue: true },
      { id: "demo-q1", kind: "quiz", title: "Test de Unidad 1", minutes: 12, completed: true, score: 88 },
    ],
  },
  {
    id: "demo-u2",
    title: "Derivadas parciales",
    description: "El tema que más aparece en parciales.",
    nodes: [
      { id: "demo-l4", kind: "lesson", title: "Derivadas parciales", minutes: 12, completed: true, score: 76 },
      { id: "demo-dc1", kind: "daily_challenge", title: "Reto diario", minutes: 7, failed: true },
      { id: "demo-l5", kind: "lesson", title: "Regla de la cadena", minutes: 11 },
      { id: "demo-l6", kind: "practice", title: "Práctica — Gradiente", minutes: 9 },
      { id: "demo-q2", kind: "quiz", title: "Test de Unidad 2", minutes: 12 },
    ],
  },
  {
    id: "demo-u3",
    title: "Integrales múltiples",
    description: "Integrales dobles y triples con cambio de variables.",
    premium: true,
    nodes: [
      { id: "demo-l7", kind: "lesson", title: "Integrales dobles", minutes: 12 },
      { id: "demo-l8", kind: "practice", title: "Regiones de integración", minutes: 10 },
      { id: "demo-l9", kind: "review", title: "Repaso — Coordenadas polares", minutes: 7 },
      { id: "demo-q3", kind: "quiz", title: "Test de Unidad 3", minutes: 14 },
    ],
  },
  {
    id: "demo-u4",
    title: "Series y sucesiones",
    description: "Criterios de convergencia y series de potencias.",
    premium: true,
    nodes: [
      { id: "demo-l10", kind: "lesson", title: "Criterios de convergencia", minutes: 12 },
      { id: "demo-l11", kind: "practice", title: "Series de potencias", minutes: 10 },
      { id: "demo-q4", kind: "quiz", title: "Test de Unidad 4", minutes: 14 },
    ],
  },
  {
    id: "demo-u5",
    title: "Preparación final",
    description: "Simulacros calibrados con exámenes anteriores.",
    premium: true,
    nodes: [
      { id: "demo-l12", kind: "review", title: "Repaso general", minutes: 15 },
      { id: "demo-m1", kind: "mock_exam", title: "Simulacro parcial", minutes: 30 },
      { id: "demo-m2", kind: "mock_exam", title: "Simulacro final", minutes: 45 },
    ],
  },
];

function demoHref(examId: string, node: DemoNodeSeed): string {
  if (node.kind === "quiz") return `/exams/${examId}/quiz/${node.id}`;
  if (node.kind === "mock_exam") return `/exams/${examId}/mock-exams`;
  return `/exams/${examId}/lesson/${node.id}`;
}

function localISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function buildDemoTrackViewModel(
  examId: string,
  options?: { hasPremiumAccess?: boolean },
): TrackViewModel {
  const hasPremiumAccess = options?.hasPremiumAccess ?? false;

  const facts: TrackNodeFacts[] = DEMO_UNITS.flatMap((unit, unitIdx) =>
    unit.nodes.map((node) => ({
      id: node.id,
      kind: node.kind,
      premiumRequired: Boolean(
        unit.premium || node.premium || unitIdx + 1 >= 3 || node.kind === "mock_exam",
      ),
      completed: Boolean(node.completed),
      failed: Boolean(node.failed),
      reviewDue: Boolean(node.reviewDue),
    })),
  );

  const resolved = resolveTrackStatuses(facts, hasPremiumAccess);

  let dailyChallenge: DailyChallengeVM | null = null;

  const units: TrackUnitVM[] = DEMO_UNITS.map((unit, unitIdx) => {
    const nodes: TrackNodeVM[] = unit.nodes.map((node) => {
      const res = resolved.get(node.id) ?? {
        status: "locked" as const,
        isCurrent: false,
      };
      const vm: TrackNodeVM = {
        id: node.id,
        kind: node.kind,
        title: node.title,
        durationMinutes: node.minutes,
        status: res.status,
        isCurrent: res.isCurrent,
        href: demoHref(examId, node),
        score: node.completed ? (node.score ?? null) : null,
        premiumGated:
          res.status === "premium_locked" ||
          (Boolean(unit.premium || node.premium) && !hasPremiumAccess),
        broken: false,
      };

      if (
        node.kind === "daily_challenge" &&
        !dailyChallenge &&
        (vm.status === "available" ||
          vm.status === "failed_retry" ||
          vm.status === "completed")
      ) {
        dailyChallenge = {
          id: node.id,
          title: "Completá 8 preguntas de derivadas parciales.",
          xp: 15,
          durationMinutes: node.minutes,
          status:
            vm.status === "completed"
              ? "completed"
              : vm.status === "failed_retry"
                ? "failed_retry"
                : "available",
          href: vm.href,
        };
      }

      return vm;
    });

    return {
      id: unit.id,
      number: unitIdx + 1,
      title: unit.title,
      description: unit.description,
      isPremiumUnit: Boolean(unit.premium || unitIdx + 1 >= 3),
      totalLessons: nodes.length,
      completedLessons: nodes.filter((n) => n.status === "completed").length,
      nodes,
    };
  });

  const examDate = new Date();
  examDate.setDate(examDate.getDate() + 8);

  return {
    examId,
    subjectName: "Análisis Matemático 2",
    examDateISO: localISODate(examDate),
    daysUntilExam: 8,
    targetGrade: "8+",
    readinessScore: 42,
    streakDays: 3,
    hasPremiumAccess,
    emergencyMode: false,
    isDemo: true,
    generating: false,
    dailyChallenge,
    units,
  };
}
