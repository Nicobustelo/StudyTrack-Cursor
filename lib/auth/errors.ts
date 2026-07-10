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
  weak_password:
    "La contraseña es muy débil. Usá al menos 8 caracteres con letras y números.",
  signup_disabled: "El registro está deshabilitado por ahora. Probá más tarde.",
  over_request_rate_limit:
    "Demasiados intentos seguidos. Esperá un minuto e intentá de nuevo.",
  over_email_send_rate_limit:
    "Estamos enviando muchos emails. Esperá unos minutos e intentá de nuevo.",
  email_exists:
    "Ya existe una cuenta con ese email. Probá ingresar o recuperar tu contraseña.",
};

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
  if (normalized.includes("user already registered")) {
    return AUTH_ERROR_MAP.user_already_registered;
  }
  if (normalized.includes("password")) {
    return AUTH_ERROR_MAP.weak_password;
  }
  if (
    normalized.includes("email rate limit") ||
    normalized.includes("over_email_send_rate_limit")
  ) {
    return AUTH_ERROR_MAP.over_email_send_rate_limit;
  }
  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return AUTH_ERROR_MAP.over_request_rate_limit;
  }
  if (
    normalized.includes("invalid email") ||
    normalized.includes("unable to validate email") ||
    normalized.includes("email address is invalid") ||
    normalized.includes("malformed")
  ) {
    return "Revisá que el email esté bien escrito.";
  }
  if (normalized.includes("already") && normalized.includes("email")) {
    return AUTH_ERROR_MAP.user_already_registered;
  }

  return (
    message ??
    "Algo salió mal. Intentá de nuevo en unos segundos."
  );
}
