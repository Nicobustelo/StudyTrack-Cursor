import * as React from "react";

import { cn } from "@/lib/utils";

type MobileShellProps = {
  /** Header sticky (idealmente un <StickyHeader />). */
  header?: React.ReactNode;
  /** Nav inferior fija (idealmente un <BottomNav />). */
  bottomNav?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Clases extra para el <main> (la columna centrada max-w-md). */
  contentClassName?: string;
};

/**
 * Shell mobile-first para las pantallas de la app: columna centrada max-w-md.
 * Si hay bottom nav aplica pb-36 (> pb-32 mínimo de la spec 41.3) para que
 * la nav nunca tape contenido ni intercepte clicks.
 */
export function MobileShell({
  header,
  bottomNav,
  children,
  className,
  contentClassName,
}: MobileShellProps) {
  return (
    <div
      data-slot="mobile-shell"
      className={cn(
        "relative flex min-h-dvh w-full flex-col bg-background",
        className,
      )}
    >
      {header}
      <main
        className={cn(
          "mx-auto flex w-full max-w-md flex-1 flex-col",
          bottomNav ? "pb-36" : "pb-10",
          contentClassName,
        )}
      >
        {children}
      </main>
      {bottomNav}
    </div>
  );
}
