-- quizzes (via exams)
CREATE POLICY quizzes_select_own ON public.quizzes
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = quizzes.exam_id AND e.user_id = (SELECT auth.uid())));

CREATE POLICY quizzes_insert_own ON public.quizzes
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = quizzes.exam_id AND e.user_id = (SELECT auth.uid())));

CREATE POLICY quizzes_update_own ON public.quizzes
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = quizzes.exam_id AND e.user_id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = quizzes.exam_id AND e.user_id = (SELECT auth.uid())));

CREATE POLICY quizzes_delete_own ON public.quizzes
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = quizzes.exam_id AND e.user_id = (SELECT auth.uid())));

-- questions (via exams)
CREATE POLICY questions_select_own ON public.questions
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = questions.exam_id AND e.user_id = (SELECT auth.uid())));

CREATE POLICY questions_insert_own ON public.questions
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = questions.exam_id AND e.user_id = (SELECT auth.uid())));

CREATE POLICY questions_update_own ON public.questions
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = questions.exam_id AND e.user_id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = questions.exam_id AND e.user_id = (SELECT auth.uid())));

CREATE POLICY questions_delete_own ON public.questions
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = questions.exam_id AND e.user_id = (SELECT auth.uid())));

-- answers (user_id)
CREATE POLICY answers_select_own ON public.answers
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY answers_insert_own ON public.answers
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY answers_update_own ON public.answers
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY answers_delete_own ON public.answers
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- lesson_progress (user_id)
CREATE POLICY lesson_progress_select_own ON public.lesson_progress
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY lesson_progress_insert_own ON public.lesson_progress
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY lesson_progress_update_own ON public.lesson_progress
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY lesson_progress_delete_own ON public.lesson_progress
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- readiness_scores (user_id)
CREATE POLICY readiness_scores_select_own ON public.readiness_scores
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY readiness_scores_insert_own ON public.readiness_scores
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY readiness_scores_update_own ON public.readiness_scores
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY readiness_scores_delete_own ON public.readiness_scores
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));
