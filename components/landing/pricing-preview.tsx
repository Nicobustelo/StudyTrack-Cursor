import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { CtaLink } from "@/components/landing/cta-link";
import { PLANS, formatPriceArs } from "@/lib/payments/plans";
import { cn } from "@/lib/utils";

/* Preview de pricing (spec 8.7): 1 examen / 3 exámenes / Semestre. */
export function PricingPreview() {
  const plans = [PLANS.one_exam, PLANS.three_exams, PLANS.semester];

  return (
    <section className="py-20">
      <PageContainer size="wide">
        <h2 className="mx-auto max-w-2xl text-center text-3xl tracking-tight text-ink sm:text-4xl">
          Pagás por examen, no por suscripción.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-center text-base text-ink-muted">
          Empezá gratis con las Unidades 1 y 2 de tu plan. Desbloqueá el resto
          cuando lo necesites.
        </p>

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

              <h3 className="text-lg text-ink">{plan.name}</h3>
              <p className="mt-1 min-h-10 text-sm leading-snug text-ink-muted">
                {plan.description}
              </p>
              <p className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-ink">
                {formatPriceArs(plan.priceArs)}
              </p>
              <p className="mt-1 text-xs font-medium text-ink-muted">
                Pago único con Mercado Pago
              </p>
              <p className="mt-4 flex items-start gap-2 text-sm font-bold text-ink">
                <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                {plan.accessSummary}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-4">
          <CtaLink
            href="/signup"
            ctaId="pricing_preview_primary"
            location="landing_pricing"
            label="Empezar gratis"
            size="xl"
            className="w-full sm:w-auto"
          />
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1 text-sm font-bold text-brand-dark transition-colors hover:text-brand"
          >
            Ver planes completos
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </PageContainer>
    </section>
  );
}
