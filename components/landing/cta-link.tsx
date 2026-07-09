"use client";

import Link from "next/link";
import type { VariantProps } from "class-variance-authority";

import { buttonVariants } from "@/components/ui/button";
import { useAnalytics } from "@/hooks/use-analytics";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

type CtaLinkProps = {
  href: string;
  ctaId: string;
  location: string;
  label: string;
  className?: string;
} & VariantProps<typeof buttonVariants>;

/** Link con estilo de botón físico que instrumenta `cta_clicked` (spec 20). */
export function CtaLink({
  href,
  ctaId,
  location,
  label,
  variant,
  size,
  className,
}: CtaLinkProps) {
  const { capture } = useAnalytics();

  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant, size }), className)}
      onClick={() =>
        capture(ANALYTICS_EVENTS.CTA_CLICKED, {
          cta_id: ctaId,
          cta_label: label,
          location,
        })
      }
    >
      {label}
    </Link>
  );
}
