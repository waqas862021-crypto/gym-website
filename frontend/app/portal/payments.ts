"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { paymentProvider } from "@/lib/payments";

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function renewMembership(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const planSlug = String(formData.get("planSlug") ?? "");
  const simulateFailure = formData.get("simulateFailure") === "on";

  const { rows: planRows } = await sql`
    select price_sar, duration_days from membership_plans where slug = ${planSlug}
  `;
  const plan = planRows[0];
  if (!plan) {
    redirect(`/portal?error=${encodeURIComponent("Unknown membership plan.")}`);
  }

  const amountSar = Number(plan.price_sar);
  const { providerRef, status } = await paymentProvider.createCheckoutSession({
    userId: session.userId,
    planSlug,
    amountSar,
    simulateFailure,
  });

  await sql`
    insert into payments (id, user_id, plan_slug, amount_sar, status, provider_ref)
    values (${randomUUID()}, ${session.userId}, ${planSlug}, ${amountSar}, ${status}, ${providerRef})
  `;

  if (status !== "succeeded") {
    redirect(`/portal?error=${encodeURIComponent("Payment failed. Please try again.")}`);
  }

  const today = new Date().toISOString().slice(0, 10);
  const { rows: currentRows } = await sql`
    select to_char(end_date, 'YYYY-MM-DD') as end_date from memberships
    where user_id = ${session.userId}
    order by end_date desc
    limit 1
  `;
  const currentEnd: string | undefined = currentRows[0]?.end_date;
  const startDate = currentEnd && currentEnd > today ? currentEnd : today;
  const endDate = addDays(startDate, plan.duration_days);

  await sql`
    insert into memberships (id, user_id, plan_slug, start_date, end_date)
    values (${randomUUID()}, ${session.userId}, ${planSlug}, ${startDate}::date, ${endDate}::date)
  `;

  redirect("/portal?renewed=1");
}
