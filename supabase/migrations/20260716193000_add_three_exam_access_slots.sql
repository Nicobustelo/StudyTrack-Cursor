-- Cada compra del pack de 3 exámenes puede vincular hasta tres exámenes.
-- La tabla separada conserva `access_purchases.exam_id` para compatibilidad
-- con compras de un examen y con registros existentes.
CREATE TABLE public.access_purchase_exams (
  access_purchase_id uuid NOT NULL
    REFERENCES public.access_purchases(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (access_purchase_id, exam_id)
);

CREATE INDEX idx_access_purchase_exams_user_exam
  ON public.access_purchase_exams(user_id, exam_id);

ALTER TABLE public.access_purchase_exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY access_purchase_exams_select_own
  ON public.access_purchase_exams
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Las compras existentes ya consumieron su primer cupo con `exam_id`.
INSERT INTO public.access_purchase_exams (
  access_purchase_id,
  user_id,
  exam_id
)
SELECT id, user_id, exam_id
FROM public.access_purchases
WHERE plan_type = 'three_exams'
  AND exam_id IS NOT NULL
ON CONFLICT (access_purchase_id, exam_id) DO NOTHING;

-- Reclama de forma atómica el próximo cupo disponible. Solo service_role
-- puede ejecutarla; además valida que el examen pertenezca al usuario.
CREATE OR REPLACE FUNCTION public.claim_three_exam_access(
  p_user_id uuid,
  p_exam_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  purchase_record record;
  claimed_count integer;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.exams
    WHERE id = p_exam_id
      AND user_id = p_user_id
  ) THEN
    RETURN false;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.access_purchase_exams ape
    JOIN public.access_purchases ap ON ap.id = ape.access_purchase_id
    WHERE ape.user_id = p_user_id
      AND ape.exam_id = p_exam_id
      AND ap.status = 'active'
      AND ap.plan_type = 'three_exams'
      AND (ap.starts_at IS NULL OR ap.starts_at <= now())
      AND (ap.expires_at IS NULL OR ap.expires_at > now())
  ) THEN
    RETURN true;
  END IF;

  FOR purchase_record IN
    SELECT ap.id
    FROM public.access_purchases ap
    WHERE ap.user_id = p_user_id
      AND ap.status = 'active'
      AND ap.plan_type = 'three_exams'
      AND (ap.starts_at IS NULL OR ap.starts_at <= now())
      AND (ap.expires_at IS NULL OR ap.expires_at > now())
    ORDER BY ap.created_at ASC
    FOR UPDATE
  LOOP
    SELECT count(*)::integer
    INTO claimed_count
    FROM public.access_purchase_exams
    WHERE access_purchase_id = purchase_record.id;

    IF claimed_count < 3 THEN
      INSERT INTO public.access_purchase_exams (
        access_purchase_id,
        user_id,
        exam_id
      )
      VALUES (purchase_record.id, p_user_id, p_exam_id)
      ON CONFLICT (access_purchase_id, exam_id) DO NOTHING;

      RETURN true;
    END IF;
  END LOOP;

  RETURN false;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_three_exam_access(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_three_exam_access(uuid, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.claim_three_exam_access(uuid, uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.claim_three_exam_access(uuid, uuid) TO service_role;
