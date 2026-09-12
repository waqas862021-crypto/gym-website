import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getChatReply } from "@/lib/ai";

const MAX_MESSAGE_LENGTH = 1000;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { message } = (body ?? {}) as Record<string, unknown>;
  if (typeof message !== "string" || !message.trim() || message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Invalid message." }, { status: 400 });
  }

  const session = await getSession();
  const { reply, escalated } = await getChatReply(
    message.trim(),
    session?.userId ?? null,
    session?.email ?? null,
  );
  return NextResponse.json({ reply, escalated });
}
