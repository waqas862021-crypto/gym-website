import "server-only";

// Shared by every real (non-mock) provider. Mirrors prompts/system-prompt.md's
// core rule (never invent facts, only answer from what's given) — the file
// itself isn't read at runtime because Vercel's build root is frontend/, one
// level below prompts/.
export function buildSystemPrompt(knowledgeBase: { question: string; answer: string }[]): string {
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
