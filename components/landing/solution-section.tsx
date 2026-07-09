import { CalendarDays, Route, Upload, type LucideIcon } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";

const STEPS: {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
}[] = [
  {
    icon: Upload,
    title: "Subí tus apuntes",
    description: "PDFs, fotos, resúmenes, textos o guías.",
    accent: "bg-brand-light text-brand-dark",
  },
  {
    icon: CalendarDays,
    title: "Agregá la fecha y tu nota objetivo",
    description: "Decinos cuánto tiempo tenés y qué querés lograr.",
    accent: "bg-accent-blue/12 text-accent-blue",
  },
  {
    icon: Route,
    title: "Seguís tu track diario",
    description:
      "Lecciones cortas, ejercicios, repasos y tests hasta llegar preparado.",
    accent: "bg-accent-purple/12 text-accent-purple",
  },
];

export function SolutionSection() {
  return (
    <section className="py-20">
      <PageContainer size="wide">
        <h2 className="mx-auto max-w-2xl text-center text-3xl tracking-tight text-ink sm:text-4xl">
          StudyTrack te da <span className="text-brand">un camino</span>.
        </h2>

        <ol className="mx-auto mt-12 grid max-w-4xl gap-4 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, description, accent }, index) => (
            <li
              key={title}
              className="relative flex flex-col gap-4 rounded-2xl bg-surface p-6 shadow-card ring-1 ring-border"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex size-12 items-center justify-center rounded-2xl ${accent}`}
                >
                  <Icon className="size-6" />
                </span>
                <span className="flex size-8 items-center justify-center rounded-full bg-ink font-heading text-sm font-bold text-white">
                  {index + 1}
                </span>
              </div>
              <div>
                <h3 className="text-lg leading-snug text-ink">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </PageContainer>
    </section>
  );
}
