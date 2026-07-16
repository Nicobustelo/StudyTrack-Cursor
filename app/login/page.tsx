import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/brand/logo";
import { AppShell } from "@/components/layout/app-shell";
import { sanitizeInternalPath } from "@/lib/auth/redirect";

export const metadata: Metadata = {
  title: "Ingresar — StudyTrack",
};

type LoginPageProps = {
  searchParams: Promise<{ message?: string; error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const banner =
    params.message === "confirm-email"
      ? "Te enviamos un email de confirmación. Revisá tu bandeja e ingresá cuando esté listo."
      : params.error;

  return (
    <AppShell mainClassName="items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="mt-8 rounded-2xl bg-surface p-6 shadow-card ring-1 ring-border sm:p-8">
          <h1 className="text-2xl text-ink">Ingresar</h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            Seguí tu plan donde lo dejaste.
          </p>

          {banner ? (
            <p className="mt-4 rounded-lg bg-brand-light px-3 py-2 text-sm font-medium text-brand-dark">
              {banner}
            </p>
          ) : null}

          <div className="mt-6">
            <LoginForm nextPath={sanitizeInternalPath(params.next)} />
          </div>
        </div>

        <p className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-ink-muted hover:text-ink"
          >
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
