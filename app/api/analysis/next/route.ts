import { NextResponse } from "next/server";

import {
  parseAnalysisRequestBody,
  pipelineErrorResponse,
} from "@/lib/api/pipeline-response";
import { runNextPipelineStep } from "@/lib/ai/pipeline/orchestrator";
import { createServiceClient } from "@/lib/supabase/server";
import { captureServerEvent } from "@/lib/analytics/server";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

export const maxDuration = 60;

/**
 * Ejecuta exactamente una unidad de trabajo del pipeline (máx. 1 lección con 2 llamadas IA).
 * El cliente debe hacer loop mientras `hasMore === true` — spec 41.1.
 */
export async function POST(request: Request) {
  const route = "/api/analysis/next";
  let examId: string | undefined;
  let userId: string | undefined;

  try {
    const body = await request.json();
    ({ examId, userId } = parseAnalysisRequestBody(body));
    const supabase = createServiceClient();

    const progress = await runNextPipelineStep(supabase, examId);

    if (userId) {
      if (progress.completedStage === "generate_track") {
        captureServerEvent(userId, ANALYTICS_EVENTS.TRACK_GENERATED, {
          exam_id: examId,
        });
      }

      if (!progress.hasMore) {
        captureServerEvent(userId, ANALYTICS_EVENTS.ANALYSIS_COMPLETED, {
          exam_id: examId,
        });
      }
    }

    return NextResponse.json(progress);
  } catch (error) {
    return pipelineErrorResponse(error, {
      route,
      examId,
      userId,
    });
  }
}
