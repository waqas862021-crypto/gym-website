import "server-only";
import type { AiProvider } from "./provider";

// NVIDIA's hosted inference endpoint speaks the OpenAI chat-completions
// format, but this model expects `content` as an array of typed parts
// (matches NVIDIA's own sample code for moonshotai/kimi-k3), not a plain
// string. AI_API_KEY is a trial key for testing this integration only.
const ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions";
const MODEL = process.env.AI_MODEL || "moonshotai/kimi-k3";

function textPart(text: string) {
  return [{ type: "text", text }];
}

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

function extractContent(message: unknown): string | undefined {
  if (typeof message !== "object" || message === null) return undefined;
  const content = (message as { content?: unknown }).content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "object" && part !== null && "text" in part ? String((part as { text: unknown }).text) : ""))
      .join("")
      .trim();
  }
  return undefined;
}

export const nvidiaAiProvider: AiProvider = {
  async getReply(message, knowledgeBase) {
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) throw new Error("AI_API_KEY environment variable is not set.");

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: textPart(buildSystemPrompt(knowledgeBase)) },
            { role: "user", content: textPart(message) },
          ],
          max_tokens: 1024,
          seed: 0,
          stream: false,
          temperature: 0.2,
          reasoning_effort: "low",
        }),
      });

      if (!response.ok) {
        console.error(`NVIDIA API error: ${response.status} ${await response.text()}`);
        return { reply: null };
      }

      const data = await response.json();
      const content = extractContent(data.choices?.[0]?.message);
      if (!content || content.includes("NO_ANSWER")) return { reply: null };
      return { reply: content };
    } catch (error) {
      // Network/parse failures fall back to the normal escalation path
      // (a support ticket) instead of a 500 in the chat widget.
      console.error("NVIDIA provider request failed:", error);
      return { reply: null };
    }
  },
};
