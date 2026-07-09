import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("payment_id");

    if (!paymentId) {
      return NextResponse.json(
        { error: "payment_id requerido" },
        { status: 400 },
      );
    }

    const { data: payment, error } = await supabase
      .from("payments")
      .select("id, status, plan_type, exam_id, provider_payment_id, updated_at")
      .eq("id", paymentId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !payment) {
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
    }

    const { data: access } = await supabase
      .from("access_purchases")
      .select("id, status, plan_type, exam_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .or(
        payment.exam_id
          ? `exam_id.eq.${payment.exam_id},plan_type.eq.semester`
          : "plan_type.eq.semester",
      )
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      paymentId: payment.id,
      status: payment.status,
      planType: payment.plan_type,
      examId: payment.exam_id,
      hasPremiumAccess: Boolean(access),
      updatedAt: payment.updated_at,
    });
  } catch (error) {
    console.error("[checkout/status]", error);
    return NextResponse.json(
      { error: "No pudimos consultar el estado del pago" },
      { status: 500 },
    );
  }
}
