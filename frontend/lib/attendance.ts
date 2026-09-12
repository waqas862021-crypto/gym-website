import "server-only";
import { randomUUID } from "node:crypto";
import { sql } from "@/lib/db";

export type CheckInFailureReason =
  | "not_found"
  | "inactive"
  | "no_membership"
  | "expired"
  | "already_checked_in";

export type CheckInResult =
  | { ok: true; label: string }
  | { ok: false; reason: CheckInFailureReason };

// The single entry point for recording a gym visit, regardless of how it
// was captured (QR scan today, manual reception entry, or a future
// biometric/RFID device) — everything funnels through here so that path
// never needs to be rewritten.
export async function recordAttendance(
  userId: string,
  method: "qr" | "manual",
): Promise<CheckInResult> {
  const { rows: userRows } = await sql`
    select email, full_name, is_active from users where id = ${userId}
  `;
  const user = userRows[0];
  if (!user) return { ok: false, reason: "not_found" };
  if (!user.is_active) return { ok: false, reason: "inactive" };

  const { rows: membershipRows } = await sql`
    select to_char(end_date, 'YYYY-MM-DD') as end_date from memberships
    where user_id = ${userId}
    order by end_date desc
    limit 1
  `;
  const membership = membershipRows[0];
  if (!membership) return { ok: false, reason: "no_membership" };

  const today = new Date().toISOString().slice(0, 10);
  if (membership.end_date < today) return { ok: false, reason: "expired" };

  const { rows: existingToday } = await sql`
    select id from attendance
    where user_id = ${userId} and checked_in_at::date = current_date
    limit 1
  `;
  if (existingToday.length > 0) return { ok: false, reason: "already_checked_in" };

  await sql`
    insert into attendance (id, user_id, method) values (${randomUUID()}, ${userId}, ${method})
  `;

  return { ok: true, label: user.full_name ?? user.email };
}
