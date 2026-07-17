export type BottomNavIconKey =
  | "track"
  | "review"
  | "mock_exams"
  | "progress"
  | "home";

export type BottomNavItem = {
  href: string;
  label: string;
  icon: BottomNavIconKey;
};

/** Ítems estándar del nav para un examen. */
export function examBottomNavItems(examId: string): BottomNavItem[] {
  const base = `/exams/${examId}`;
  return [
    { href: `${base}/track`, label: "Plan", icon: "track" },
    { href: `${base}/review`, label: "Repaso", icon: "review" },
    { href: `${base}/mock-exams`, label: "Simulacros", icon: "mock_exams" },
    { href: `${base}/progress`, label: "Progreso", icon: "progress" },
    { href: "/dashboard", label: "Inicio", icon: "home" },
  ];
}
