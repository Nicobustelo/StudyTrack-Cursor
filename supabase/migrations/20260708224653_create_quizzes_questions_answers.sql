-- quizzes
CREATE TABLE public.quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
  unit_id uuid REFERENCES public.study_units(id) ON DELETE CASCADE,
  title text,
  quiz_type text,
  passing_score numeric NOT NULL DEFAULT 70,
  is_premium boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER quizzes_set_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_quizzes_exam_id ON public.quizzes(exam_id);
CREATE INDEX idx_quizzes_lesson_id ON public.quizzes(lesson_id);
CREATE INDEX idx_quizzes_unit_id ON public.quizzes(unit_id);

-- questions
CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES public.topics(id) ON DELETE SET NULL,
  question_type text,
  prompt text,
  options jsonb,
  correct_answer jsonb,
  explanation text,
  difficulty numeric,
  source_reference text,
  past_exam_influence_score numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_questions_quiz_id ON public.questions(quiz_id);
CREATE INDEX idx_questions_exam_id ON public.questions(exam_id);
CREATE INDEX idx_questions_topic_id ON public.questions(topic_id);

-- answers
CREATE TABLE public.answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  answer jsonb,
  is_correct boolean,
  score numeric,
  feedback text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_answers_user_id ON public.answers(user_id);
CREATE INDEX idx_answers_exam_id ON public.answers(exam_id);
CREATE INDEX idx_answers_quiz_id ON public.answers(quiz_id);
CREATE INDEX idx_answers_question_id ON public.answers(question_id);
