-- topics
CREATE TABLE public.topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  title text,
  summary text,
  importance numeric,
  difficulty numeric,
  estimated_minutes integer,
  source_references jsonb,
  past_exam_frequency integer NOT NULL DEFAULT 0,
  mastery_score numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER topics_set_updated_at
  BEFORE UPDATE ON public.topics
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_topics_exam_id ON public.topics(exam_id);

-- past_exam_questions
CREATE TABLE public.past_exam_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  past_exam_id uuid NOT NULL REFERENCES public.past_exams(id) ON DELETE CASCADE,
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  question_text text,
  question_type text,
  detected_topic_title text,
  topic_id uuid REFERENCES public.topics(id) ON DELETE SET NULL,
  difficulty numeric,
  expected_answer text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_past_exam_questions_past_exam_id ON public.past_exam_questions(past_exam_id);
CREATE INDEX idx_past_exam_questions_exam_id ON public.past_exam_questions(exam_id);
CREATE INDEX idx_past_exam_questions_topic_id ON public.past_exam_questions(topic_id);

-- study_units
CREATE TABLE public.study_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  title text,
  description text,
  order_index integer,
  is_premium boolean NOT NULL DEFAULT false,
  unlock_condition jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER study_units_set_updated_at
  BEFORE UPDATE ON public.study_units
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_study_units_exam_id ON public.study_units(exam_id);

-- lessons
CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  unit_id uuid NOT NULL REFERENCES public.study_units(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES public.topics(id) ON DELETE SET NULL,
  title text,
  summary text,
  content text,
  order_index integer,
  estimated_minutes integer,
  lesson_type text,
  is_premium boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'locked',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER lessons_set_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_lessons_exam_id ON public.lessons(exam_id);
CREATE INDEX idx_lessons_unit_id ON public.lessons(unit_id);
CREATE INDEX idx_lessons_topic_id ON public.lessons(topic_id);
