import * as React from "react";

import { cn } from "@/lib/utils";

type AppShellProps = {
  /** Header superior (idealmente un <StickyHeader />). */
  header?: React.ReactNode;
  /** Footer al final del documento (no fijo). */
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  mainClassName?: string;
};

/**
 * Shell genérico de página (landing, marketing, páginas anchas):
 * header opcional + main flexible + footer. Para pantallas de la app
 * privada con bottom nav usar <MobileShell />.
 */
export function AppShell({
  header,
  footer,
  children,
  className,
  mainClassName,
}: AppShellProps) {
  return (
    <div
      data-slot="app-shell"
      className={cn("flex min-h-dvh w-full flex-col bg-background", className)}
    >
      {header}
      <main className={cn("flex flex-1 flex-col", mainClassName)}>
        {children}
      </main>
      {footer}
    </div>
  );
}
