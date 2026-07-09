import type { Metadata } from "next";

import { LessonScreen } from "@/components/lessons/lesson-screen";
import { loadQuizScreenData } from "@/lib/lessons/data";

export const metadata: Metadata = {
  title: "Quiz — StudyTrack",
};

interface QuizPageProps {
  params: Promise<{ id: string; quizId: string }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { id: examId, quizId } = await params;
  const data = await loadQuizScreenData(examId, quizId);

  return (
    <LessonScreen
      examId={data.examId}
      lessonId={data.lessonId ?? undefined}
      quizId={data.quizId}
      title={data.title}
      summary={null}
      content={null}
      targetGrade={data.targetGrade}
      passingScore={data.passingScore}
      exercises={data.exercises}
      trackBackUrl={data.trackBackUrl}
      mode="quiz"
      showContent={false}
    />
  );
}
