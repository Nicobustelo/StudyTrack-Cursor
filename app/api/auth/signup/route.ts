import { NextResponse } from "next/server";

import { getAuthCallbackUrl, getRequestOrigin } from "@/lib/app-url";
import { humanizeAuthError } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/server";

interface SignupBody {
  email?: string;
  password?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupBody;
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { error: "Revisá que el email esté bien escrito." },
        { status: 400 },
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña tiene que tener al menos 8 caracteres." },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const callbackUrl = new URL(
      getAuthCallbackUrl(getRequestOrigin(request)),
    );
    callbackUrl.searchParams.set("next", "/onboarding");

    const { data: created, error: createError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: callbackUrl.toString() },
    });

    if (createError) {
      return NextResponse.json(
        { error: humanizeAuthError(createError.message, createError.code) },
        { status: 400 },
      );
    }

    if (!created.user) {
      return NextResponse.json(
        { error: "No pudimos crear tu cuenta. Intentá de nuevo." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      requiresEmailConfirmation: !created.session,
    });
  } catch {
    return NextResponse.json(
      { error: "No pudimos conectar con el servidor. Revisá tu conexión." },
      { status: 500 },
    );
  }
}
