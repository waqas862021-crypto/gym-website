"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { extendMembership } from "@/lib/memberships";
import { ADMIN_ROLES, type AppRole } from "@/lib/roles";

async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!ADMIN_ROLES.has(session.role)) redirect("/portal");
  return session;
}

export async function updateMemberRole(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "") as AppRole;

  await sql`update users set role = ${role} where id = ${userId}`;
  revalidatePath("/admin");
}

export async function toggleMemberActive(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const isActive = formData.get("isActive") === "true";

  await sql`update users set is_active = ${!isActive} where id = ${userId}`;
  revalidatePath("/admin");
}

export async function adminRenewMembership(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const planSlug = String(formData.get("planSlug") ?? "");

  const { rows: planRows } = await sql`
    select duration_days from membership_plans where slug = ${planSlug}
  `;
  const plan = planRows[0];
  if (!plan) {
    redirect(`/admin?error=${encodeURIComponent("Unknown membership plan.")}`);
  }

  // No payment row — this is a manual, no-charge renewal, distinct from the
  // member's own paid renewal in Phase 4.
  await extendMembership(userId, planSlug, plan.duration_days);
  revalidatePath("/admin");
}
