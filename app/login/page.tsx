import type { Metadata } from "next";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";
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
      : params.message === "password-updated"
        ? "Contraseña actualizada. Ya podés ingresar con la nueva."
        : params.error === "callback-failed"
          ? "No pudimos confirmar tu sesión. El enlace puede haber vencido."
          : null;

  return (
    <AuthPageShell
      title="Ingresar"
      description="Seguí tu plan donde lo dejaste."
      notice={
        banner ? (
          <p className="rounded-lg bg-brand-light px-3 py-2 text-sm font-medium text-brand-dark">
            {banner}
          </p>
        ) : null
      }
    >
      <LoginForm nextPath={sanitizeInternalPath(params.next)} />
    </AuthPageShell>
  );
}
