import assert from "node:assert/strict";

import { isSupportedMaterialFile } from "../components/onboarding/file-upload-step";
import {
  ModelJsonParseError,
  callModelWithJsonRetry,
  parseModelJson,
} from "../lib/ai/parse-model-json";
import { humanizeAuthError } from "../lib/auth/errors";
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

function verifyAuthErrors() {
  assert.equal(
    humanizeAuthError(
      "A user with this email address has already been registered",
      "email_exists",
    ),
    "Ya existe una cuenta con ese email. Probá ingresar o recuperar tu contraseña.",
  );
  assert.equal(
    humanizeAuthError("User already registered", "user_already_exists"),
    "Ya existe una cuenta con ese email. Probá ingresar o recuperar tu contraseña.",
  );
  assert.equal(
    humanizeAuthError("Unable to validate email address: invalid format"),
    "Revisá que el email esté bien escrito.",
  );
  assert.equal(
    humanizeAuthError("redirect_to: redirect url is not allowed"),
    "No pudimos completar el registro desde esta URL. Volvé a intentar desde el sitio principal.",
  );
  assert.equal(
    humanizeAuthError("Too many requests", "over_email_send_rate_limit"),
    "Demasiados intentos seguidos. Esperá un minuto e intentá de nuevo.",
  );
}

async function main() {
  await verifyModelJsonParsing();
  verifyStorageKeys();
  verifyMaterialFileValidation();
  verifyAuthErrors();
  console.log("verify-fixes: all checks passed");
}

void main();
