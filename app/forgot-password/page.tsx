import type { Metadata } from "next";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Recuperar contraseña — StudyTrack",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell
      title="Recuperá tu cuenta"
      description="Ingresá tu email y te enviaremos un enlace seguro para elegir una contraseña nueva."
      backHref="/login"
      backLabel="Volver a ingresar"
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
