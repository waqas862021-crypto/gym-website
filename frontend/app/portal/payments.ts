"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { getPaymentProvider } from "@/lib/payments";
import { extendMembership } from "@/lib/memberships";

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
  const { providerRef, status } = await getPaymentProvider().createCheckoutSession({
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

  await extendMembership(session.userId, planSlug, plan.duration_days);

  redirect("/portal?renewed=1");
}
