/** Modelo OpenAI desde env — spec 4.1 / 41.1 */
export function getOpenAIModel(): string {
  return process.env.OPENAI_MODEL?.trim() || "gpt-5.4-mini";
}

export function getOpenAIApiKey(): string {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    throw new Error("OPENAI_API_KEY no está configurada");
  }
  return key;
}

export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}
