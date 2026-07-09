import type { Metadata } from "next";

import { ExamPageShell } from "@/components/exams/exam-page-shell";
import { MockExamsList } from "@/components/exams/mock-exams-list";
import { hasExamPremiumAccess } from "@/lib/access";
import { getDemoExamSnapshot } from "@/lib/demo/fallback-data";
import { requireExam } from "@/lib/exams/queries";

export const metadata: Metadata = {
  title: "Simulacros — StudyTrack",
};

type MockExamsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MockExamsPage({ params }: MockExamsPageProps) {
  const { id } = await params;
  const { user, exam } = await requireExam(id);
  const hasPremium = await hasExamPremiumAccess(user.id, id);
  const mockExams = getDemoExamSnapshot().mockExams;

  return (
    <ExamPageShell exam={exam} title="Simulacros">
      <div className="pb-6">
        <p className="mb-4 text-sm text-ink-muted">
          Practicá como si fuera el parcial real. Los simulacros calibrados usan
          tus exámenes anteriores.
        </p>
        <MockExamsList
          examId={id}
          mockExams={mockExams}
          hasPremium={hasPremium}
        />
      </div>
    </ExamPageShell>
  );
}
