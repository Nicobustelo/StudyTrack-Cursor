import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser(loginPath = "/login") {
  const user = await getSessionUser();
  if (!user) {
    redirect(loginPath);
  }
  return user;
}

/** Tras login/signup: dashboard si ya tiene exámenes, si no onboarding. */
export async function resolvePostAuthPath(userId: string): Promise<string> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("exams")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  return (count ?? 0) > 0 ? "/dashboard" : "/onboarding";
}
