import "server-only";
import { buildSystemPrompt } from "./systemPrompt";
import type { AiProvider } from "./provider";

// Groq's endpoint is OpenAI-compatible and takes plain-string message
// content (unlike NVIDIA's moonshotai/kimi-k3, which needs typed parts).
const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.AI_MODEL || "llama-3.1-8b-instant";

export const groqAiProvider: AiProvider = {
  async getReply(message, knowledgeBase) {
    // .trim() guards against a trailing space/newline from pasting the
    // value into Vercel's env var UI — has bitten us before.
    const apiKey = process.env.AI_API_KEY?.trim();
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
            { role: "system", content: buildSystemPrompt(knowledgeBase) },
            { role: "user", content: message },
          ],
          max_tokens: 300,
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        console.error(`Groq API error: ${response.status} ${await response.text()}`);
        return { reply: null };
      }

      const data = await response.json();
      const content: string | undefined = data.choices?.[0]?.message?.content?.trim();
      if (!content || content.includes("NO_ANSWER")) return { reply: null };
      return { reply: content };
    } catch (error) {
      // Falls back to the normal ticket-escalation path instead of a 500.
      console.error("Groq provider request failed:", error);
      return { reply: null };
    }
  },
};
