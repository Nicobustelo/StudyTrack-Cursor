import { Sparkles } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { CtaLink } from "@/components/landing/cta-link";
import { PhoneMockup } from "@/components/landing/phone-mockup";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Decoración de fondo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 -right-24 size-80 rounded-full bg-brand-light blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-64 -left-32 size-72 rounded-full bg-accent-yellow/20 blur-3xl"
      />

      <PageContainer
        size="wide"
        className="relative flex flex-col items-center gap-14 pt-14 pb-24 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:pt-24"
      >
        <div className="flex max-w-xl flex-col items-center text-center lg:items-start lg:text-left">
          <span className="flex items-center gap-1.5 rounded-full bg-brand-light px-3.5 py-1.5 text-xs font-bold text-brand-dark">
            <Sparkles className="size-3.5" />
            Para parciales y finales
          </span>

          <h1 className="mt-5 text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
            Convertí tus apuntes en{" "}
            <span className="text-brand">un camino</span> para aprobar.
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-muted sm:text-lg">
            Subí tus materiales, indicá cuándo rendís y StudyTrack te arma un
            track diario con lecciones, ejercicios, repasos y simulacros para
            llegar a tu nota objetivo.
          </p>

          <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <CtaLink
              href="/signup"
              ctaId="hero_primary"
              location="landing_hero"
              label="Crear mi track"
              size="xl"
            />
            <CtaLink
              href="#track"
              ctaId="hero_secondary"
              location="landing_hero"
              label="Ver demo"
              variant="outline"
              size="xl"
            />
          </div>

          <p className="mt-4 text-sm font-medium text-ink-muted">
            Gratis para empezar · Sin tarjeta
          </p>
        </div>

        <div className="shrink-0 lg:pr-6">
          <PhoneMockup />
        </div>
      </PageContainer>
    </section>
  );
}
