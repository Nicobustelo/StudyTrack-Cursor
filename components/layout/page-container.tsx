import * as React from "react";

import { cn } from "@/lib/utils";

type PageContainerProps = React.ComponentProps<"div"> & {
  /**
   * "default": columna mobile-first (max-w-md) para pantallas de la app.
   * "wide": ancho marketing/landing (max-w-5xl).
   */
  size?: "default" | "wide";
};

export function PageContainer({
  className,
  size = "default",
  ...props
}: PageContainerProps) {
  return (
    <div
      data-slot="page-container"
      className={cn(
        "mx-auto w-full px-5",
        size === "default" ? "max-w-md" : "max-w-5xl sm:px-8",
        className,
      )}
      {...props}
    />
  );
}
