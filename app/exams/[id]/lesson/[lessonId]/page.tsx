import type { Metadata } from "next";

import { LessonScreen } from "@/components/lessons/lesson-screen";
import { loadLessonScreenData } from "@/lib/lessons/data";
import { getQuizIdForLesson } from "@/lib/lessons/actions";

export const metadata: Metadata = {
  title: "Lección — StudyTrack",
};

interface LessonPageProps {
  params: Promise<{ id: string; lessonId: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id: examId, lessonId } = await params;
  const data = await loadLessonScreenData(examId, lessonId);
  const quizId = await getQuizIdForLesson(examId, lessonId);

  return (
    <LessonScreen
      examId={data.examId}
      lessonId={data.lessonId}
      quizId={quizId}
      title={data.title}
      summary={data.summary}
      content={data.content}
      targetGrade={data.targetGrade}
      passingScore={data.passingScore}
      exercises={data.exercises}
      trackBackUrl={data.trackBackUrl}
      mode="lesson"
      showContent
    />
  );
}
