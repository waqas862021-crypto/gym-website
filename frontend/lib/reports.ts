import "server-only";
import { sql } from "@/lib/db";

export type MonthlyCount = { month: string; count: number };
export type PlanMembershipBreakdown = {
  planSlug: string;
  planName: string;
  active: number;
  expired: number;
};

export async function getMembershipsByMonth(): Promise<MonthlyCount[]> {
  const { rows } = await sql`
    select to_char(date_trunc('month', created_at), 'YYYY-MM') as month, count(*)::int as count
    from memberships
    where created_at >= now() - interval '12 months'
    group by 1
    order by 1
  `;
  return rows.map((r) => ({ month: r.month, count: r.count }));
}

export async function getMembershipsByPlan(): Promise<PlanMembershipBreakdown[]> {
  const { rows } = await sql`
    with latest as (
      select distinct on (user_id) user_id, plan_slug, end_date
      from memberships
      order by user_id, end_date desc
    )
    select p.slug as plan_slug, p.name as plan_name,
      count(*) filter (where l.end_date >= current_date)::int as active,
      count(*) filter (where l.end_date < current_date)::int as expired
    from latest l
    join membership_plans p on p.slug = l.plan_slug
    group by p.slug, p.name, p.sort_order
    order by p.sort_order
  `;
  return rows.map((r) => ({
    planSlug: r.plan_slug,
    planName: r.plan_name,
    active: r.active,
    expired: r.expired,
  }));
}

export type MonthlyRevenue = { month: string; revenue: number };
export type PlanRevenueBreakdown = {
  planSlug: string;
  planName: string;
  revenue: number;
  count: number;
};
export type PaymentStatusBreakdown = { status: string; count: number; total: number };

export async function getRevenueByMonth(): Promise<MonthlyRevenue[]> {
  const { rows } = await sql`
    select to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
      coalesce(sum(amount_sar), 0)::numeric as revenue
    from payments
    where status = 'succeeded' and created_at >= now() - interval '12 months'
    group by 1
    order by 1
  `;
  return rows.map((r) => ({ month: r.month, revenue: Number(r.revenue) }));
}

export async function getRevenueByPlan(): Promise<PlanRevenueBreakdown[]> {
  const { rows } = await sql`
    select p.slug as plan_slug, p.name as plan_name,
      coalesce(sum(pay.amount_sar), 0)::numeric as revenue,
      count(pay.id)::int as count
    from membership_plans p
    left join payments pay on pay.plan_slug = p.slug and pay.status = 'succeeded'
    group by p.slug, p.name, p.sort_order
    order by p.sort_order
  `;
  return rows.map((r) => ({
    planSlug: r.plan_slug,
    planName: r.plan_name,
    revenue: Number(r.revenue),
    count: r.count,
  }));
}

export async function getPaymentStatusBreakdown(): Promise<PaymentStatusBreakdown[]> {
  const { rows } = await sql`
    select status, count(*)::int as count, coalesce(sum(amount_sar), 0)::numeric as total
    from payments
    group by status
    order by status
  `;
  return rows.map((r) => ({ status: r.status, count: r.count, total: Number(r.total) }));
}

export type DailyAttendance = { day: string; count: number };
export type AttendanceMethodBreakdown = { method: string; count: number };
export type TopAttendee = { userId: string; name: string; email: string; visits: number };

export async function getAttendanceByDay(): Promise<DailyAttendance[]> {
  const { rows } = await sql`
    select to_char(checked_in_at::date, 'YYYY-MM-DD') as day, count(*)::int as count
    from attendance
    where checked_in_at >= now() - interval '30 days'
    group by 1
    order by 1
  `;
  return rows.map((r) => ({ day: r.day, count: r.count }));
}

export async function getAttendanceByMethod(): Promise<AttendanceMethodBreakdown[]> {
  const { rows } = await sql`
    select method, count(*)::int as count from attendance group by method order by method
  `;
  return rows.map((r) => ({ method: r.method, count: r.count }));
}

export async function getTopAttendees(limit = 10): Promise<TopAttendee[]> {
  const { rows } = await sql`
    select u.id as user_id, coalesce(u.full_name, '') as name, u.email, count(a.id)::int as visits
    from attendance a
    join users u on u.id = a.user_id
    group by u.id, u.full_name, u.email
    order by visits desc
    limit ${limit}
  `;
  return rows.map((r) => ({ userId: r.user_id, name: r.name, email: r.email, visits: r.visits }));
}
