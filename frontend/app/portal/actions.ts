"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) return;

  const fullName = String(formData.get("fullName") ?? "").trim();

  await sql`
    update users set full_name = ${fullName || null} where id = ${session.userId}
  `;

  revalidatePath("/portal");
}
