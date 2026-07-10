import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { PageContainer } from "@/components/layout/page-container";
import { StickyHeader } from "@/components/layout/sticky-header";
import { CtaLink } from "@/components/landing/cta-link";

export function LandingHeader() {
  return (
    <StickyHeader>
      <PageContainer size="wide" className="flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/pricing"
            className="hidden rounded-lg px-3 py-2 text-sm font-bold text-ink-muted transition-colors hover:text-ink sm:inline-flex"
          >
            Precios
          </Link>
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-bold text-ink-muted transition-colors hover:text-ink"
          >
            Ingresar
          </Link>
          <CtaLink
            href="/signup"
            ctaId="header_primary"
            location="landing_header"
            label="Crear mi plan de estudio"
            size="sm"
          />
        </nav>
      </PageContainer>
    </StickyHeader>
  );
}
