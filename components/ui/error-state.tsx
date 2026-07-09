import type { LucideIcon } from "lucide-react";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title?: string;
  message: string;
  icon?: LucideIcon;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
};

/** Estados de error humanos (spec 31). */
export function ErrorState({
  title = "Algo salió mal",
  message,
  icon: Icon = AlertCircle,
  retryLabel = "Reintentar",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-8 text-center",
        className,
      )}
    >
      <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <Icon className="size-6" />
      </span>
      <h2 className="text-base font-bold text-ink">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
        {message}
      </p>
      {onRetry ? (
        <Button
          variant="outline"
          size="default"
          className="mt-5"
          onClick={onRetry}
        >
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
