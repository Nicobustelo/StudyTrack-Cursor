"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getClientAppUrl } from "@/lib/app-url";
import { humanizeAuthError } from "@/lib/auth/errors";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const supabase = createBrowserSupabaseClient();
      const callbackUrl = new URL("/auth/callback", getClientAppUrl());
      callbackUrl.searchParams.set("next", "/reset-password");

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        { redirectTo: callbackUrl.toString() },
      );

      if (resetError) {
        setError(humanizeAuthError(resetError.message, resetError.code));
        return;
      }

      setSentTo(normalizedEmail);
    } catch {
      setError("No pudimos conectar con el servidor. Revisá tu conexión.");
    } finally {
      setLoading(false);
    }
  }

  if (sentTo) {
    return (
      <div role="status" className="flex flex-col items-center text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-brand-light text-brand-dark">
          <MailCheck className="size-6" aria-hidden />
        </span>
        <p className="mt-4 text-sm font-bold text-ink">Revisá tu email</p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
          Si existe una cuenta para <strong>{sentTo}</strong>, vas a recibir un
          enlace para elegir una contraseña nueva.
        </p>
        <Button
          render={<Link href="/login" />}
          variant="outline"
          className="mt-5 w-full"
        >
          Volver a ingresar
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="recovery-email">Email</Label>
        <Input
          id="recovery-email"
          type="email"
          placeholder="vos@ejemplo.com"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-12 rounded-lg px-3.5"
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Enviando…" : "Enviar enlace de recuperación"}
      </Button>
    </form>
  );
}
