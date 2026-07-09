import type { SupabaseClient } from "@supabase/supabase-js";

export interface UnlockResult {
  nextLessonId: string | null;
  nextLessonTitle: string | null;
  unitCompleted: boolean;
  completedUnitOrder: number | null;
}

/**
 * Desbloquea el siguiente nodo/lección tras aprobar — spec 14.
 */
export async function unlockNextLesson(
  supabase: SupabaseClient,
  examId: string,
  lessonId: string,
): Promise<UnlockResult> {
  const { data: current } = await supabase
    .from("lessons")
    .select("id, unit_id, order_index, title, study_units(order_index)")
    .eq("id", lessonId)
    .eq("exam_id", examId)
    .maybeSingle();

  if (!current) {
    return {
      nextLessonId: null,
      nextLessonTitle: null,
      unitCompleted: false,
      completedUnitOrder: null,
    };
  }

  const unitOrder =
    (current.study_units as { order_index?: number } | null)?.order_index ?? 0;

  const { data: nextInUnit } = await supabase
    .from("lessons")
    .select("id, title, status")
    .eq("exam_id", examId)
    .eq("unit_id", current.unit_id)
    .gt("order_index", current.order_index ?? 0)
    .order("order_index", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (nextInUnit) {
    if (nextInUnit.status === "locked") {
      await supabase
        .from("lessons")
        .update({ status: "available" })
        .eq("id", nextInUnit.id);
    }

    return {
      nextLessonId: nextInUnit.id,
      nextLessonTitle: nextInUnit.title,
      unitCompleted: false,
      completedUnitOrder: null,
    };
  }

  const { data: unitLessons } = await supabase
    .from("lessons")
    .select("id, status")
    .eq("exam_id", examId)
    .eq("unit_id", current.unit_id);

  const allDone =
    unitLessons?.every((l) => l.status === "completed" || l.id === lessonId) ??
    false;

  const { data: nextUnit } = await supabase
    .from("study_units")
    .select("id, order_index")
    .eq("exam_id", examId)
    .gt("order_index", unitOrder)
    .order("order_index", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (nextUnit) {
    const { data: firstLesson } = await supabase
      .from("lessons")
      .select("id, title, status")
      .eq("exam_id", examId)
      .eq("unit_id", nextUnit.id)
      .order("order_index", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (firstLesson && firstLesson.status === "locked") {
      await supabase
        .from("lessons")
        .update({ status: "available" })
        .eq("id", firstLesson.id);
    }

    return {
      nextLessonId: firstLesson?.id ?? null,
      nextLessonTitle: firstLesson?.title ?? null,
      unitCompleted: allDone,
      completedUnitOrder: allDone ? unitOrder : null,
    };
  }

  return {
    nextLessonId: null,
    nextLessonTitle: null,
    unitCompleted: allDone,
    completedUnitOrder: allDone ? unitOrder : null,
  };
}

export async function markLessonCompletedInTrack(
  supabase: SupabaseClient,
  lessonId: string,
): Promise<void> {
  await supabase
    .from("lessons")
    .update({ status: "completed" })
    .eq("id", lessonId);
}
