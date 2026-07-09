"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ANALYTICS_EVENTS,
  captureClientEvent,
} from "@/lib/analytics/client";
import type { PlanType } from "@/lib/payments/plans";
import { cn } from "@/lib/utils";

interface CheckoutButtonProps {
  planType: PlanType;
  examId: string;
  label?: string;
  className?: string;
  variant?: "default" | "secondary" | "outline";
  size?: "default" | "sm" | "lg";
  onCheckoutStart?: () => void;
  onCheckoutError?: (message: string) => void;
}

interface PreferenceResponse {
  init_point?: string;
  sandbox_init_point?: string;
  error?: string;
}

export function CheckoutButton({
  planType,
  examId,
  label = "Desbloquear este examen",
  className,
  variant = "default",
  size = "lg",
  onCheckoutStart,
  onCheckoutError,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    onCheckoutStart?.();

    captureClientEvent(ANALYTICS_EVENTS.PAYWALL_CTA_CLICKED, {
      exam_id: examId,
      plan_type: planType,
      is_premium: true,
    });

    captureClientEvent(ANALYTICS_EVENTS.CHECKOUT_STARTED, {
      exam_id: examId,
      plan_type: planType,
      is_premium: true,
    });

    try {
      const response = await fetch("/api/checkout/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType, examId }),
      });

      const data = (await response.json()) as PreferenceResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "No pudimos iniciar el checkout");
      }

      const redirectUrl = data.init_point ?? data.sandbox_init_point;
      if (!redirectUrl) {
        throw new Error("Mercado Pago no devolvió una URL de pago");
      }

      window.location.href = redirectUrl;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No pudimos iniciar el checkout";
      onCheckoutError?.(message);
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn("w-full", className)}
      disabled={loading}
      onClick={() => void handleCheckout()}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Redirigiendo a Mercado Pago…
        </>
      ) : (
        label
      )}
    </Button>
  );
}
