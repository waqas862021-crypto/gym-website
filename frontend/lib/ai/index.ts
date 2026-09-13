import "server-only";
import { randomUUID } from "node:crypto";
import { sql } from "@/lib/db";
import { notifyAdmins } from "@/lib/notifications";
import { mockAiProvider } from "./mockProvider";
import { nvidiaAiProvider } from "./nvidiaProvider";
import { groqAiProvider } from "./groqProvider";
import type { AiProvider, KnowledgeBaseEntry } from "./provider";

// Resolved lazily (not at module load) — see lib/payments/index.ts for why.
function getAiProvider(): AiProvider {
  const name = process.env.AI_PROVIDER || "mock";
  if (name === "mock") return mockAiProvider;
  if (name === "nvidia") return nvidiaAiProvider;
  if (name === "groq") return groqAiProvider;
  throw new Error(`Unknown AI_PROVIDER: ${name}`);
}

const FALLBACK_REPLY =
  "I don't have that on file, so I've passed it to our team and they'll follow up with you. You can also reach us directly at 013 891 2413.";

// Every question the provider can't answer from the knowledge base becomes a
// ticket, so nothing the agent can't handle is silently dropped.
export async function getChatReply(
  message: string,
  userId: string | null,
  email: string | null,
): Promise<{ reply: string; escalated: boolean }> {
  const { rows } = await sql`
    select question, keywords, answer from ai_knowledge_base where is_active = true
  `;
  const knowledgeBase: KnowledgeBaseEntry[] = rows.map((row) => ({
    question: row.question,
    keywords: row.keywords,
    answer: row.answer,
  }));

  const { reply } = await getAiProvider().getReply(message, knowledgeBase);
  if (reply) return { reply, escalated: false };

  await sql`
    insert into support_tickets (id, user_id, email, message, status)
    values (${randomUUID()}, ${userId}, ${email}, ${message}, 'open')
  `;
  await notifyAdmins(
    "New support ticket",
    `${email ?? "Anonymous visitor"}: ${message.slice(0, 200)}`,
  );
  return { reply: FALLBACK_REPLY, escalated: true };
}
