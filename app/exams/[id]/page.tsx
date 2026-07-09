import { redirect } from "next/navigation";

import { requireExam } from "@/lib/exams/queries";

type ExamPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ExamDetailPage({ params }: ExamPageProps) {
  const { id } = await params;
  await requireExam(id);
  redirect(`/exams/${id}/track`);
}
