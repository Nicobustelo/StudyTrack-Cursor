import type { ReactNode } from "react";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { AppShell } from "@/components/layout/app-shell";

interface AuthPageShellProps {
  title: string;
  description: string;
  children: ReactNode;
  notice?: ReactNode;
  backHref?: string;
  backLabel?: string;
}

export function AuthPageShell({
  title,
  description,
  children,
  notice,
  backHref = "/",
  backLabel = "Volver al inicio",
}: AuthPageShellProps) {
  return (
    <AppShell mainClassName="items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="mt-8 rounded-2xl bg-surface p-6 shadow-card ring-1 ring-border sm:p-8">
          <h1 className="text-2xl text-ink">{title}</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
            {description}
          </p>

          {notice ? <div className="mt-4">{notice}</div> : null}

          <div className="mt-6">{children}</div>
        </div>

        <p className="mt-6 text-center">
          <Link
            href={backHref}
            className="text-sm font-medium text-ink-muted hover:text-ink"
          >
            ← {backLabel}
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
