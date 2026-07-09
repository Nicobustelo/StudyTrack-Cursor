"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ExerciseErrorFallbackProps {
  onSkip: () => void;
}

/** Fallback obligatorio spec 41.1 — evita que el track quede trabado. */
export function ExerciseErrorFallback({ onSkip }: ExerciseErrorFallbackProps) {
  return (
    <Card className="border-dashed ring-amber-400/50">
      <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
        <p className="text-base font-semibold text-ink">
          Este ejercicio no se pudo cargar
        </p>
        <p className="text-sm text-ink-muted">
          Hubo un problema con el formato del ejercicio. Podés saltarlo para
          seguir con la lección.
        </p>
        <Button variant="outline" size="lg" onClick={onSkip}>
          Saltar
        </Button>
      </CardContent>
    </Card>
  );
}
