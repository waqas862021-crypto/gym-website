import "server-only";
import { randomUUID } from "node:crypto";
import { sql } from "@/lib/db";
import { mockEmailProvider } from "./mockProvider";
import type { EmailProvider, EmailType } from "./provider";

// Resolved lazily (not at module load) — see lib/payments/index.ts for why.
function getEmailProvider(): EmailProvider {
  const name = process.env.EMAIL_PROVIDER || "mock";
  if (name !== "mock") {
    throw new Error(`Unknown EMAIL_PROVIDER: ${name}`);
  }
  return mockEmailProvider;
}

// Every trigger sends through here so the email_logs table always reflects
// what the provider actually did, whether it's the mock or a real one later.
export async function sendAndLogEmail(
  to: string,
  subject: string,
  body: string,
  type: EmailType,
): Promise<void> {
  const { status } = await getEmailProvider().sendEmail({ to, subject, body, type });
  await sql`
    insert into email_logs (id, recipient, subject, type, status)
    values (${randomUUID()}, ${to}, ${subject}, ${type}, ${status})
  `;
}
