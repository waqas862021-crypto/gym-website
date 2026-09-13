import "server-only";
import type { AiProvider } from "./provider";

// NVIDIA's hosted inference endpoint speaks the OpenAI chat-completions
// format. AI_API_KEY is a trial key for testing this integration only.
const ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions";
const MODEL = process.env.AI_MODEL || "moonshotai/kimi-k3";

// Mirrors prompts/system-prompt.md's core rule (never invent facts, only
// answer from what's given) — the file itself isn't read at runtime because
// Vercel's build root is frontend/, one level below prompts/.
function buildSystemPrompt(knowledgeBase: { question: string; answer: string }[]): string {
  const facts = knowledgeBase.map((entry) => `Q: ${entry.question}\nA: ${entry.answer}`).join("\n\n");
  return [
    "You are the Goodlife Fitness Gym customer-service assistant.",
    "Answer ONLY using the facts listed below — never invent a fact, price, or policy.",
    "Keep answers short and friendly.",
    "If the facts below don't cover the question, reply with exactly: NO_ANSWER",
    "",
    facts,
  ].join("\n");
}

export const nvidiaAiProvider: AiProvider = {
  async getReply(message, knowledgeBase) {
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) throw new Error("AI_API_KEY environment variable is not set.");

    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: buildSystemPrompt(knowledgeBase) },
          { role: "user", content: message },
        ],
        max_tokens: 200,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`NVIDIA API error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    const content: string | undefined = data.choices?.[0]?.message?.content?.trim();
    if (!content || content.includes("NO_ANSWER")) return { reply: null };
    return { reply: content };
  },
};
