import "server-only";
import { randomUUID } from "node:crypto";
import { sql } from "@/lib/db";

export type BookClassFailureReason =
  | "not_found"
  | "inactive"
  | "no_membership"
  | "expired"
  | "class_not_found"
  | "class_full"
  | "already_booked";

export type BookClassResult =
  | { ok: true; className: string }
  | { ok: false; reason: BookClassFailureReason };

// The single entry point for booking a class, so capacity and
// double-booking are always enforced the same way regardless of caller.
export async function bookClass(userId: string, classId: string): Promise<BookClassResult> {
  const { rows: userRows } = await sql`select is_active from users where id = ${userId}`;
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

  const { rows: classRows } = await sql`select name, capacity from classes where id = ${classId}`;
  const classRow = classRows[0];
  if (!classRow) return { ok: false, reason: "class_not_found" };

  const { rows: existingRows } = await sql`
    select id from bookings where class_id = ${classId} and user_id = ${userId} limit 1
  `;
  if (existingRows.length > 0) return { ok: false, reason: "already_booked" };

  const { rows: countRows } = await sql`select count(*) as count from bookings where class_id = ${classId}`;
  if (Number(countRows[0].count) >= classRow.capacity) return { ok: false, reason: "class_full" };

  await sql`
    insert into bookings (id, class_id, user_id) values (${randomUUID()}, ${classId}, ${userId})
  `;

  return { ok: true, className: classRow.name };
}

export async function cancelBooking(userId: string, classId: string): Promise<void> {
  await sql`delete from bookings where class_id = ${classId} and user_id = ${userId}`;
}
