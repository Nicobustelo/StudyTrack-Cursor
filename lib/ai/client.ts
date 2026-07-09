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

  return callModelWithJsonRetry(
    async () => {
      const response = await client.chat.completions.create({
        model,
        temperature: options.temperature ?? 0.4,
        max_tokens: options.maxTokens,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `${options.system}\n\n${JSON_ONLY_INSTRUCTION}`,
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
      maxRetries: options.maxRetries,
      validate: options.validate,
      onRetry: options.onRetry,
    },
  );
}
