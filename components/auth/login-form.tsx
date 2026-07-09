"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { humanizeAuthError } from "@/lib/auth/errors";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (signInError) {
        setError(humanizeAuthError(signInError.message, signInError.code));
        return;
      }

      if (!data.user) {
        setError("No pudimos iniciar sesión. Intentá de nuevo.");
        return;
      }

      const { count } = await supabase
        .from("exams")
        .select("id", { count: "exact", head: true })
        .eq("user_id", data.user.id);

      router.push((count ?? 0) > 0 ? "/dashboard" : "/onboarding");
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
          placeholder="••••••••"
          autoComplete="current-password"
          required
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
        {loading ? "Ingresando…" : "Ingresar"}
      </Button>

      <p className="text-center text-sm font-medium text-ink-muted">
        ¿Todavía no tenés cuenta?{" "}
        <Link
          href="/signup"
          className="font-bold text-brand-dark hover:text-brand"
        >
          Crear mi track
        </Link>
      </p>
    </form>
  );
}
