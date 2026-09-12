"use server";

import { z } from "zod";
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

const roleSchema = z.enum(["member", "reception", "customer_service", "admin", "super_admin"]);

// Only a super_admin can grant admin/super_admin — otherwise any admin could
// mint another super_admin (or themselves one), which defeats the role
// boundary entirely. Also block self-role-changes to avoid an admin locking
// themselves out by accident.
const ELEVATED_ROLES: ReadonlySet<AppRole> = new Set(["admin", "super_admin"]);

export async function updateMemberRole(formData: FormData) {
  const session = await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const parsed = roleSchema.safeParse(formData.get("role"));
  if (!parsed.success) {
    redirect(`/admin?error=${encodeURIComponent("Invalid role.")}`);
  }
  const role = parsed.data;

  if (userId === session.userId) {
    redirect(`/admin?error=${encodeURIComponent("You can't change your own role.")}`);
  }
  if (ELEVATED_ROLES.has(role) && session.role !== "super_admin") {
    redirect(`/admin?error=${encodeURIComponent("Only a super admin can grant that role.")}`);
  }

  await sql`update users set role = ${role} where id = ${userId}`;
  revalidatePath("/admin");
}

export async function markNotificationsRead() {
  await requireAdmin();
  await sql`update notifications set is_read = true where user_id is null and is_read = false`;
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
