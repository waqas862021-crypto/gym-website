import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    const supabase = await createClient();
    const { error } = await supabase.from("contact_messages").insert({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });
    if (error) throw error;
  } catch {
    return NextResponse.json({ error: "Could not save your message." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
