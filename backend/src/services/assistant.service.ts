type AssistantRole = "system" | "user" | "assistant";

export interface AssistantMessage {
  role: AssistantRole;
  content: string;
}

export interface GenerateAssistantReplyInput {
  messages: AssistantMessage[];
  systemPrompt: string;
  temperature?: number;
}

export class AssistantServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssistantServiceError";
  }
}

const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

const getGroqKey = (): string | null => {
  return process.env.GROQ_API_KEY?.trim() || process.env.GROK_API_KEY?.trim() || null;
};

const getGroqModel = (): string => {
  return process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;
};

const getDeepSeekKey = (): string | null => {
  return process.env.DEEPSEEK_API_KEY?.trim() || null;
};

const callGroq = async (
  apiKey: string,
  payload: Record<string, unknown>
): Promise<Response> => {
  return fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getGroqModel(),
      ...payload,
    }),
  });
};

const callDeepSeek = async (
  apiKey: string,
  payload: Record<string, unknown>
): Promise<Response> => {
  return fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      ...payload,
    }),
  });
};

export const generateAssistantReply = async ({
  messages,
  systemPrompt,
  temperature = 0.4,
}: GenerateAssistantReplyInput): Promise<string> => {
  const payload = {
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    temperature,
  };

  const providerCandidates: Array<() => Promise<Response | null>> = [];
  const groqKey = getGroqKey();
  const deepSeekKey = getDeepSeekKey();

  if (groqKey) {
    providerCandidates.push(() => callGroq(groqKey, payload));
  }

  if (deepSeekKey) {
    providerCandidates.push(() => callDeepSeek(deepSeekKey, payload));
  }

  if (providerCandidates.length === 0) {
    throw new AssistantServiceError("Assistant is not configured.");
  }

  let lastErrorText = "No provider configured";

  for (const candidate of providerCandidates) {
    const response = await candidate().catch((error: unknown) => {
      lastErrorText = error instanceof Error ? error.message : "Assistant provider failed";
      return null;
    });

    if (!response) {
      continue;
    }

    if (!response.ok) {
      lastErrorText = await response.text().catch(() => "Assistant provider failed");
      continue;
    }

    const data = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };

    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      lastErrorText = "Assistant returned no response.";
      continue;
    }

    return reply;
  }

  throw new AssistantServiceError(lastErrorText);
};
