type OpenAIChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OpenAIChatResponse = {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
};

export async function openAIChatCompletion(
  messages: OpenAIChatMessage[],
  options?: { jsonMode?: boolean; temperature?: number }
): Promise<{ content: string | null; error?: string }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return { content: null, error: "OPENAI_API_KEY is not configured." };
  }

  const model = process.env.OPENAI_TEXT_MODEL?.trim() || "gpt-4o-mini";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: options?.temperature ?? 0.8,
        messages,
        ...(options?.jsonMode
          ? { response_format: { type: "json_object" } }
          : {}),
      }),
    });

    const data = (await response.json()) as OpenAIChatResponse;

    if (!response.ok) {
      return {
        content: null,
        error: data.error?.message ?? `OpenAI request failed (${response.status}).`,
      };
    }

    const content = data.choices?.[0]?.message?.content?.trim() ?? null;
    if (!content) {
      return { content: null, error: "OpenAI returned an empty response." };
    }

    return { content };
  } catch (err) {
    return {
      content: null,
      error: err instanceof Error ? err.message : "OpenAI request failed.",
    };
  }
}
