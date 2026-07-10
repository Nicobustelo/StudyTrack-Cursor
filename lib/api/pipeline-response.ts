import { NextResponse } from "next/server";

import { capturePipelineFailure } from "@/lib/analytics/server";
import { isPipelineError, PipelineError } from "@/lib/ai/pipeline/errors";
import { ModelJsonParseError } from "@/lib/ai/parse-model-json";

function toUserFacingPipelineMessage(error: unknown): string {
  if (error instanceof ModelJsonParseError) {
    return error.message;
  }
  if (error instanceof PipelineError) {
    return error.message;
  }
  if (error instanceof Error) {
    if (error.message.includes("Unexpected token")) {
      return "No pudimos interpretar la respuesta del modelo. Reintentá en unos segundos.";
    }
    return error.message;
  }
  return "Error interno del pipeline";
}

export function pipelineErrorResponse(
  error: unknown,
  context: {
    route: string;
    examId?: string;
    userId?: string;
    stage?: string;
  },
) {
  const statusCode = isPipelineError(error) ? error.statusCode : 500;
  const message = toUserFacingPipelineMessage(error);
  const stage = isPipelineError(error) ? error.stage : context.stage;

  console.error("Analysis pipeline failed", {
    route: context.route,
    examId: context.examId,
    stage,
    statusCode,
    message,
  });

  if (context.userId) {
    capturePipelineFailure(context.userId, {
      exam_id: context.examId,
      route: context.route,
      stage,
      status_code: statusCode,
      error_message: message,
    });
  }

  return NextResponse.json(
    {
      error: message,
      stage,
    },
    { status: statusCode },
  );
}

export function parseAnalysisRequestBody(body: unknown): {
  examId: string;
  userId?: string;
} {
  if (!body || typeof body !== "object") {
    throw new PipelineError("Body inválido", 400);
  }
  const { examId, userId } = body as { examId?: string; userId?: string };
  if (!examId || typeof examId !== "string") {
    throw new PipelineError("examId es obligatorio", 400);
  }
  return { examId, userId };
}
