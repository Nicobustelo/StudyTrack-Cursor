import type { Metadata } from "next";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Elegir contraseña — StudyTrack",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <AuthPageShell
      title="Elegí una contraseña nueva"
      description="Usá al menos 8 caracteres y evitá reutilizar una contraseña de otra cuenta."
      backHref="/forgot-password"
      backLabel="Pedir otro enlace"
    >
      <ResetPasswordForm />
    </AuthPageShell>
  );
}
