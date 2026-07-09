export type BottomNavIconKey =
  | "track"
  | "review"
  | "mock_exams"
  | "progress"
  | "profile";

export type BottomNavItem = {
  href: string;
  label: string;
  icon: BottomNavIconKey;
};

/** Ítems estándar del nav para un examen (spec 23): Track / Repaso / Simulacros / Progreso / Perfil. */
export function examBottomNavItems(examId: string): BottomNavItem[] {
  const base = `/exams/${examId}`;
  return [
    { href: `${base}/track`, label: "Track", icon: "track" },
    { href: `${base}/review`, label: "Repaso", icon: "review" },
    { href: `${base}/mock-exams`, label: "Simulacros", icon: "mock_exams" },
    { href: `${base}/progress`, label: "Progreso", icon: "progress" },
    { href: "/dashboard", label: "Perfil", icon: "profile" },
  ];
}
