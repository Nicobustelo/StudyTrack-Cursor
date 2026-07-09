"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { humanizeAuthError } from "@/lib/auth/errors";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña tiene que tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(humanizeAuthError(signUpError.message, signUpError.code));
        return;
      }

      if (!data.user) {
        setError("No pudimos crear tu cuenta. Intentá de nuevo.");
        return;
      }

      if (data.session) {
        router.push("/onboarding");
        router.refresh();
        return;
      }

      router.push("/login?message=confirm-email");
      router.refresh();
    } catch {
      setError("No pudimos conectar con el servidor. Revisá tu conexión.");
    } finally {
      setLoading(false);
    }
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
        {loading ? "Creando cuenta…" : "Crear mi track"}
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
