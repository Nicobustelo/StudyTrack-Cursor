import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Header sticky con fondo 100% opaco (spec 6.6 / 41.3): nada de
 * transparencias ni blur para que el contenido no se vea "fantasma" detrás.
 */
export function StickyHeader({
  className,
  children,
  ...props
}: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="sticky-header"
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border bg-background pt-[env(safe-area-inset-top)]",
        className,
      )}
      {...props}
    >
      {children}
    </header>
  );
}
