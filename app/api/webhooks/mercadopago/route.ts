import { NextResponse } from "next/server";

import {
  extractProviderPaymentId,
  processMercadoPagoPaymentNotification,
} from "@/lib/payments/process-payment";
import { assertMercadoPagoWebhookSignature } from "@/lib/payments/webhook-signature";

export async function POST(request: Request) {
  try {
    const signature = assertMercadoPagoWebhookSignature(request);
    if (!signature.ok) {
      console.warn("[webhooks/mercadopago] invalid signature", signature.reason);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let body: unknown = null;
    try {
      body = await request.json();
    } catch {
      body = null;
    }

    const providerPaymentId = extractProviderPaymentId(request.url, body);

    if (!providerPaymentId) {
      return NextResponse.json({ received: true, skipped: "no_payment_id" });
    }

    const result = await processMercadoPagoPaymentNotification(providerPaymentId);

    if (!result.ok) {
      console.warn("[webhooks/mercadopago]", result.reason, providerPaymentId);
      return NextResponse.json({ received: true, skipped: result.reason });
    }

    return NextResponse.json({
      received: true,
      status: result.status,
    });
  } catch (error) {
    console.error("[webhooks/mercadopago]", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const signature = assertMercadoPagoWebhookSignature(request);
    if (!signature.ok) {
      console.warn("[webhooks/mercadopago] invalid signature", signature.reason);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const providerPaymentId = extractProviderPaymentId(request.url, null);

    if (!providerPaymentId) {
      return NextResponse.json({ received: true, skipped: "no_payment_id" });
    }

    const result = await processMercadoPagoPaymentNotification(providerPaymentId);

    if (!result.ok) {
      return NextResponse.json({ received: true, skipped: result.reason });
    }

    return NextResponse.json({
      received: true,
      status: result.status,
    });
  } catch (error) {
    console.error("[webhooks/mercadopago]", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
