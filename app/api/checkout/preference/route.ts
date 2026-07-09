import { NextResponse } from "next/server";

import { ANALYTICS_EVENTS, captureServerEvent } from "@/lib/analytics/server";
import {
  createCheckoutPreference,
} from "@/lib/payments/mercadopago";
import { getPlan, isPlanType } from "@/lib/payments/plans";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

interface PreferenceRequestBody {
  planType?: string;
  examId?: string;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = (await request.json()) as PreferenceRequestBody;
    const { planType, examId } = body;

    if (!planType || !isPlanType(planType)) {
      return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
    }

    if (!examId) {
      return NextResponse.json({ error: "examId requerido" }, { status: 400 });
    }

    const { data: exam, error: examError } = await supabase
      .from("exams")
      .select("id")
      .eq("id", examId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (examError || !exam) {
      return NextResponse.json({ error: "Examen no encontrado" }, { status: 404 });
    }

    const plan = getPlan(planType);
    const admin = createAdminClient();

    const { data: payment, error: insertError } = await admin
      .from("payments")
      .insert({
        user_id: user.id,
        exam_id: examId,
        plan_type: planType,
        provider: "mercadopago",
        status: "pending",
        amount: plan.priceArs,
        currency: plan.currency,
      })
      .select("id")
      .single();

    if (insertError || !payment) {
      return NextResponse.json(
        { error: "No pudimos iniciar el pago" },
        { status: 500 },
      );
    }

    const preference = await createCheckoutPreference({
      paymentId: payment.id,
      planType,
      examId,
      userId: user.id,
    });

    const { error: updateError } = await admin
      .from("payments")
      .update({ provider_preference_id: preference.preferenceId })
      .eq("id", payment.id);

    if (updateError) {
      return NextResponse.json(
        { error: "No pudimos guardar la preferencia de pago" },
        { status: 500 },
      );
    }

    captureServerEvent(user.id, ANALYTICS_EVENTS.CHECKOUT_STARTED, {
      exam_id: examId,
      plan_type: planType,
      is_premium: true,
    });

    return NextResponse.json({
      paymentId: payment.id,
      preferenceId: preference.preferenceId,
      init_point: preference.initPoint,
      sandbox_init_point: preference.sandboxInitPoint,
    });
  } catch (error) {
    console.error("[checkout/preference]", error);
    return NextResponse.json(
      { error: "No pudimos crear el checkout" },
      { status: 500 },
    );
  }
}
