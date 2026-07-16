import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";

test.use({
  baseURL: process.env.STUDYTRACK_BASE_URL ?? "http://localhost:3000",
  viewport: { width: 390, height: 844 },
});

function loadEnvFile(filename: string) {
  const filePath = resolve(process.cwd(), filename);
  if (!existsSync(filePath)) return;

  const content = readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] ||= value;
  }
}

loadEnvFile(".env.local");

const qaEmail = process.env.STUDYTRACK_QA_EMAIL;
const qaPassword = process.env.STUDYTRACK_QA_PASSWORD;
const qaExamId = process.env.STUDYTRACK_QA_EXAM_ID;
const runCheckout = process.env.STUDYTRACK_QA_CHECKOUT === "1";

function getBaseUrl() {
  return process.env.STUDYTRACK_BASE_URL ?? "http://localhost:3000";
}

function getAuthCookieName(supabaseUrl: string) {
  const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
  return `sb-${projectRef}-auth-token`;
}

async function authenticateWithQaSession(page: Page) {
  if (!qaEmail || !qaPassword) {
    throw new Error("Missing STUDYTRACK_QA_EMAIL/STUDYTRACK_QA_PASSWORD");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase browser env");
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: qaEmail,
    password: qaPassword,
  });

  if (error || !data.session) {
    throw error ?? new Error("No Supabase session returned");
  }

  await page.context().addCookies([
    {
      name: getAuthCookieName(supabaseUrl),
      value: `base64-${Buffer.from(JSON.stringify(data.session)).toString("base64url")}`,
      url: getBaseUrl(),
      sameSite: "Lax",
      httpOnly: false,
      expires: Math.floor(Date.now() / 1000) + 60 * 60,
    },
  ]);
}

function attachErrorGuards(page: Page) {
  const browserErrors: string[] = [];
  const serverErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      browserErrors.push(message.text());
    }
  });

  page.on("pageerror", (error) => {
    browserErrors.push(error.message);
  });

  page.on("response", (response) => {
    if (response.status() >= 500) {
      serverErrors.push(`${response.status()} ${response.url()}`);
    }
  });

  return {
    assertClean() {
      expect(serverErrors, "No HTTP 5xx responses should occur").toEqual([]);
      expect(browserErrors, "No browser console/page errors should occur").toEqual([]);
    },
  };
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(
    dimensions.scrollWidth,
    `Page should not overflow horizontally (${dimensions.scrollWidth}px > ${dimensions.clientWidth}px)`,
  ).toBeLessThanOrEqual(dimensions.clientWidth);
}

test("public smoke: landing, auth pages, onboarding guard and checkout guard", async ({
  page,
  request,
}) => {
  const guards = attachErrorGuards(page);

  const landing = await page.goto("/");
  expect(landing?.status()).toBeLessThan(500);
  await expectNoHorizontalOverflow(page);
  await expect(
    page.getByRole("heading", { name: /Convertí tus apuntes en/i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Crear mi plan de estudio" }).first()).toBeVisible();
  await expect(page.getByText("Un camino claro hasta el examen.")).toBeVisible();
  await expect(page.getByText("Pagás por examen, no por suscripción.")).toBeVisible();
  await expect(page.locator("#track").getByText("Reto diario")).toBeVisible();

  await page.goto("/signup");
  await expectNoHorizontalOverflow(page);
  await expect(page.getByRole("heading", { name: "Creá tu cuenta" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Contraseña")).toBeVisible();

  await page.goto("/login");
  await expectNoHorizontalOverflow(page);
  await expect(page.getByRole("heading", { name: "Ingresar" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Contraseña")).toBeVisible();
  await expect(page.getByRole("link", { name: "¿La olvidaste?" })).toBeVisible();

  await page.goto("/forgot-password");
  await expectNoHorizontalOverflow(page);
  await expect(
    page.getByRole("heading", { name: "Recuperá tu cuenta" }),
  ).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();

  await page.goto("/reset-password");
  await expectNoHorizontalOverflow(page);
  await expect(
    page.getByRole("heading", { name: "Elegí una contraseña nueva" }),
  ).toBeVisible();
  await expect(page.getByLabel("Contraseña nueva")).toBeVisible();
  await expect(page.getByLabel("Repetir contraseña")).toBeVisible();

  await page.goto("/pricing");
  await expectNoHorizontalOverflow(page);
  await expect(
    page.getByRole("heading", {
      name: "Pagás por examen, no por suscripción.",
    }),
  ).toBeVisible();
  await expect(page.getByText("1 plan completo, sin vencimiento")).toBeVisible();
  await expect(
    page.getByText("Hasta 3 planes completos, sin vencimiento"),
  ).toBeVisible();
  await expect(
    page.getByText("Todos tus planes durante 6 meses"),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Probar gratis primero" }),
  ).toHaveCount(3);

  await page.goto("/exams");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Ingresar" })).toBeVisible();

  await page.goto("/onboarding");
  await expect(page).toHaveURL(/\/signup$/);
  await expect(page.getByRole("heading", { name: "Creá tu cuenta" })).toBeVisible();

  const checkout = await request.post("/api/checkout/preference", {
    data: { planType: "one_exam", examId: "demo" },
  });
  expect(checkout.status()).toBe(401);

  guards.assertClean();
});

test("authenticated smoke: track, paywall, checkout API and lesson fallback", async ({
  page,
}) => {
  test.skip(
    !qaEmail || !qaPassword || !qaExamId,
    "Set STUDYTRACK_QA_EMAIL, STUDYTRACK_QA_PASSWORD and STUDYTRACK_QA_EXAM_ID to run authenticated smoke.",
  );

  const guards = attachErrorGuards(page);
  await authenticateWithQaSession(page);

  await page.goto(`/exams/${qaExamId}/track`);
  await expect(page.getByText("Análisis Matemático 2")).toBeVisible();
  await expect(page.locator('[data-slot="path-node"]').first()).toBeVisible();
  await expect(page.locator('[data-current="true"]')).toHaveCount(1);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(
    page.getByRole("heading", { name: "Extremos y optimización" }),
  ).toBeVisible();

  await page.locator('[data-status="premium_locked"]').first().click();
  await expect(
    page.getByRole("heading", {
      name: "Desbloqueá tu plan completo para este examen.",
    }),
  ).toBeVisible();
  await page.keyboard.press("Escape");

  if (runCheckout) {
    const preference = await page.request.post("/api/checkout/preference", {
      data: { planType: "one_exam", examId: qaExamId },
    });
    expect(preference.status()).toBe(200);
    const body = (await preference.json()) as { init_point?: string };
    expect(body.init_point).toMatch(/^https:\/\/.*mercadopago/i);
  }

  const currentNode = page.locator('[data-current="true"]');
  await currentNode.scrollIntoViewIfNeeded();
  await currentNode.click();
  await expect(page).toHaveURL(/\/exams\/[^/]+\/lesson\/[^/]+/);
  await expect(page.getByRole("heading")).toBeVisible();

  const startExercises = page.getByRole("button", { name: "Empezar ejercicios" });
  if (await startExercises.isVisible()) {
    await startExercises.click();
  }

  await page.getByRole("button", { name: "2xy" }).click();
  await expect(page.getByText("¡Correcto!")).toBeVisible();
  await page.getByRole("button", { name: "Continuar" }).click();

  await page.getByRole("button", { name: "Falso" }).click();
  await expect(page.getByText("¡Correcto!")).toBeVisible();
  await page.getByRole("button", { name: "Continuar" }).click();

  await page.getByRole("button", { name: "límite" }).click();
  await expect(page.getByText("¡Correcto!")).toBeVisible();
  await page.getByRole("button", { name: "Continuar" }).click();

  await expect(page.getByText("Lección completada")).toBeVisible();
  await page.getByRole("button", { name: "Volver al plan" }).click();
  await expect(page).toHaveURL(new RegExp(`/exams/${qaExamId}/track$`));
  await expect(page.locator('[data-current="true"]')).toHaveCount(1);

  guards.assertClean();
});
