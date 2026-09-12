import { z } from "zod";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { sendAndLogEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  message: z.string().trim().min(10).max(2000),
});

export async function POST(request: Request) {
  const ip = await getClientIp();
  if (!(await checkRateLimit(`contact:${ip}`, 5, 600))) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid contact details." }, { status: 400 });
  }
  const { name, email, message } = parsed.data;

  try {
    await sql`
      insert into contact_messages (id, name, email, message)
      values (${randomUUID()}, ${name}, ${email}, ${message})
    `;
  } catch {
    return NextResponse.json({ error: "Could not save your message." }, { status: 500 });
  }

  await sendAndLogEmail(
    email,
    "We received your message — Goodlife Fitness Gym",
    `Hi ${name}, thanks for reaching out. Our team will get back to you shortly.`,
    "contact_response",
  );

  return NextResponse.json({ ok: true });
}
