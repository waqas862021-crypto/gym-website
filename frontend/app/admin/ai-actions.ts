"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/roles";

async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!ADMIN_ROLES.has(session.role)) redirect("/portal");
  return session;
}

export async function createKbEntry(formData: FormData) {
  await requireAdmin();

  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const keywords = String(formData.get("keywords") ?? "")
    .split(",")
    .map((keyword) => keyword.trim().toLowerCase())
    .filter(Boolean);

  if (!question || !answer || keywords.length === 0) {
    redirect(`/admin?error=${encodeURIComponent("Question, answer, and at least one keyword are required.")}`);
  }

  await sql`
    insert into ai_knowledge_base (id, question, keywords, answer)
    values (${randomUUID()}, ${question}, ${keywords}, ${answer})
  `;
  revalidatePath("/admin");
}

export async function toggleKbActive(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const isActive = formData.get("isActive") === "true";

  await sql`update ai_knowledge_base set is_active = ${!isActive}, updated_at = now() where id = ${id}`;
  revalidatePath("/admin");
}

export async function deleteKbEntry(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  await sql`delete from ai_knowledge_base where id = ${id}`;
  revalidatePath("/admin");
}

export async function resolveTicket(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  await sql`update support_tickets set status = 'resolved' where id = ${id}`;
  revalidatePath("/admin");
}
