"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { humanizeAuthError } from "@/lib/auth/errors";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña tiene que tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(humanizeAuthError(updateError.message, updateError.code));
        return;
      }

      await supabase.auth.signOut();
      router.replace("/login?message=password-updated");
      router.refresh();
    } catch {
      setError("El enlace puede haber vencido. Pedí uno nuevo e intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-password">Contraseña nueva</Label>
        <Input
          id="new-password"
          type="password"
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-12 rounded-lg px-3.5"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirm-password">Repetir contraseña</Label>
        <Input
          id="confirm-password"
          type="password"
          placeholder="Repetí la contraseña"
          autoComplete="new-password"
          minLength={8}
          required
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          className="h-12 rounded-lg px-3.5"
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Guardando…" : "Guardar contraseña"}
      </Button>
    </form>
  );
}
