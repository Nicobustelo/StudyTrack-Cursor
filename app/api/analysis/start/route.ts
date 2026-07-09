import { NextResponse } from "next/server";

import {
  parseAnalysisRequestBody,
  pipelineErrorResponse,
} from "@/lib/api/pipeline-response";
import { startAnalysisPipeline } from "@/lib/ai/pipeline/orchestrator";
import { createServiceClient } from "@/lib/supabase/server";
import { captureServerEvent } from "@/lib/analytics/server";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

export const maxDuration = 60;

/**
 * Inicia el pipeline de análisis para un examen.
 * No ejecuta IA pesada — solo marca estado y devuelve la primera etapa pendiente.
 */
export async function POST(request: Request) {
  const route = "/api/analysis/start";
  let examId: string | undefined;
  let userId: string | undefined;

  try {
    const body = await request.json();
    ({ examId, userId } = parseAnalysisRequestBody(body));
    const supabase = createServiceClient();

    const progress = await startAnalysisPipeline(supabase, examId);

    if (userId) {
      captureServerEvent(userId, ANALYTICS_EVENTS.ANALYSIS_STARTED, {
        exam_id: examId,
      });
    }

    return NextResponse.json(progress);
  } catch (error) {
    return pipelineErrorResponse(error, {
      route,
      examId,
      userId,
      stage: "start",
    });
  }
}
