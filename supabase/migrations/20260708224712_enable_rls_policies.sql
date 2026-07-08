-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- exams
CREATE POLICY exams_select_own ON public.exams
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY exams_insert_own ON public.exams
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY exams_update_own ON public.exams
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY exams_delete_own ON public.exams
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- study_sources
CREATE POLICY study_sources_select_own ON public.study_sources
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY study_sources_insert_own ON public.study_sources
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY study_sources_update_own ON public.study_sources
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY study_sources_delete_own ON public.study_sources
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- source_chunks (via exams)
CREATE POLICY source_chunks_select_own ON public.source_chunks
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = source_chunks.exam_id AND e.user_id = (SELECT auth.uid())));

CREATE POLICY source_chunks_insert_own ON public.source_chunks
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = source_chunks.exam_id AND e.user_id = (SELECT auth.uid())));

CREATE POLICY source_chunks_update_own ON public.source_chunks
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = source_chunks.exam_id AND e.user_id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = source_chunks.exam_id AND e.user_id = (SELECT auth.uid())));

CREATE POLICY source_chunks_delete_own ON public.source_chunks
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = source_chunks.exam_id AND e.user_id = (SELECT auth.uid())));

-- past_exams (via exams)
CREATE POLICY past_exams_select_own ON public.past_exams
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = past_exams.exam_id AND e.user_id = (SELECT auth.uid())));

CREATE POLICY past_exams_insert_own ON public.past_exams
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = past_exams.exam_id AND e.user_id = (SELECT auth.uid())));

CREATE POLICY past_exams_update_own ON public.past_exams
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = past_exams.exam_id AND e.user_id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = past_exams.exam_id AND e.user_id = (SELECT auth.uid())));

CREATE POLICY past_exams_delete_own ON public.past_exams
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = past_exams.exam_id AND e.user_id = (SELECT auth.uid())));
