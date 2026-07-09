import { addLocalDays, formatLocalDate, recentLocalDates } from "@/lib/dates/local";
import {
  DEMO_EXAM_SUBJECT,
  DEMO_MOCK_EXAMS,
  DEMO_TOPICS,
  DEMO_UNITS,
} from "@/lib/demo/constants";
import type {
  DailyActivityRow,
  PastExamRow,
  StudyUnitRow,
  TopicRow,
} from "@/lib/exams/queries";

export type DemoExamSnapshot = {
  subjectName: string;
  examDate: string;
  targetGrade: string;
  readinessScore: number;
  streak: number;
  daysUntilExam: number;
  topics: TopicRow[];
  units: StudyUnitRow[];
  pastExams: PastExamRow[];
  dailyActivity: DailyActivityRow[];
  completedLessons: number;
  weakTopic: string;
  reviewItems: Array<{ title: string; reason: string; minutes: number }>;
  mockExams: typeof DEMO_MOCK_EXAMS;
};

export function getDemoExamSnapshot(): DemoExamSnapshot {
  const today = new Date();
  const examDate = formatLocalDate(addLocalDays(today, 10));
  const activityDates = recentLocalDates(3, today);

  const topics: TopicRow[] = DEMO_TOPICS.map((title, index) => ({
    id: `demo-topic-${index}`,
    title,
    mastery_score: index < 2 ? 72 : index < 4 ? 48 : 35,
    importance: 0.9 - index * 0.05,
    past_exam_frequency: index % 3 === 0 ? 3 : 1,
  }));

  const units: StudyUnitRow[] = DEMO_UNITS.map((unit, index) => ({
    id: `demo-unit-${index}`,
    title: unit.title,
    order_index: index + 1,
    is_premium: unit.is_premium,
  }));

  const pastExams: PastExamRow[] = [
    {
      id: "demo-past-1",
      title: "Parcial 2024",
      past_exam_kind: "parcial",
      final_relevance_score: 8,
      user_similarity_score: 8,
      ai_similarity_score: 7.5,
      analysis_summary:
        "Mismo profesor · Formato mixto · 12 preguntas · foco en definiciones y casos",
    },
    {
      id: "demo-past-2",
      title: "Parcial 2023",
      past_exam_kind: "parcial",
      final_relevance_score: 7,
      user_similarity_score: 7,
      ai_similarity_score: 6.8,
      analysis_summary:
        "Temas parecidos · 10 preguntas · mucho cálculo de gradiente",
    },
  ];

  const dailyActivity: DailyActivityRow[] = activityDates.map((date, i) => ({
    activity_date: date,
    xp_earned: 20 + i * 5,
  }));

  return {
    subjectName: DEMO_EXAM_SUBJECT,
    examDate,
    targetGrade: "8+",
    readinessScore: 42,
    streak: 3,
    daysUntilExam: 10,
    topics,
    units,
    pastExams,
    dailyActivity,
    completedLessons: 4,
    weakTopic: "Multiplicadores de Lagrange",
    reviewItems: [
      {
        title: "Derivadas parciales",
        reason: "Fallaste 2 ejercicios ayer",
        minutes: 5,
      },
      {
        title: "Multiplicadores de Lagrange",
        reason: "Tema débil · aparece en parciales",
        minutes: 12,
      },
      {
        title: "Plano tangente",
        reason: "Hace 4 días que no lo repasás",
        minutes: 7,
      },
    ],
    mockExams: DEMO_MOCK_EXAMS,
  };
}
