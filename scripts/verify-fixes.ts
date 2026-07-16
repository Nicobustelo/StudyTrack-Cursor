import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";

import { isSupportedMaterialFile } from "../components/onboarding/file-upload-step";
import {
  ModelJsonParseError,
  callModelWithJsonRetry,
  parseModelJson,
} from "../lib/ai/parse-model-json";
import {
  humanizeExtractionError,
  isUnrecoverableFailedSource,
  isUsableRawText,
  sourceNeedsStorageExtraction,
} from "../lib/ai/domain/text-extraction";
import { sanitizeInternalPath } from "../lib/auth/redirect";
import { computeScorePercent } from "../lib/lessons/passing-score";
import {
  parseSignatureHeader,
  verifyMercadoPagoWebhookSignature,
} from "../lib/payments/webhook-signature";
import {
  buildStudyMaterialStoragePath,
  sanitizeStorageFileName,
} from "../lib/storage/sanitize-key";

async function verifyModelJsonParsing() {
  assert.deepEqual(parseModelJson('{"ok":true}'), { ok: true });
  assert.deepEqual(parseModelJson("\uFEFF{\"ok\":true}"), { ok: true });
  assert.deepEqual(parseModelJson('```json\n{"ok":true}\n```'), { ok: true });
  assert.deepEqual(parseModelJson('Resultado:\n{"ok":true}\nFin'), { ok: true });
  assert.deepEqual(parseModelJson('Texto previo [1,{"ok":true}] texto posterior'), [
    1,
    { ok: true },
  ]);
  assert.deepEqual(
    parseModelJson('Texto previo {"items":[{"name":"} dentro de string"}]} fin'),
    { items: [{ name: "} dentro de string" }] },
  );
  assert.throws(
    () => parseModelJson("Modo usuario: esto no es JSON"),
    ModelJsonParseError,
  );

  let attempts = 0;
  const retried = await callModelWithJsonRetry(
    async () => {
      attempts += 1;
      return attempts < 3 ? "No es JSON" : '{"ok":true}';
    },
    { maxRetries: 2 },
  );
  assert.deepEqual(retried, { ok: true });
  assert.equal(attempts, 3);

  let validationAttempts = 0;
  const validated = await callModelWithJsonRetry(
    async () => {
      validationAttempts += 1;
      return validationAttempts === 1 ? '{"ok":false}' : '{"ok":true}';
    },
    {
      maxRetries: 1,
      validate(value) {
        assert.deepEqual(value, { ok: true });
        return value;
      },
    },
  );
  assert.deepEqual(validated, { ok: true });
  assert.equal(validationAttempts, 2);
}

function verifyStorageKeys() {
  assert.equal(
    sanitizeStorageFileName(
      "Convención de los Derechos de las personas con Discapacidad.pdf",
    ),
    "Convencion_de_los_Derechos_de_las_personas_con_Discapacidad.pdf",
  );
  assert.equal(
    sanitizeStorageFileName("../../Observación № 6 / artículo 5?.pdf"),
    "articulo_5_.pdf",
  );
  assert.equal(sanitizeStorageFileName("   "), "file");

  const path = buildStudyMaterialStoragePath(
    "user-id",
    "exam-id",
    "Oferta y Demanda — capítulo 7.pdf",
    "past-exams",
  );
  assert.match(
    path,
    /^user-id\/exam-id\/past-exams\/\d+-Oferta_y_Demanda_capitulo_7\.pdf$/,
  );
  assert.doesNotMatch(path, /[^\x20-\x7E]/);
}

function verifyMaterialFileValidation() {
  assert.equal(
    isSupportedMaterialFile(
      new File(["pdf"], "apunte.pdf", { type: "application/pdf" }),
    ),
    true,
  );
  assert.equal(
    isSupportedMaterialFile(
      new File(["texto"], "apunte.markdown", {
        type: "application/octet-stream",
      }),
    ),
    true,
  );
  assert.equal(
    isSupportedMaterialFile(
      new File(["imagen"], "captura.png", { type: "image/png" }),
    ),
    false,
  );
  assert.equal(
    isSupportedMaterialFile(
      new File(["word"], "apunte.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }),
    ),
    false,
  );
}

function verifySourceExtractionGuards() {
  assert.equal(
    isUnrecoverableFailedSource({
      processing_status: "error",
      raw_text: null,
      storage_path: "user/exam/file.pdf",
    }),
    true,
  );
  assert.equal(
    sourceNeedsStorageExtraction({
      processing_status: "error",
      raw_text: null,
      storage_path: "user/exam/file.pdf",
    }),
    false,
    "failed sources must not be retried forever",
  );
  assert.equal(
    sourceNeedsStorageExtraction({
      processing_status: "pending",
      raw_text: null,
      storage_path: "user/exam/file.pdf",
    }),
    true,
  );
  assert.equal(isUsableRawText("ERROR: something went wrong"), false);
  assert.equal(isUsableRawText("a".repeat(80)), true);

  assert.match(
    humanizeExtractionError(new Error("bad XRef entry")),
    /PDF|texto seleccionable|pegá/i,
  );
  assert.match(
    humanizeExtractionError(
      new Error("Tipo de archivo no soportado para extracción automática"),
    ),
    /PDF\/TXT|manualmente/i,
  );
}

function verifyPassingScoreGuards() {
  assert.equal(computeScorePercent(0, 0, 0), 100);
  assert.equal(computeScorePercent(0, 3, 3), 100);
  assert.equal(computeScorePercent(2, 4, 0), 50);
  assert.equal(computeScorePercent(2, 4, 1), 67);
}

function verifyAuthRedirectGuards() {
  assert.equal(
    sanitizeInternalPath("/exams/demo/track?paywall=1#current"),
    "/exams/demo/track?paywall=1#current",
  );
  assert.equal(sanitizeInternalPath("https://example.com/phishing"), null);
  assert.equal(sanitizeInternalPath("//example.com/phishing"), null);
  assert.equal(sanitizeInternalPath("/\\example.com/phishing"), null);
  assert.equal(sanitizeInternalPath("javascript:alert(1)"), null);
}

function verifyPublicSignupSafety() {
  const signupRoute = readFileSync(
    new URL("../app/api/auth/signup/route.ts", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(signupRoute, /createAdminClient/);
  assert.doesNotMatch(signupRoute, /auth\.admin\.createUser/);
  assert.doesNotMatch(signupRoute, /email_confirm/);
  assert.match(signupRoute, /auth\.signUp/);
  assert.match(signupRoute, /emailRedirectTo/);
}

function verifyThreeExamAccessSafety() {
  const migration = readFileSync(
    new URL(
      "../supabase/migrations/20260716193000_add_three_exam_access_slots.sql",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(migration, /claim_three_exam_access/);
  assert.match(migration, /FOR UPDATE/);
  assert.match(migration, /claimed_count < 3/);
  assert.match(migration, /user_id = p_user_id/);
  assert.match(
    migration,
    /REVOKE ALL ON FUNCTION public\.claim_three_exam_access\(uuid, uuid\) FROM authenticated/,
  );
  assert.match(
    migration,
    /GRANT EXECUTE ON FUNCTION public\.claim_three_exam_access\(uuid, uuid\) TO service_role/,
  );
}

function verifyWebhookSignature() {
  const secret = "test_webhook_secret";
  const dataId = "999999999";
  const requestId = "req-abc-123";
  const ts = "1704908010";
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const v1 = createHmac("sha256", secret).update(manifest).digest("hex");

  assert.deepEqual(parseSignatureHeader(`ts=${ts},v1=${v1}`), { ts, v1 });
  assert.equal(
    verifyMercadoPagoWebhookSignature({
      xSignature: `ts=${ts},v1=${v1}`,
      xRequestId: requestId,
      dataId,
      secret,
    }),
    true,
  );
  assert.equal(
    verifyMercadoPagoWebhookSignature({
      xSignature: `ts=${ts},v1=${"0".repeat(v1.length)}`,
      xRequestId: requestId,
      dataId,
      secret,
    }),
    false,
  );
}

async function main() {
  await verifyModelJsonParsing();
  verifyStorageKeys();
  verifyMaterialFileValidation();
  verifySourceExtractionGuards();
  verifyPassingScoreGuards();
  verifyAuthRedirectGuards();
  verifyPublicSignupSafety();
  verifyThreeExamAccessSafety();
  verifyWebhookSignature();
  console.log("verify-fixes: all checks passed");
}

void main();
