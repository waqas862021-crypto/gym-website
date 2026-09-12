"use server";

import { z } from "zod";
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

const classSchema = z.object({
  trainerId: z.string().uuid(),
  name: z.string().trim().min(1),
  startsAt: z.string().min(1),
  durationMinutes: z.coerce.number().int().positive(),
  capacity: z.coerce.number().int().positive(),
});

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

  const parsed = classSchema.safeParse({
    trainerId: formData.get("trainerId"),
    name: formData.get("name"),
    startsAt: formData.get("startsAt"),
    durationMinutes: formData.get("durationMinutes"),
    capacity: formData.get("capacity"),
  });
  if (!parsed.success) {
    redirect(`/admin?error=${encodeURIComponent("All class fields are required.")}`);
  }
  const { trainerId, name, startsAt, durationMinutes, capacity } = parsed.data;

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
