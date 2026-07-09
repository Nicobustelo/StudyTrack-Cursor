import { redirect } from "next/navigation";

/** Nuevo examen → onboarding (spec 7). */
export default function NewExamPage() {
  redirect("/onboarding");
}
