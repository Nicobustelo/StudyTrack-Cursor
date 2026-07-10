"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";

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

export default function CheckoutFailurePage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4 py-12">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando…</p>}>
        <CheckoutFailureContent />
      </Suspense>
    </main>
  );
}

function CheckoutFailureContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const examId = searchParams.get("exam_id");
  const planType = searchParams.get("plan_type");

  useEffect(() => {
    captureClientEvent(ANALYTICS_EVENTS.CHECKOUT_FAILURE, {
      exam_id: examId ?? undefined,
      plan_type: planType ?? undefined,
      is_premium: false,
    });
  }, [examId, planType]);

  return (
    <Card className="mx-auto w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
            <XCircle className="size-7" />
          </div>
          <CardTitle>No se pudo completar el pago</CardTitle>
          <CardDescription>
            El pago fue rechazado o cancelado. Podés intentar de nuevo con otro
            medio de pago.
          </CardDescription>
        </CardHeader>

        <CardContent className="text-sm text-muted-foreground">
          <p>
            Si el problema persiste, revisá los datos de tu tarjeta o probá con
            otro método en Mercado Pago.
          </p>
          {paymentId ? (
            <p className="mt-2 text-xs">Referencia: {paymentId}</p>
          ) : null}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button render={<Link href="/pricing" />} className="w-full">
            Intentar de nuevo
          </Button>
          <Button
            variant="outline"
            render={<Link href="/dashboard" />}
            className="w-full"
          >
            Volver al dashboard
          </Button>
        </CardFooter>
      </Card>
  );
}
