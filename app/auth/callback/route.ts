import { NextResponse } from "next/server";

import { getRequestOrigin } from "@/lib/app-url";
import { resolvePostAuthPath } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

/** Callback mínimo para confirmación de email / magic links. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = getRequestOrigin(request);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("No pudimos confirmar tu sesión. Intentá ingresar de nuevo.")}`,
    );
  }

  const destination =
    next ?? (await resolvePostAuthPath(data.user.id));

  return NextResponse.redirect(`${origin}${destination}`);
}
