import type { Metadata } from "next";
import Link from "next/link";

import { SignupForm } from "@/components/auth/signup-form";
import { Logo } from "@/components/brand/logo";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Crear cuenta — StudyTrack",
};

export default function SignupPage() {
  return (
    <AppShell mainClassName="items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="mt-8 rounded-2xl bg-surface p-6 shadow-card ring-1 ring-border sm:p-8">
          <h1 className="text-2xl text-ink">Creá tu cuenta</h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            En unos minutos tenés tu plan de estudio listo para empezar.
          </p>

          <div className="mt-6">
            <SignupForm />
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
