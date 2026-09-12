import "server-only";
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
