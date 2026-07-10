import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

import { getAppUrl } from "@/lib/app-url";

import type { PlanType } from "./plans";
import { getPlan } from "./plans";
import type { CheckoutPreferenceMetadata } from "./types";

function getAccessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN is not configured");
  }
  return token;
}

function getNotificationUrl(): string | undefined {
  const configured = process.env.MERCADOPAGO_NOTIFICATION_URL?.trim();
  if (configured) return configured;
  return `${getAppUrl()}/api/webhooks/mercadopago`;
}

function getMercadoPagoClient(): MercadoPagoConfig {
  return new MercadoPagoConfig({
    accessToken: getAccessToken(),
  });
}

export interface CreatePreferenceInput {
  paymentId: string;
  planType: PlanType;
  examId: string;
  userId: string;
}

export interface CreatePreferenceResult {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint?: string;
}

export async function createCheckoutPreference(
  input: CreatePreferenceInput,
): Promise<CreatePreferenceResult> {
  const plan = getPlan(input.planType);
  const appUrl = getAppUrl();
  const metadata: CheckoutPreferenceMetadata = {
    user_id: input.userId,
    exam_id: input.examId,
    plan_type: input.planType,
    payment_id: input.paymentId,
  };

  const preferenceBody: Parameters<Preference["create"]>[0]["body"] = {
    items: [
      {
        id: input.planType,
        title: `StudyTrack — ${plan.name}`,
        description: plan.description,
        quantity: 1,
        unit_price: plan.priceArs,
        currency_id: plan.currency,
      },
    ],
    back_urls: {
      success: `${appUrl}/checkout/success?payment_id=${input.paymentId}&exam_id=${input.examId}&plan_type=${input.planType}`,
      failure: `${appUrl}/checkout/failure?payment_id=${input.paymentId}&exam_id=${input.examId}&plan_type=${input.planType}`,
      pending: `${appUrl}/checkout/pending?payment_id=${input.paymentId}&exam_id=${input.examId}&plan_type=${input.planType}`,
    },
    external_reference: input.paymentId,
    metadata,
  };

  const notificationUrl = getNotificationUrl();
  if (notificationUrl?.startsWith("https://")) {
    preferenceBody.notification_url = notificationUrl;
  }

  if (appUrl.startsWith("https://")) {
    preferenceBody.auto_return = "approved";
  }

  const client = getMercadoPagoClient();
  const preference = new Preference(client);
  const response = await preference.create({ body: preferenceBody });

  if (!response.id || !response.init_point) {
    throw new Error("Mercado Pago did not return a valid preference");
  }

  return {
    preferenceId: String(response.id),
    initPoint: response.init_point,
    sandboxInitPoint: response.sandbox_init_point ?? undefined,
  };
}

export interface MercadoPagoPaymentDetails {
  id: string;
  status: string;
  status_detail?: string;
  external_reference?: string | null;
  metadata?: Record<string, unknown>;
  transaction_amount?: number;
  currency_id?: string;
}

const MP_STATUS_MAP: Record<string, string> = {
  approved: "approved",
  rejected: "rejected",
  cancelled: "cancelled",
  refunded: "refunded",
  charged_back: "refunded",
  pending: "pending",
  in_process: "pending",
  in_mediation: "pending",
};

export function mapMercadoPagoStatus(mpStatus: string): string {
  return MP_STATUS_MAP[mpStatus] ?? "pending";
}

export async function fetchMercadoPagoPayment(
  providerPaymentId: string,
): Promise<MercadoPagoPaymentDetails> {
  const client = getMercadoPagoClient();
  const payment = new Payment(client);
  const response = await payment.get({ id: providerPaymentId });

  return {
    id: String(response.id),
    status: response.status ?? "pending",
    status_detail: response.status_detail,
    external_reference: response.external_reference,
    metadata: response.metadata as Record<string, unknown> | undefined,
    transaction_amount: response.transaction_amount,
    currency_id: response.currency_id,
  };
}
