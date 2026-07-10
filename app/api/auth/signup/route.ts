import { NextResponse } from "next/server";

import { humanizeAuthError } from "@/lib/auth/errors";
import { createAdminClient } from "@/lib/supabase/admin";
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

    const admin = createAdminClient();
    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
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

    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return NextResponse.json(
        { error: humanizeAuthError(signInError.message, signInError.code) },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "No pudimos conectar con el servidor. Revisá tu conexión." },
      { status: 500 },
    );
  }
}
