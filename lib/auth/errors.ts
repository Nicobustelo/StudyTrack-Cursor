/** Mensajes humanos para errores de auth (spec 31). */

const AUTH_ERROR_MAP: Record<string, string> = {
  invalid_credentials:
    "Email o contraseña incorrectos. Revisalos e intentá de nuevo.",
  invalid_login_credentials:
    "Email o contraseña incorrectos. Revisalos e intentá de nuevo.",
  email_not_confirmed:
    "Tenés que confirmar tu email antes de ingresar. Revisá tu bandeja de entrada.",
  user_already_registered:
    "Ya existe una cuenta con ese email. Probá ingresar o recuperar tu contraseña.",
  user_already_exists:
    "Ya existe una cuenta con ese email. Probá ingresar o recuperar tu contraseña.",
  email_exists:
    "Ya existe una cuenta con ese email. Probá ingresar o recuperar tu contraseña.",
  weak_password:
    "La contraseña es muy débil. Usá al menos 8 caracteres con letras y números.",
  signup_disabled: "El registro está deshabilitado por ahora. Probá más tarde.",
  over_request_rate_limit:
    "Demasiados intentos seguidos. Esperá un minuto e intentá de nuevo.",
  over_email_send_rate_limit:
    "Demasiados intentos seguidos. Esperá un minuto e intentá de nuevo.",
  invalid_email: "Revisá que el email esté bien escrito.",
  email_address_invalid: "Revisá que el email esté bien escrito.",
  email_address_not_authorized:
    "No podemos registrar ese email. Probá con otra dirección.",
  redirect_url_not_allowed:
    "No pudimos completar el registro desde esta URL. Volvé a intentar desde el sitio principal.",
  validation_failed:
    "No pudimos crear tu cuenta con esos datos. Revisalos e intentá de nuevo.",
};

function isExistingAccountMessage(normalized: string): boolean {
  return (
    normalized.includes("user already registered") ||
    normalized.includes("already been registered") ||
    normalized.includes("already exists") ||
    normalized.includes("email address already")
  );
}

function isInvalidEmailMessage(normalized: string): boolean {
  return (
    normalized.includes("invalid email") ||
    normalized.includes("email address is invalid") ||
    normalized.includes("unable to validate email") ||
    normalized.includes("must be a valid email") ||
    normalized.includes("not a valid email")
  );
}

function isRedirectMessage(normalized: string): boolean {
  return (
    normalized.includes("redirect") ||
    normalized.includes("redirect_to") ||
    normalized.includes("redirect url")
  );
}

function isRateLimitMessage(normalized: string): boolean {
  return (
    normalized.includes("rate limit") ||
    normalized.includes("too many requests") ||
    normalized.includes("too many attempts")
  );
}

export function humanizeAuthError(
  message?: string | null,
  code?: string | null,
): string {
  if (code && AUTH_ERROR_MAP[code]) {
    return AUTH_ERROR_MAP[code];
  }

  const normalized = (message ?? "").toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return AUTH_ERROR_MAP.invalid_login_credentials;
  }
  if (isExistingAccountMessage(normalized)) {
    return AUTH_ERROR_MAP.user_already_registered;
  }
  if (isRateLimitMessage(normalized)) {
    return AUTH_ERROR_MAP.over_request_rate_limit;
  }
  if (isRedirectMessage(normalized)) {
    return AUTH_ERROR_MAP.redirect_url_not_allowed;
  }
  if (normalized.includes("password")) {
    return AUTH_ERROR_MAP.weak_password;
  }
  if (isInvalidEmailMessage(normalized)) {
    return AUTH_ERROR_MAP.invalid_email;
  }

  return (
    message ??
    "Algo salió mal. Intentá de nuevo en unos segundos."
  );
}
