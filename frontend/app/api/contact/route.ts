import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { sendAndLogEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, message } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !EMAIL_RE.test(email) ||
    typeof message !== "string" ||
    message.trim().length < 10
  ) {
    return NextResponse.json({ error: "Invalid contact details." }, { status: 400 });
  }

  try {
    await sql`
      insert into contact_messages (id, name, email, message)
      values (${randomUUID()}, ${name.trim()}, ${email.trim()}, ${message.trim()})
    `;
  } catch {
    return NextResponse.json({ error: "Could not save your message." }, { status: 500 });
  }

  await sendAndLogEmail(
    email.trim(),
    "We received your message — Goodlife Fitness Gym",
    `Hi ${name.trim()}, thanks for reaching out. Our team will get back to you shortly.`,
    "contact_response",
  );

  return NextResponse.json({ ok: true });
}
