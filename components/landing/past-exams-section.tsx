import { Check, FileText } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";

const MATCH_TAGS = ["Mismo profesor", "Formato mixto", "Alta coincidencia de temas"];

export function PastExamsSection() {
  return (
    <section className="border-y border-border bg-surface py-20">
      <PageContainer
        size="wide"
        className="grid items-center gap-12 md:grid-cols-2"
      >
        <div className="text-center md:text-left">
          <h2 className="text-3xl tracking-tight text-ink sm:text-4xl">
            Practicá como probablemente te van a tomar.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-muted sm:text-lg">
            Si tenés parciales o finales anteriores, subilos. StudyTrack
            detecta patrones, temas repetidos y estilos de pregunta para crear
            quizzes y simulacros más parecidos al examen real.
          </p>
          <p className="mt-6 text-xs leading-relaxed text-ink-muted/80 italic">
            La similitud es una estimación. Usá los exámenes anteriores como
            referencia, no como predicción exacta.
          </p>
        </div>

        {/* Card de similarity (spec 8.4) */}
        <div className="mx-auto w-full max-w-sm rounded-2xl bg-background p-6 shadow-card ring-1 ring-border">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-blue/12 text-accent-blue">
              <FileText className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-heading text-base font-bold text-ink">
                Parcial 2024
              </p>
              <p className="text-sm font-medium text-ink-muted">
                Parecido estimado: <span className="font-bold text-ink">8/10</span>
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1.5" aria-hidden="true">
            {Array.from({ length: 10 }, (_, i) => (
              <span
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i < 8 ? "bg-accent-blue" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <ul className="mt-5 flex flex-col gap-2.5">
            {MATCH_TAGS.map((tag) => (
              <li
                key={tag}
                className="flex items-center gap-2.5 text-sm font-medium text-ink"
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand-dark">
                  <Check className="size-3" strokeWidth={3.5} />
                </span>
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </PageContainer>
    </section>
  );
}
