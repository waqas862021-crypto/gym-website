import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { getCurrentMembership } from "@/lib/memberships";
import { signOut } from "../(auth)/actions";
import { updateProfile } from "./actions";
import { renewMembership } from "./payments";

export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; renewed?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { error, renewed } = await searchParams;

  const [{ rows: userRows }, membership, { rows: plans }, { rows: paymentRows }] =
    await Promise.all([
      sql`select full_name from users where id = ${session.userId}`,
      getCurrentMembership(session.userId),
      sql`select slug, name, price_sar from membership_plans order by sort_order`,
      sql`
        select id, plan_slug, amount_sar, status,
          to_char(created_at, 'YYYY-MM-DD HH24:MI') as created_at
        from payments
        where user_id = ${session.userId}
        order by created_at desc
        limit 10
      `,
    ]);
  const fullName: string = userRows[0]?.full_name ?? "";

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 bg-neutral-950 px-6 py-16 text-white">
      <div>
        <h1 className="text-3xl font-bold">Member Portal</h1>
        <p className="text-neutral-400">{session.email}</p>
      </div>

      {renewed && (
        <p className="rounded-lg border border-green-400/30 bg-green-400/10 px-4 py-3 text-sm text-green-400">
          Payment received — your membership has been extended.
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold">Membership Status</h2>
        {membership ? (
          <div className="mt-4 space-y-2 text-sm">
            <p>
              Plan: <span className="font-medium">{membership.planName}</span>
            </p>
            <p>
              Status:{" "}
              <span
                className={
                  membership.status === "active"
                    ? "font-medium text-green-400"
                    : "font-medium text-red-400"
                }
              >
                {membership.status === "active" ? "Active" : "Expired"}
              </span>
            </p>
            <p className="text-neutral-400">
              {membership.startDate} &rarr; {membership.endDate}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-neutral-400">
            No membership on file yet. Visit reception to get set up.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold">Renew Membership</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Payments are mocked for now — no real charge is made.
        </p>
        <form action={renewMembership} className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Plan
            <select
              name="planSlug"
              defaultValue={membership?.planSlug ?? plans[0]?.slug}
              className="rounded-lg border border-white/20 bg-neutral-900 px-3 py-2 text-white focus:border-white/50 focus:outline-none"
            >
              {plans.map((plan) => (
                <option key={plan.slug} value={plan.slug}>
                  {plan.name} — {plan.price_sar} SAR
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs text-neutral-500">
            <input type="checkbox" name="simulateFailure" />
            Simulate a failed payment (testing)
          </label>
          <button
            type="submit"
            className="self-start rounded-full bg-lime-400 px-6 py-2 text-sm font-semibold text-neutral-950 hover:bg-lime-300"
          >
            Renew
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold">Payment History</h2>
        {paymentRows.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-400">No payments yet.</p>
        ) : (
          <ul className="mt-4 space-y-3 text-sm">
            {paymentRows.map((payment) => (
              <li
                key={payment.id}
                className="flex items-center justify-between border-b border-white/10 pb-2 last:border-0"
              >
                <div>
                  <p className="font-medium">{payment.plan_slug}</p>
                  <p className="text-xs text-neutral-500">{payment.created_at}</p>
                </div>
                <div className="text-right">
                  <p>{payment.amount_sar} SAR</p>
                  <p
                    className={
                      payment.status === "succeeded"
                        ? "text-xs text-green-400"
                        : "text-xs text-red-400"
                    }
                  >
                    {payment.status}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold">Profile</h2>
        <form action={updateProfile} className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Full name
            <input
              type="text"
              name="fullName"
              defaultValue={fullName}
              placeholder="Your name"
              className="rounded-lg border border-white/20 bg-transparent px-3 py-2 text-white placeholder:text-neutral-500 focus:border-white/50 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="self-start rounded-full bg-white px-6 py-2 text-sm font-semibold text-neutral-950 hover:bg-neutral-200"
          >
            Save
          </button>
        </form>
      </section>

      <form action={signOut}>
        <button
          type="submit"
          className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-white/50"
        >
          Log Out
        </button>
      </form>
    </main>
  );
}
