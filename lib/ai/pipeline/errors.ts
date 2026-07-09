export class PipelineError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly stage?: string,
  ) {
    super(message);
    this.name = "PipelineError";
  }
}

export function isPipelineError(error: unknown): error is PipelineError {
  return error instanceof PipelineError;
}
