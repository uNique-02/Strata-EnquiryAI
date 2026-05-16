import { getServerEnv } from "@/lib/env";

interface OpenRouterCompletionOptions {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
  maxTokens: number;
}

interface OpenRouterCompletionResult {
  content: string;
  raw: unknown;
}

export async function requestOpenRouterCompletion(
  options: OpenRouterCompletionOptions,
): Promise<OpenRouterCompletionResult> {
  const env = getServerEnv();

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.openRouterApiKey}`,
      ...(env.openRouterSiteUrl ? { "HTTP-Referer": env.openRouterSiteUrl } : {}),
      ...(env.openRouterAppName ? { "X-Title": env.openRouterAppName } : {}),
    },
    body: JSON.stringify({
      model: options.model,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: options.systemPrompt },
        { role: "user", content: options.userPrompt },
      ],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter request failed: ${response.status} ${text}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("OpenRouter response did not contain message content.");
  }

  return {
    content,
    raw: payload,
  };
}

