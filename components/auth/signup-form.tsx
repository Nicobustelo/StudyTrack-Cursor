"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña tiene que tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        requiresEmailConfirmation?: boolean;
      };

      if (!response.ok || payload.error) {
        setError(payload.error ?? "No pudimos crear tu cuenta. Intentá de nuevo.");
        return;
      }

      if (payload.requiresEmailConfirmation) {
        setConfirmationEmail(email.trim().toLowerCase());
        return;
      }

      router.push("/onboarding");
      router.refresh();
    } catch {
      setError("No pudimos conectar con el servidor. Revisá tu conexión.");
    } finally {
      setLoading(false);
    }
  }

  if (confirmationEmail) {
    return (
      <div role="status" className="flex flex-col items-center text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-brand-light text-brand-dark">
          <MailCheck className="size-6" aria-hidden />
        </span>
        <p className="mt-4 text-sm font-bold text-ink">Confirmá tu email</p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
          Enviamos un enlace a <strong>{confirmationEmail}</strong>. Abrilo para
          activar tu cuenta y empezar el onboarding.
        </p>
        <Button
          render={<Link href="/login" />}
          variant="outline"
          className="mt-5 w-full"
        >
          Ir a ingresar
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="vos@ejemplo.com"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 rounded-lg px-3.5"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 rounded-lg px-3.5"
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
        {loading ? "Creando cuenta…" : "Crear mi plan de estudio"}
      </Button>

      <p className="text-center text-sm font-medium text-ink-muted">
        ¿Ya tenés cuenta?{" "}
        <Link
          href="/login"
          className="font-bold text-brand-dark hover:text-brand"
        >
          Ingresar
        </Link>
      </p>
    </form>
  );
}
