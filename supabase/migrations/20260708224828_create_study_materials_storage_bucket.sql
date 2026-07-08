INSERT INTO storage.buckets (id, name, public)
VALUES ('study-materials', 'study-materials', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY study_materials_select_own ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'study-materials'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

CREATE POLICY study_materials_insert_own ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'study-materials'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

CREATE POLICY study_materials_delete_own ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'study-materials'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );
