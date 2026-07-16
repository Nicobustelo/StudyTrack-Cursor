import * as React from "react";

import { cn } from "@/lib/utils";

type MobileShellProps = {
  /** Header sticky (idealmente un <StickyHeader />). */
  header?: React.ReactNode;
  /** Nav inferior fija (idealmente un <BottomNav />). */
  bottomNav?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Clases extra para el <main> dentro de la columna de contenido. */
  contentClassName?: string;
  /** Ancho de lectura en escritorio; móvil siempre conserva max-w-md. */
  desktopWidth?: "compact" | "content" | "wide";
};

/**
 * Shell adaptable para las pantallas de la app: conserva una columna max-w-md
 * en móvil y usa navegación lateral más contenido ampliado en escritorio.
 * Si hay bottom nav aplica pb-36 en móvil para que nunca tape contenido.
 */
export function MobileShell({
  header,
  bottomNav,
  children,
  className,
  contentClassName,
  desktopWidth = "content",
}: MobileShellProps) {
  const desktopWidthClass = {
    compact: "lg:max-w-xl",
    content: "lg:max-w-3xl",
    wide: "lg:max-w-none",
  }[desktopWidth];

  return (
    <div
      data-slot="mobile-shell"
      className={cn(
        "relative flex min-h-dvh w-full flex-col bg-background",
        className,
      )}
    >
      <div
        data-slot="mobile-shell-frame"
        className={cn(
          "mx-auto flex w-full flex-1",
          bottomNav
            ? "max-w-6xl lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-6 lg:px-6"
            : "max-w-6xl lg:px-6",
        )}
      >
        {bottomNav}
        <div
          className={cn(
            "mx-auto flex w-full max-w-md min-w-0 flex-1 flex-col lg:justify-self-center",
            desktopWidthClass,
          )}
        >
          {header}
          <main
            className={cn(
              "flex w-full min-w-0 flex-1 flex-col",
              bottomNav ? "pb-36 lg:pb-12" : "pb-10 lg:pb-14",
              contentClassName,
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
