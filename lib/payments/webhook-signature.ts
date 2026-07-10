import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Validación de firma de webhooks de Mercado Pago — spec 41.4.
 *
 * Compara strings con timingSafeEqual (NO Buffer.from(v1, "hex")).
 * Manifest: id:{data.id};request-id:{x-request-id};ts:{ts};
 */
export function getMercadoPagoWebhookSecret(): string | null {
  const secret =
    process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim() ||
    process.env.MERCADOPAGO_WEBHOOK_SIGNATURE?.trim() ||
    null;
  return secret || null;
}

export function parseSignatureHeader(xSignature: string | null): {
  ts: string | null;
  v1: string | null;
} {
  if (!xSignature?.trim()) return { ts: null, v1: null };

  let ts: string | null = null;
  let v1: string | null = null;

  for (const part of xSignature.split(",")) {
    const [rawKey, ...rest] = part.split("=");
    const key = rawKey?.trim();
    const value = rest.join("=").trim();
    if (!key || !value) continue;
    if (key === "ts") ts = value;
    if (key === "v1") v1 = value;
  }

  return { ts, v1 };
}

function safeEqualHex(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function verifyMercadoPagoWebhookSignature(input: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
  secret: string;
}): boolean {
  const { ts, v1 } = parseSignatureHeader(input.xSignature);
  if (!ts || !v1) return false;

  // data.id alfanumérico debe ir en minúsculas según docs de MP.
  const dataId = input.dataId?.trim()
    ? /[a-zA-Z]/.test(input.dataId)
      ? input.dataId.trim().toLowerCase()
      : input.dataId.trim()
    : "";

  const requestId = input.xRequestId?.trim() ?? "";

  const parts: string[] = [];
  if (dataId) parts.push(`id:${dataId}`);
  if (requestId) parts.push(`request-id:${requestId}`);
  parts.push(`ts:${ts}`);
  const manifest = `${parts.join(";")};`;

  const expected = createHmac("sha256", input.secret)
    .update(manifest)
    .digest("hex");

  return safeEqualHex(expected, v1);
}

export type WebhookSignatureResult =
  | { ok: true; skipped?: boolean }
  | { ok: false; reason: string };

/**
 * Valida la firma si hay secret configurado.
 * Sin secret (dev/local): permite el request y marca skipped.
 */
export function assertMercadoPagoWebhookSignature(request: Request): WebhookSignatureResult {
  const secret = getMercadoPagoWebhookSecret();
  if (!secret) {
    return { ok: true, skipped: true };
  }

  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");
  const url = new URL(request.url);
  const dataId =
    url.searchParams.get("data.id") ?? url.searchParams.get("id");

  const valid = verifyMercadoPagoWebhookSignature({
    xSignature,
    xRequestId,
    dataId,
    secret,
  });

  if (!valid) {
    return { ok: false, reason: "invalid_signature" };
  }

  return { ok: true };
}
