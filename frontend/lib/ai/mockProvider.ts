import "server-only";
import type { AiProvider } from "./provider";

// Keyword-matched replies only, verbatim from the knowledge base — this is
// what keeps the agent from ever inventing a fact.
export const mockAiProvider: AiProvider = {
  async getReply(message, knowledgeBase) {
    const text = message.toLowerCase();
    let best: { answer: string; score: number } | null = null;

    for (const entry of knowledgeBase) {
      const score = entry.keywords.filter((keyword) => text.includes(keyword.toLowerCase())).length;
      if (score > 0 && (!best || score > best.score)) {
        best = { answer: entry.answer, score };
      }
    }

    return { reply: best?.answer ?? null };
  },
};
