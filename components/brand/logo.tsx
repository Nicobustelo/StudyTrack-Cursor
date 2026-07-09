import Link from "next/link";
import { Route } from "lucide-react";

import { cn } from "@/lib/utils";

type LogoProps = {
  /** "dark" para fondos oscuros (footer). */
  tone?: "default" | "dark";
  className?: string;
  href?: string;
};

export function Logo({ tone = "default", className, href = "/" }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2", className)}
      aria-label="StudyTrack — inicio"
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-white shadow-[0_2px_0_0_var(--st-green-dark)]">
        <Route className="size-5" strokeWidth={2.5} />
      </span>
      <span
        className={cn(
          "font-heading text-lg font-extrabold tracking-tight",
          tone === "dark" ? "text-white" : "text-ink",
        )}
      >
        Study<span className="text-brand">Track</span>
      </span>
    </Link>
  );
}
