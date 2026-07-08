-- study_sources
CREATE TABLE public.study_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name text,
  file_type text,
  storage_path text,
  raw_text text,
  source_kind text,
  processing_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER study_sources_set_updated_at
  BEFORE UPDATE ON public.study_sources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_study_sources_exam_id ON public.study_sources(exam_id);
CREATE INDEX idx_study_sources_user_id ON public.study_sources(user_id);

-- source_chunks
CREATE TABLE public.source_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES public.study_sources(id) ON DELETE CASCADE,
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  chunk_index integer,
  content text,
  summary text,
  embedding extensions.vector(1536),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_source_chunks_source_id ON public.source_chunks(source_id);
CREATE INDEX idx_source_chunks_exam_id ON public.source_chunks(exam_id);

-- past_exams
CREATE TABLE public.past_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  source_id uuid REFERENCES public.study_sources(id) ON DELETE SET NULL,
  title text,
  past_exam_kind text,
  teacher_match text,
  scope_match text,
  format_match text,
  year text,
  difficulty_perceived text,
  user_similarity_score integer,
  ai_similarity_score numeric,
  final_relevance_score numeric,
  user_notes text,
  analysis_summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER past_exams_set_updated_at
  BEFORE UPDATE ON public.past_exams
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_past_exams_exam_id ON public.past_exams(exam_id);
CREATE INDEX idx_past_exams_source_id ON public.past_exams(source_id);
