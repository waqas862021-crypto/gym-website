import { z } from "zod";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getChatReply } from "@/lib/ai";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const chatSchema = z.object({
  message: z.string().trim().min(1).max(1000),
});

export async function POST(request: Request) {
  const session = await getSession();
  const ip = await getClientIp();
  // Rate-limit by account when logged in (follows the member across IPs),
  // otherwise by IP for anonymous visitors.
  const rateLimitKey = session ? `chat-user:${session.userId}` : `chat-ip:${ip}`;
  if (!(await checkRateLimit(rateLimitKey, 20, 300))) {
    return NextResponse.json({ error: "Too many messages. Please slow down." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message." }, { status: 400 });
  }
  const { message } = parsed.data;

  const { reply, escalated } = await getChatReply(message, session?.userId ?? null, session?.email ?? null);
  return NextResponse.json({ reply, escalated });
}
