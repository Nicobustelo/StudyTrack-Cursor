"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

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

interface PaymentStatusResponse {
  status?: string;
  hasPremiumAccess?: boolean;
  planType?: string;
  examId?: string;
  error?: string;
}

const POLL_INTERVAL_MS = 2500;
const MAX_POLLS = 24;

export function CheckoutSuccessClient() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const [status, setStatus] = useState<string>("pending");
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [loading, setLoading] = useState(() => Boolean(paymentId));
  const [generatingMessage, setGeneratingMessage] = useState(false);
  const [examId, setExamId] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId) return;

    let cancelled = false;
    let polls = 0;

    async function pollStatus() {
      try {
        const response = await fetch(
          `/api/checkout/status?payment_id=${encodeURIComponent(paymentId!)}`,
        );
        const data = (await response.json()) as PaymentStatusResponse;

        if (cancelled) return;

        if (!response.ok) {
          setLoading(false);
          return;
        }

        setStatus(data.status ?? "pending");
        setHasPremiumAccess(Boolean(data.hasPremiumAccess));
        setExamId(data.examId ?? null);

        if (data.status === "approved" || data.hasPremiumAccess) {
          setLoading(false);
          setGeneratingMessage(true);

          captureClientEvent(ANALYTICS_EVENTS.CHECKOUT_SUCCESS, {
            exam_id: data.examId,
            plan_type: data.planType,
            is_premium: true,
          });

          if (data.hasPremiumAccess) {
            captureClientEvent(ANALYTICS_EVENTS.PREMIUM_UNLOCKED, {
              exam_id: data.examId,
              plan_type: data.planType,
              is_premium: true,
            });
          }

          return;
        }

        polls += 1;
        if (polls < MAX_POLLS && (data.status === "pending" || !data.status)) {
          window.setTimeout(() => void pollStatus(), POLL_INTERVAL_MS);
        } else {
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }

    void pollStatus();

    return () => {
      cancelled = true;
    };
  }, [paymentId]);

  const approved = status === "approved" || hasPremiumAccess;

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          {loading ? (
            <Loader2 className="size-7 animate-spin" />
          ) : (
            <CheckCircle2 className="size-7" />
          )}
        </div>
        <CardTitle>
          {approved
            ? "¡Pago confirmado!"
            : loading
              ? "Confirmando tu pago…"
              : "Estamos procesando tu pago"}
        </CardTitle>
        <CardDescription>
          {approved
            ? "Ya desbloqueaste el plan premium. Volvé a tu plan para seguir estudiando."
            : "Mercado Pago puede tardar unos segundos en confirmar el pago. No cierres esta pantalla."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 text-sm text-muted-foreground">
        {generatingMessage ? (
          <div className="rounded-lg border border-dashed bg-muted/40 p-4">
            <p className="font-medium text-foreground">
              Tu plan premium ya está activo
            </p>
            <p className="mt-1">
              Las unidades premium de tu camino ya están desbloqueadas. Volvé a
              tu plan para seguir estudiando.
            </p>
          </div>
        ) : null}

        {!paymentId ? (
          <p className="text-destructive">
            No encontramos el identificador del pago. Si ya pagaste, revisá tu
            email de Mercado Pago o contactanos.
          </p>
        ) : null}
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        {examId ? (
          <Button render={<Link href={`/exams/${examId}/track`} />} className="w-full">
            Ir a mi plan
          </Button>
        ) : (
          <Button render={<Link href="/dashboard" />} className="w-full">
            Ir al dashboard
          </Button>
        )}
        <Button
          variant="outline"
          render={<Link href="/pricing" />}
          className="w-full"
        >
          Ver planes
        </Button>
      </CardFooter>
    </Card>
  );
}
