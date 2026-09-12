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

export async function createTrainer(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const specialty = String(formData.get("specialty") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  if (!name || !specialty) {
    redirect(`/admin?error=${encodeURIComponent("Trainer name and specialty are required.")}`);
  }

  await sql`
    insert into trainers (id, name, specialty, bio)
    values (${randomUUID()}, ${name}, ${specialty}, ${bio || null})
  `;
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function toggleTrainerActive(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const isActive = formData.get("isActive") === "true";

  await sql`update trainers set is_active = ${!isActive} where id = ${id}`;
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function createClass(formData: FormData) {
  await requireAdmin();

  const trainerId = String(formData.get("trainerId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const startsAt = String(formData.get("startsAt") ?? "");
  const durationMinutes = Number(formData.get("durationMinutes") ?? 60);
  const capacity = Number(formData.get("capacity") ?? 10);

  if (!trainerId || !name || !startsAt || !durationMinutes || !capacity) {
    redirect(`/admin?error=${encodeURIComponent("All class fields are required.")}`);
  }

  await sql`
    insert into classes (id, trainer_id, name, starts_at, duration_minutes, capacity)
    values (${randomUUID()}, ${trainerId}, ${name}, ${startsAt}::timestamptz, ${durationMinutes}, ${capacity})
  `;
  revalidatePath("/admin");
  revalidatePath("/portal");
}

export async function deleteClass(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  await sql`delete from classes where id = ${id}`;
  revalidatePath("/admin");
  revalidatePath("/portal");
}
