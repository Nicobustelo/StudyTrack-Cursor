-- lesson_progress
CREATE TABLE public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  status text,
  best_score numeric,
  attempts integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER lesson_progress_set_updated_at
  BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_lesson_progress_user_exam ON public.lesson_progress(user_id, exam_id);
CREATE INDEX idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);

-- readiness_scores
CREATE TABLE public.readiness_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score numeric,
  topic_mastery_score numeric,
  coverage_score numeric,
  quiz_performance_score numeric,
  recency_score numeric,
  consistency_score numeric,
  time_risk_score numeric,
  explanation text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_readiness_scores_exam_id ON public.readiness_scores(exam_id);
CREATE INDEX idx_readiness_scores_user_id ON public.readiness_scores(user_id);

-- payments
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_id uuid REFERENCES public.exams(id) ON DELETE SET NULL,
  plan_type text,
  provider text NOT NULL DEFAULT 'mercadopago',
  provider_payment_id text,
  provider_preference_id text,
  status text,
  amount numeric,
  currency text NOT NULL DEFAULT 'ARS',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER payments_set_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_exam_id ON public.payments(exam_id);

-- access_purchases
CREATE TABLE public.access_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_id uuid REFERENCES public.exams(id) ON DELETE SET NULL,
  plan_type text,
  status text,
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER access_purchases_set_updated_at
  BEFORE UPDATE ON public.access_purchases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_access_purchases_user_id ON public.access_purchases(user_id);
CREATE INDEX idx_access_purchases_exam_id ON public.access_purchases(exam_id);

-- daily_activity (streak tracking)
CREATE TABLE public.daily_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  activity_date date NOT NULL,
  xp_earned integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT daily_activity_user_exam_date_unique UNIQUE (user_id, exam_id, activity_date)
);

CREATE INDEX idx_daily_activity_user_id ON public.daily_activity(user_id);
CREATE INDEX idx_daily_activity_exam_id ON public.daily_activity(exam_id);
