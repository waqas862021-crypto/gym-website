import "server-only";
import { randomUUID } from "node:crypto";
import { sql } from "@/lib/db";

export type MembershipStatus = "active" | "expired";

export type MembershipWithPlan = {
  planSlug: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: MembershipStatus;
};

export async function getCurrentMembership(
  userId: string,
): Promise<MembershipWithPlan | null> {
  const { rows } = await sql`
    select
      m.plan_slug,
      p.name as plan_name,
      to_char(m.start_date, 'YYYY-MM-DD') as start_date,
      to_char(m.end_date, 'YYYY-MM-DD') as end_date,
      (m.end_date >= current_date) as is_active
    from memberships m
    join membership_plans p on p.slug = m.plan_slug
    where m.user_id = ${userId}
    order by m.end_date desc
    limit 1
  `;
  const row = rows[0];
  if (!row) return null;

  const status: MembershipStatus = row.is_active ? "active" : "expired";

  return {
    planSlug: row.plan_slug,
    planName: row.plan_name,
    startDate: row.start_date,
    endDate: row.end_date,
    status,
  };
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Shared by the member's paid renewal (Phase 4) and the admin's manual,
// no-charge renewal (Phase 5) — both just extend the membership window.
export async function extendMembership(
  userId: string,
  planSlug: string,
  durationDays: number,
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const { rows: currentRows } = await sql`
    select to_char(end_date, 'YYYY-MM-DD') as end_date from memberships
    where user_id = ${userId}
    order by end_date desc
    limit 1
  `;
  const currentEnd: string | undefined = currentRows[0]?.end_date;
  const startDate = currentEnd && currentEnd > today ? currentEnd : today;
  const endDate = addDays(startDate, durationDays);

  await sql`
    insert into memberships (id, user_id, plan_slug, start_date, end_date)
    values (${randomUUID()}, ${userId}, ${planSlug}, ${startDate}::date, ${endDate}::date)
  `;
}
