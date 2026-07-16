import type { Metadata } from "next";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Crear cuenta — StudyTrack",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <AuthPageShell
      title="Creá tu cuenta"
      description="En unos minutos tenés tu plan de estudio listo para empezar."
    >
      <SignupForm />
    </AuthPageShell>
  );
}
