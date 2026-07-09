import {
  CalendarDays,
  FileStack,
  Gauge,
  HelpCircle,
  Repeat,
  type LucideIcon,
} from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";

const PAIN_POINTS: { icon: LucideIcon; text: string }[] = [
  { icon: FileStack, text: "Tenés PDFs, apuntes y resúmenes por todos lados." },
  { icon: HelpCircle, text: "No sabés qué temas priorizar." },
  { icon: Gauge, text: "No sabés si estás listo." },
  { icon: Repeat, text: "Releés mucho, pero practicás poco." },
  {
    icon: CalendarDays,
    text: "Te cuesta organizarte hasta la fecha del examen.",
  },
];

export function ProblemSection() {
  return (
    <section className="border-y border-border bg-surface py-20">
      <PageContainer size="wide">
        <h2 className="mx-auto max-w-2xl text-center text-3xl tracking-tight text-ink sm:text-4xl">
          Estudiar no debería ser adivinar qué hacer.
        </h2>

        <ul className="mx-auto mt-10 flex max-w-xl flex-col gap-3">
          {PAIN_POINTS.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-4 rounded-2xl bg-background p-4 ring-1 ring-border"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-orange/12 text-accent-orange">
                <Icon className="size-5" />
              </span>
              <p className="text-[15px] font-medium text-ink">{text}</p>
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
}
