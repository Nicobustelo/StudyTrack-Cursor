import { computeAccessExpiry } from "@/lib/access";
import { ANALYTICS_EVENTS, captureServerEvent } from "@/lib/analytics/server";
import {
  fetchMercadoPagoPayment,
  mapMercadoPagoStatus,
  type MercadoPagoPaymentDetails,
} from "@/lib/payments/mercadopago";
import { isPlanType } from "@/lib/payments/plans";
import type { PlanType } from "@/lib/payments/plans";
import type { PaymentStatus } from "@/lib/payments/types";
import { createAdminClient } from "@/lib/supabase/admin";

interface PaymentRow {
  id: string;
  user_id: string;
  exam_id: string | null;
  plan_type: string | null;
  status: string | null;
  provider_payment_id: string | null;
}

function asPlanType(value: string | null | undefined): PlanType | null {
  if (!value || !isPlanType(value)) return null;
  return value;
}

function readMetadataString(
  metadata: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  const value = metadata?.[key];
  return typeof value === "string" ? value : undefined;
}

async function loadPaymentByReference(
  paymentId: string,
): Promise<PaymentRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("payments")
    .select(
      "id, user_id, exam_id, plan_type, status, provider_payment_id",
    )
    .eq("id", paymentId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load payment ${paymentId}: ${error.message}`);
  }

  return data;
}

async function grantPremiumAccess(
  payment: PaymentRow,
  planType: PlanType,
): Promise<void> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const expiresAt = computeAccessExpiry(planType);
  const examId = planType === "semester" ? null : payment.exam_id;

  const { data: existing } = await supabase
    .from("access_purchases")
    .select("id")
    .eq("user_id", payment.user_id)
    .eq("status", "active")
    .eq("plan_type", planType)
    .eq("exam_id", examId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("access_purchases")
      .update({
        status: "active",
        starts_at: now,
        expires_at: expiresAt,
        updated_at: now,
      })
      .eq("id", existing.id);
    return;
  }

  await supabase.from("access_purchases").insert({
    user_id: payment.user_id,
    exam_id: examId,
    plan_type: planType,
    status: "active",
    starts_at: now,
    expires_at: expiresAt,
  });
}

export async function processMercadoPagoPaymentNotification(
  providerPaymentId: string,
): Promise<{ ok: true; status: PaymentStatus } | { ok: false; reason: string }> {
  const mpPayment = await fetchMercadoPagoPayment(providerPaymentId);
  const mappedStatus = mapMercadoPagoStatus(mpPayment.status) as PaymentStatus;

  const paymentId =
    mpPayment.external_reference ??
    readMetadataString(mpPayment.metadata, "payment_id");

  if (!paymentId) {
    return { ok: false, reason: "missing_external_reference" };
  }

  const payment = await loadPaymentByReference(paymentId);
  if (!payment) {
    return { ok: false, reason: "payment_not_found" };
  }

  const supabase = createAdminClient();
  const alreadyApproved = payment.status === "approved";
  const alreadyLinked =
    payment.provider_payment_id &&
    payment.provider_payment_id === providerPaymentId;

  if (!alreadyLinked || payment.status !== mappedStatus) {
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        status: mappedStatus,
        provider_payment_id: providerPaymentId,
        amount: mpPayment.transaction_amount ?? undefined,
        currency: mpPayment.currency_id ?? "ARS",
      })
      .eq("id", payment.id);

    if (updateError) {
      throw new Error(`Failed to update payment: ${updateError.message}`);
    }
  }

  const planType =
    asPlanType(payment.plan_type) ??
    asPlanType(readMetadataString(mpPayment.metadata, "plan_type"));

  if (mappedStatus === "approved" && planType) {
    if (!alreadyApproved) {
      await grantPremiumAccess(payment, planType);

      captureServerEvent(payment.user_id, ANALYTICS_EVENTS.PREMIUM_UNLOCKED, {
        exam_id: payment.exam_id ?? undefined,
        plan_type: planType,
        is_premium: true,
      });
    }
  }

  return { ok: true, status: mappedStatus };
}

export function extractProviderPaymentId(
  requestUrl: string,
  body: unknown,
): string | null {
  const url = new URL(requestUrl);
  const queryId = url.searchParams.get("id") ?? url.searchParams.get("data.id");
  if (queryId) return queryId;

  if (!body || typeof body !== "object") return null;

  const payload = body as {
    data?: { id?: string | number };
    id?: string | number;
    resource?: string;
    topic?: string;
  };

  if (payload.data?.id !== undefined) {
    return String(payload.data.id);
  }

  if (payload.topic === "payment" && payload.id !== undefined) {
    return String(payload.id);
  }

  return null;
}

export type { MercadoPagoPaymentDetails };
