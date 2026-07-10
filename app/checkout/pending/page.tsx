"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Clock3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ANALYTICS_EVENTS,
  captureClientEvent,
} from "@/lib/analytics/client";

export default function CheckoutPendingPage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4 py-12">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando…</p>}>
        <CheckoutPendingContent />
      </Suspense>
    </main>
  );
}

function CheckoutPendingContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");

  useEffect(() => {
    captureClientEvent(ANALYTICS_EVENTS.CHECKOUT_PENDING, {
      is_premium: false,
    });
  }, []);

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <Clock3 className="size-7" />
        </div>
        <CardTitle>Pago pendiente</CardTitle>
        <CardDescription>
          Mercado Pago está procesando tu pago. Te avisamos cuando se confirme.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>
          Algunos medios de pago pueden demorar. Cuando se apruebe, vas a ver
          el premium desbloqueado en tu plan.
        </p>
        {paymentId ? (
          <>
            <p className="text-xs">Referencia: {paymentId}</p>
            <Button
              variant="outline"
              render={
                <Link
                  href={`/checkout/success?payment_id=${encodeURIComponent(paymentId)}`}
                />
              }
              className="w-full"
            >
              Ver estado del pago
            </Button>
          </>
        ) : null}
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Button render={<Link href="/dashboard" />} className="w-full">
          Volver al dashboard
        </Button>
      </CardFooter>
    </Card>
  );
}
