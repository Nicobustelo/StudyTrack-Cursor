import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  className?: string;
};

/** Estados vacíos (spec 30). */
export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  onCtaClick,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl bg-surface px-6 py-10 text-center shadow-card ring-1 ring-border",
        className,
      )}
    >
      {Icon ? (
        <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-light text-brand-dark">
          <Icon className="size-7" strokeWidth={2} />
        </span>
      ) : null}
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
        {subtitle}
      </p>
      {ctaLabel && ctaHref ? (
        <Link href={ctaHref} className="mt-6 w-full max-w-xs">
          <Button size="lg" className="w-full">
            {ctaLabel}
          </Button>
        </Link>
      ) : null}
      {ctaLabel && onCtaClick && !ctaHref ? (
        <Button size="lg" className="mt-6 w-full max-w-xs" onClick={onCtaClick}>
          {ctaLabel}
        </Button>
      ) : null}
    </div>
  );
}
