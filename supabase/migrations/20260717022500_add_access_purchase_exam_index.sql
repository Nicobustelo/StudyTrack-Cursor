-- Cubre la clave foránea de exam_id para que las bajas/cascadas y consultas
-- por examen no requieran recorrer toda la tabla de asignaciones.
CREATE INDEX idx_access_purchase_exams_exam_id
  ON public.access_purchase_exams(exam_id);
