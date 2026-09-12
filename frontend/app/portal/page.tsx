import QRCode from "qrcode";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getSession, clearSessionCookie } from "@/lib/auth/session";
import { createAttendanceToken } from "@/lib/auth/jwt";
import { getCurrentMembership } from "@/lib/memberships";
import { ChatWidget } from "@/components/chat-widget";
import { signOut } from "../(auth)/actions";
import { updateProfile } from "./actions";
import { renewMembership } from "./payments";
import { bookClassAction, cancelBookingAction } from "./bookings";

export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; renewed?: string; booked?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { error, renewed, booked } = await searchParams;

  const [
    { rows: userRows },
    membership,
    { rows: plans },
    { rows: paymentRows },
    { rows: attendanceRows },
    { rows: classRows },
  ] = await Promise.all([
    sql`select full_name, is_active from users where id = ${session.userId}`,
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
    sql`
      select id, method, to_char(checked_in_at, 'YYYY-MM-DD HH24:MI') as checked_in_at
      from attendance
      where user_id = ${session.userId}
      order by checked_in_at desc
      limit 10
    `,
    sql`
      select c.id, c.name, to_char(c.starts_at, 'YYYY-MM-DD HH24:MI') as starts_at,
        c.duration_minutes, c.capacity, t.name as trainer_name,
        (select count(*) from bookings b where b.class_id = c.id) as booked_count,
        exists(
          select 1 from bookings b where b.class_id = c.id and b.user_id = ${session.userId}
        ) as is_booked
      from classes c
      join trainers t on t.id = c.trainer_id
      where c.starts_at >= now()
      order by c.starts_at
      limit 20
    `,
  ]);

  // The session JWT stays valid for up to 7 days regardless of DB state, so
  // an admin suspending a member mid-session needs this recheck to actually
  // block portal access before the token expires on its own.
  if (!userRows[0]?.is_active) {
    await clearSessionCookie();
    redirect(`/login?error=${encodeURIComponent("This account has been suspended. Contact reception.")}`);
  }

  const fullName: string = userRows[0]?.full_name ?? "";
  const attendanceToken = await createAttendanceToken(session.userId);
  const qrDataUrl = await QRCode.toDataURL(attendanceToken, { margin: 1, width: 220 });

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
      {booked && (
        <p className="rounded-lg border border-green-400/30 bg-green-400/10 px-4 py-3 text-sm text-green-400">
          You&apos;re booked into {booked}.
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
        <h2 className="text-lg font-semibold">Check-In QR Code</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Show this at reception to check in. It doesn&apos;t expire, so keep it private.
        </p>
        <div className="mt-4 w-fit rounded-xl bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- a small server-generated data URI, not worth next/image here */}
          <img src={qrDataUrl} alt="Your check-in QR code" width={220} height={220} />
        </div>
        {attendanceRows.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-neutral-400">Recent check-ins</p>
            <ul className="mt-2 space-y-1 text-sm text-neutral-400">
              {attendanceRows.map((row) => (
                <li key={row.id}>
                  {row.checked_in_at} · {row.method}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold">Classes</h2>
        <p className="mt-1 text-xs text-neutral-500">Book a spot in an upcoming class.</p>
        {classRows.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-400">No upcoming classes scheduled.</p>
        ) : (
          <ul className="mt-4 space-y-3 text-sm">
            {classRows.map((cls) => {
              const full = Number(cls.booked_count) >= cls.capacity;
              return (
                <li
                  key={cls.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-white/10 p-4"
                >
                  <div>
                    <p className="font-medium">{cls.name}</p>
                    <p className="text-xs text-neutral-500">
                      {cls.starts_at} · {cls.duration_minutes} min · with {cls.trainer_name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {cls.booked_count}/{cls.capacity} booked
                    </p>
                  </div>
                  {cls.is_booked ? (
                    <form action={cancelBookingAction}>
                      <input type="hidden" name="classId" value={cls.id} />
                      <button
                        type="submit"
                        className="shrink-0 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white hover:border-white/50"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <form action={bookClassAction}>
                      <input type="hidden" name="classId" value={cls.id} />
                      <button
                        type="submit"
                        disabled={full}
                        className="shrink-0 rounded-full bg-lime-400 px-4 py-2 text-xs font-semibold text-neutral-950 hover:bg-lime-300 disabled:opacity-40"
                      >
                        {full ? "Full" : "Book"}
                      </button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
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
      <ChatWidget />
    </main>
  );
}
