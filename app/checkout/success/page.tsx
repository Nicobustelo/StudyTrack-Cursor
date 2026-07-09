import { Suspense } from "react";

import { CheckoutSuccessClient } from "./checkout-success-client";

export default function CheckoutSuccessPage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Cargando resultado…</p>
        }
      >
        <CheckoutSuccessClient />
      </Suspense>
    </main>
  );
}
