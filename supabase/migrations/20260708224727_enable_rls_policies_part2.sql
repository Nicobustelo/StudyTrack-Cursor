-- past_exam_questions (via exams)
CREATE POLICY past_exam_questions_select_own ON public.past_exam_questions
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = past_exam_questions.exam_id AND e.user_id = (SELECT auth.uid())));

CREATE POLICY past_exam_questions_insert_own ON public.past_exam_questions
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = past_exam_questions.exam_id AND e.user_id = (SELECT auth.uid())));

CREATE POLICY past_exam_questions_update_own ON public.past_exam_questions
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = past_exam_questions.exam_id AND e.user_id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = past_exam_questions.exam_id AND e.user_id = (SELECT auth.uid())));

CREATE POLICY past_exam_questions_delete_own ON public.past_exam_questions
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = past_exam_questions.exam_id AND e.user_id = (SELECT auth.uid())));

-- topics (via exams)
CREATE POLICY topics_select_own ON public.topics
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = topics.exam_id AND e.user_id = (SELECT auth.uid())));

CREATE POLICY topics_insert_own ON public.topics
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = topics.exam_id AND e.user_id = (SELECT auth.uid())));

CREATE POLICY topics_update_own ON public.topics
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = topics.exam_id AND e.user_id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = topics.exam_id AND e.user_id = (SELECT auth.uid())));

CREATE POLICY topics_delete_own ON public.topics
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = topics.exam_id AND e.user_id = (SELECT auth.uid())));

-- study_units (via exams)
CREATE POLICY study_units_select_own ON public.study_units
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = study_units.exam_id AND e.user_id = (SELECT auth.uid())));

CREATE POLICY study_units_insert_own ON public.study_units
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = study_units.exam_id AND e.user_id = (SELECT auth.uid())));

CREATE POLICY study_units_update_own ON public.study_units
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = study_units.exam_id AND e.user_id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = study_units.exam_id AND e.user_id = (SELECT auth.uid())));

CREATE POLICY study_units_delete_own ON public.study_units
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = study_units.exam_id AND e.user_id = (SELECT auth.uid())));

-- lessons (via exams)
CREATE POLICY lessons_select_own ON public.lessons
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = lessons.exam_id AND e.user_id = (SELECT auth.uid())));

CREATE POLICY lessons_insert_own ON public.lessons
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = lessons.exam_id AND e.user_id = (SELECT auth.uid())));

CREATE POLICY lessons_update_own ON public.lessons
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = lessons.exam_id AND e.user_id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = lessons.exam_id AND e.user_id = (SELECT auth.uid())));

CREATE POLICY lessons_delete_own ON public.lessons
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = lessons.exam_id AND e.user_id = (SELECT auth.uid())));
