import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Mis exámenes — StudyTrack",
};

export default async function ExamsPage() {
  redirect("/dashboard");
}
