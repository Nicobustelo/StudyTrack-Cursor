import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { PageContainer } from "@/components/layout/page-container";

const LINKS = [
  { href: "/pricing", label: "Precios" },
  { href: "/login", label: "Ingresar" },
  { href: "/signup", label: "Crear cuenta" },
];

export function LandingFooter() {
  return (
    <footer className="bg-ink py-12 text-white">
      <PageContainer size="wide" className="flex flex-col gap-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Logo tone="dark" />
          <nav className="flex items-center gap-6">
            {LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-bold text-white/70 transition-colors hover:text-white"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-white/10 pt-6 text-center sm:text-left">
          {/* Disclaimer discreto (spec 34) */}
          <p className="mx-auto max-w-2xl text-xs leading-relaxed text-white/50 sm:mx-0">
            StudyTrack te ayuda a organizar y practicar tu estudio, pero no
            garantiza una nota específica. Los resultados dependen de tu
            preparación, materiales y desempeño real en el examen.
          </p>
          <p className="mt-4 text-xs font-medium text-white/40">
            © {new Date().getFullYear()} StudyTrack
          </p>
        </div>
      </PageContainer>
    </footer>
  );
}
