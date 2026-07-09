import { PageContainer } from "@/components/layout/page-container";

const FACTORS: { label: string; value: number; color: string }[] = [
  { label: "Avance del track", value: 55, color: "bg-brand" },
  { label: "Resultados en quizzes", value: 48, color: "bg-accent-blue" },
  { label: "Temas cubiertos", value: 40, color: "bg-accent-purple" },
  { label: "Repasos al día", value: 30, color: "bg-accent-orange" },
];

const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function ReadinessSection() {
  return (
    <section className="border-y border-border bg-surface py-20">
      <PageContainer
        size="wide"
        className="grid items-center gap-12 md:grid-cols-2"
      >
        {/* Visual: anillo 42% + factores */}
        <div className="order-2 mx-auto w-full max-w-sm rounded-2xl bg-background p-6 shadow-card ring-1 ring-border md:order-1">
          <div className="flex items-center gap-6">
            <div className="relative size-32 shrink-0">
              <svg viewBox="0 0 128 128" className="size-full -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r={RING_RADIUS}
                  fill="none"
                  stroke="var(--st-green-light)"
                  strokeWidth="12"
                />
                <circle
                  cx="64"
                  cy="64"
                  r={RING_RADIUS}
                  fill="none"
                  stroke="var(--st-green)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${RING_CIRCUMFERENCE * 0.42} ${RING_CIRCUMFERENCE}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-heading text-3xl font-extrabold text-ink">
                  42%
                </span>
                <span className="text-[11px] font-bold text-ink-muted">
                  Preparación
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed font-medium text-ink-muted">
              Vas bien. Te quedan 8 días: vamos a priorizar los temas que más
              pesan.
            </p>
          </div>

          <ul className="mt-6 flex flex-col gap-3">
            {FACTORS.map(({ label, value, color }) => (
              <li key={label}>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-ink">{label}</span>
                  <span className="text-ink-muted">{value}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="order-1 text-center md:order-2 md:text-left">
          <h2 className="text-3xl tracking-tight text-ink sm:text-4xl">
            Sabé qué tan preparado estás.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-muted sm:text-lg">
            Tu nivel de preparación combina avance, resultados en quizzes,
            dificultad, temas cubiertos, repasos y tiempo restante. No es solo
            una barra de progreso: es una señal de qué tan cerca estás de tu
            objetivo.
          </p>
        </div>
      </PageContainer>
    </section>
  );
}
