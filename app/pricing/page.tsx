import type { Metadata } from "next";
import { Check } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { CtaLink } from "@/components/landing/cta-link";
import { PAYWALL_BENEFITS, PLANS, formatPriceArs } from "@/lib/payments/plans";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Precios — StudyTrack",
  description:
    "Pagás por examen, no por suscripción. Empezá gratis con las Unidades 1 y 2 de tu plan.",
};

export default function PricingPage() {
  const plans = [PLANS.one_exam, PLANS.three_exams, PLANS.semester];

  return (
    <AppShell header={<LandingHeader />} footer={<LandingFooter />}>
      <section className="py-16 sm:py-20">
        <PageContainer size="wide">
          <h1 className="mx-auto max-w-2xl text-center text-3xl tracking-tight text-ink sm:text-5xl">
            Pagás por examen, no por suscripción.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-center text-base text-ink-muted sm:text-lg">
            Empezá gratis: creá tu examen, subí tus materiales y completá las
            Unidades 1 y 2 sin pagar nada.
          </p>

          <ol className="mx-auto mt-8 grid max-w-3xl gap-3 rounded-2xl bg-brand-light/60 p-4 ring-1 ring-brand/15 sm:grid-cols-3 sm:p-5">
            {[
              ["1", "Creá tu examen gratis"],
              ["2", "Probá las primeras unidades"],
              ["3", "Elegí un pack al desbloquear"],
            ].map(([number, label]) => (
              <li key={number} className="flex items-center gap-3 text-sm font-bold text-ink">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs text-white">
                  {number}
                </span>
                {label}
              </li>
            ))}
          </ol>

          <div className="mx-auto mt-12 grid max-w-4xl gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl bg-surface p-6 ring-1 ring-border",
                  plan.highlight && "shadow-card ring-2 ring-brand",
                )}
              >
                {plan.badge ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-[11px] font-bold text-white shadow-[0_2px_0_0_var(--st-green-dark)]">
                    {plan.badge}
                  </span>
                ) : null}

                <h2 className="text-lg text-ink">{plan.name}</h2>
                <p className="mt-1 min-h-10 text-sm leading-snug text-ink-muted">
                  {plan.description}
                </p>
                <p className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-ink">
                  {formatPriceArs(plan.priceArs)}
                </p>
                <p className="mt-1 text-xs font-medium text-ink-muted">
                  Pago único con Mercado Pago
                </p>

                <p className="mt-4 flex min-h-10 items-start gap-2 text-sm font-bold leading-snug text-ink">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                  {plan.accessSummary}
                </p>

                <CtaLink
                  href="/signup"
                  ctaId={`pricing_plan_${plan.id}`}
                  location="pricing_page"
                  label="Probar gratis primero"
                  size="lg"
                  className="mt-6 w-full"
                />
              </div>
            ))}
          </div>

          <div className="mx-auto mt-12 max-w-2xl rounded-2xl bg-surface p-6 shadow-card ring-1 ring-border sm:p-8">
            <h2 className="text-xl text-ink">
              Todo lo que desbloqueás con el plan completo
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {PAYWALL_BENEFITS.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-center gap-2.5 text-sm font-medium text-ink"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand-dark">
                    <Check className="size-3" strokeWidth={3.5} />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-ink-muted">
              El checkout se abre desde el camino de un examen, justo cuando
              intentás entrar a contenido Premium. Ahí elegís el pack y pagás
              de forma segura con Mercado Pago.
            </p>
          </div>

          <div className="mt-12 flex flex-col items-center gap-3">
            <CtaLink
              href="/onboarding"
              ctaId="pricing_page_onboarding"
              location="pricing_page"
              label="Crear mi plan de estudio gratis"
              size="xl"
              className="w-full sm:w-auto"
            />
            <p className="text-sm font-medium text-ink-muted">
              Sin tarjeta. Pagás solo si querés desbloquear más.
            </p>
          </div>

          <p className="mx-auto mt-10 max-w-xl text-center text-xs leading-relaxed text-ink-muted">
            StudyTrack te ayuda a organizar y practicar tu estudio, pero no
            garantiza una nota específica. Los resultados dependen de tu
            preparación, materiales y desempeño real en el examen.
          </p>
        </PageContainer>
      </section>
    </AppShell>
  );
}
