import OpenAI from "openai";

import { getOpenAIApiKey, getOpenAIModel } from "./config";
import { JSON_ONLY_INSTRUCTION } from "./constants";
import { callModelWithJsonRetry, type JsonRetryOptions } from "./parse-model-json";

let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: getOpenAIApiKey() });
  }
  return openaiClient;
}

function usesMaxCompletionTokens(model: string): boolean {
  const normalized = model.toLowerCase();
  return normalized.startsWith("gpt-5") || normalized.startsWith("o");
}

export interface ChatJsonOptions<T> extends JsonRetryOptions<T> {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Llamada server-side con `response_format: json_object` y parser tolerante.
 */
export async function chatJsonCompletion<T>(
  options: ChatJsonOptions<T>,
): Promise<T> {
  const client = getOpenAIClient();
  const model = getOpenAIModel();
  const tokenLimit = options.maxTokens;

  const retryInstruction =
    "IMPORTANTE: Tu respuesta anterior no fue JSON válido. Respondé SOLO con un objeto JSON parseable, sin markdown ni texto extra.";

  return callModelWithJsonRetry(
    async (attempt) => {
      const response = await client.chat.completions.create({
        model,
        temperature: attempt > 0 ? 0.2 : (options.temperature ?? 0.4),
        ...(tokenLimit
          ? usesMaxCompletionTokens(model)
            ? { max_completion_tokens: tokenLimit }
            : { max_tokens: tokenLimit }
          : {}),
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `${options.system}\n\n${JSON_ONLY_INSTRUCTION}${
              attempt > 0 ? `\n\n${retryInstruction}` : ""
            }`,
          },
          { role: "user", content: options.user },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("El modelo no devolvió contenido");
      }
      return content;
    },
    {
      maxRetries: options.maxRetries ?? 2,
      validate: options.validate,
      onRetry: options.onRetry,
    },
  );
}
