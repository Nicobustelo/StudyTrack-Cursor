import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(filename: string) {
  const filePath = resolve(process.cwd(), filename);
  if (!existsSync(filePath)) return;

  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] ||= value;
  }
}

function getArg(name: string) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

async function main() {
  loadEnvFile(".env.local");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !serviceRoleKey || !publicKey) {
    throw new Error("Missing Supabase QA credentials");
  }

  const baseUrl = getArg("--base-url") ?? "http://localhost:3000";
  const expectFailure = process.argv.includes("--expect-failure");
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const runId = randomUUID();
  const email = `qa-checkout-${runId}@studytrack.local`;
  const password = `Qa-${runId}-Checkout!`;
  let userId: string | null = null;
  let examId: string | null = null;
  let paymentId: string | null = null;

  try {
    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
    if (createError || !created.user) {
      throw createError ?? new Error("No checkout QA user returned");
    }
    userId = created.user.id;

    const { error: profileError } = await admin.from("profiles").upsert({
      id: userId,
      email,
      full_name: "QA Checkout",
    });
    if (profileError) throw profileError;

    const { data: exam, error: examError } = await admin
      .from("exams")
      .insert({
        user_id: userId,
        subject_name: `QA Checkout ${runId}`,
        exam_date: new Date(Date.now() + 7 * 86_400_000)
          .toISOString()
          .slice(0, 10),
        status: "ready",
      })
      .select("id")
      .single();
    if (examError || !exam) {
      throw examError ?? new Error("No checkout QA exam returned");
    }
    examId = exam.id;

    let cookies: Array<{ name: string; value: string }> = [];
    const authClient = createBrowserClient(supabaseUrl, publicKey, {
      cookies: {
        getAll: () => cookies,
        setAll: (nextCookies) => {
          cookies = nextCookies
            .filter((cookie) => Boolean(cookie.value))
            .map(({ name, value }) => ({ name, value }));
        },
      },
    });

    const { error: signInError } = await authClient.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) throw signInError;
    assert.ok(cookies.length > 0, "Supabase SSR auth cookies were not created");

    const response = await fetch(`${baseUrl}/api/checkout/preference`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: cookies.map(({ name, value }) => `${name}=${value}`).join("; "),
      },
      body: JSON.stringify({ planType: "one_exam", examId }),
    });
    const body = (await response.json()) as {
      paymentId?: string;
      preferenceId?: string;
      init_point?: string;
      sandbox_init_point?: string;
      error?: string;
    };

    if (expectFailure) {
      assert.equal(response.status, 500);
      assert.equal(
        body.error,
        "No pudimos crear el checkout. Intentá de nuevo.",
      );

      const { data: failedPayment, error: failedPaymentError } = await admin
        .from("payments")
        .select("id, status, provider_preference_id")
        .eq("exam_id", examId)
        .single();
      if (failedPaymentError || !failedPayment) {
        throw failedPaymentError ?? new Error("Failed payment was not persisted");
      }
      paymentId = failedPayment.id;
      assert.equal(failedPayment.status, "rejected");
      assert.equal(failedPayment.provider_preference_id, null);

      console.log(
        JSON.stringify({
          ok: true,
          status: response.status,
          safeErrorReturned: true,
          failedPaymentMarkedRejected: true,
        }),
      );
      return;
    }

    assert.equal(response.status, 200, body.error ?? JSON.stringify(body));
    assert.ok(body.paymentId);
    assert.ok(body.preferenceId);
    assert.ok(body.init_point);
    paymentId = body.paymentId;
    assert.equal(new URL(body.init_point).host, "www.mercadopago.com.ar");

    const { data: payment, error: paymentError } = await admin
      .from("payments")
      .select("id, status, provider_preference_id, plan_type, exam_id, user_id")
      .eq("id", paymentId)
      .single();
    if (paymentError || !payment) {
      throw paymentError ?? new Error("Checkout payment was not persisted");
    }
    assert.equal(payment.status, "pending");
    assert.equal(payment.provider_preference_id, body.preferenceId);
    assert.equal(payment.plan_type, "one_exam");
    assert.equal(payment.exam_id, examId);
    assert.equal(payment.user_id, userId);

    console.log(
      JSON.stringify({
        ok: true,
        status: response.status,
        preferenceCreated: true,
        paymentPersisted: true,
        initHost: new URL(body.init_point).host,
        sandboxHost: body.sandbox_init_point
          ? new URL(body.sandbox_init_point).host
          : null,
      }),
    );
  } finally {
    if (paymentId) {
      await admin.from("payments").delete().eq("id", paymentId);
    }
    if (examId) {
      await admin.from("exams").delete().eq("id", examId);
    }
    if (userId) {
      await admin.auth.admin.deleteUser(userId);
    }
  }
}

void main();
