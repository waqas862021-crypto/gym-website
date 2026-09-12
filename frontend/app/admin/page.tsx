import Link from "next/link";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { ADMIN_ROLES, type AppRole } from "@/lib/roles";
import { signOut } from "../(auth)/actions";
import { updateMemberRole, toggleMemberActive, adminRenewMembership } from "./actions";
import { createKbEntry, toggleKbActive, deleteKbEntry, resolveTicket } from "./ai-actions";
import { createTrainer, toggleTrainerActive, createClass, deleteClass } from "./classes-actions";

const ALL_ROLES: AppRole[] = ["member", "reception", "customer_service", "admin", "super_admin"];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; error?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!ADMIN_ROLES.has(session.role)) redirect("/portal");

  const { q, error } = await searchParams;
  const search = (q ?? "").trim();
  const searchPattern = `%${search}%`;

  const [
    { rows: statRows },
    { rows: members },
    { rows: plans },
    { rows: emailLogs },
    { rows: kbEntries },
    { rows: openTickets },
    { rows: trainers },
    { rows: classes },
  ] = await Promise.all([
    sql`
      with latest_memberships as (
        select distinct on (user_id) user_id, end_date
        from memberships
        order by user_id, end_date desc
      )
      select
        (select count(*) from users where role = 'member') as total_members,
        (select count(*) from latest_memberships where end_date >= current_date) as active_memberships,
        (select count(*) from latest_memberships where end_date < current_date) as expired_memberships,
        (select coalesce(sum(amount_sar), 0) from payments where status = 'succeeded') as total_revenue,
        (select count(*) from payments where status = 'pending') as pending_payments,
        (select count(*) from latest_memberships
          where end_date >= current_date and end_date <= current_date + interval '7 days') as upcoming_expirations,
        (select count(*) from attendance where checked_in_at::date = current_date) as todays_attendance,
        (select count(*) from support_tickets where status = 'open') as open_tickets
    `,
    sql`
      select u.id, u.email, u.full_name, u.role, u.is_active,
        to_char(lm.end_date, 'YYYY-MM-DD') as membership_end_date
      from users u
      left join lateral (
        select end_date from memberships m where m.user_id = u.id order by end_date desc limit 1
      ) lm on true
      where u.email ilike ${searchPattern} or coalesce(u.full_name, '') ilike ${searchPattern}
      order by u.created_at desc
      limit 50
    `,
    sql`select slug, name from membership_plans order by sort_order`,
    sql`
      select id, recipient, subject, type, status,
        to_char(created_at, 'YYYY-MM-DD HH24:MI') as created_at
      from email_logs
      order by created_at desc
      limit 20
    `,
    sql`select id, question, keywords, answer, is_active from ai_knowledge_base order by created_at desc`,
    sql`
      select id, email, message, to_char(created_at, 'YYYY-MM-DD HH24:MI') as created_at
      from support_tickets
      where status = 'open'
      order by created_at desc
      limit 20
    `,
    sql`select id, name, specialty, is_active from trainers order by created_at`,
    sql`
      select c.id, c.name, t.name as trainer_name,
        to_char(c.starts_at, 'YYYY-MM-DD HH24:MI') as starts_at,
        c.duration_minutes, c.capacity,
        (select count(*) from bookings b where b.class_id = c.id) as booked_count
      from classes c
      join trainers t on t.id = c.trainer_id
      order by c.starts_at desc
      limit 30
    `,
  ]);
  const stats = statRows[0];

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 bg-neutral-950 px-6 py-16 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-neutral-400">
            {session.email} · {session.role}
          </p>
        </div>
        <Link href="/admin/reports" className="text-sm text-lime-400 hover:underline">
          View Reports
        </Link>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Members" value={stats.total_members} />
        <StatCard label="Active Memberships" value={stats.active_memberships} />
        <StatCard label="Expired Memberships" value={stats.expired_memberships} />
        <StatCard label="Expiring in 7 Days" value={stats.upcoming_expirations} />
        <StatCard label="Total Revenue" value={`${stats.total_revenue} SAR`} />
        <StatCard label="Pending Payments" value={stats.pending_payments} />
        <StatCard label="Today's Attendance" value={stats.todays_attendance} />
        <StatCard label="Open Tickets" value={stats.open_tickets} />
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold">Members</h2>
        <form method="get" className="mt-4">
          <input
            type="text"
            name="q"
            defaultValue={search}
            placeholder="Search by name or email"
            className="w-full max-w-sm rounded-lg border border-white/20 bg-transparent px-3 py-2 text-white placeholder:text-neutral-500 focus:border-white/50 focus:outline-none"
          />
        </form>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-neutral-500">
              <tr>
                <th className="pb-2 pr-4">Email</th>
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Role</th>
                <th className="pb-2 pr-4">Membership Ends</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2">Manual Renew</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-t border-white/10">
                  <td className="py-2 pr-4">{member.email}</td>
                  <td className="py-2 pr-4">{member.full_name ?? "—"}</td>
                  <td className="py-2 pr-4">
                    <form action={updateMemberRole} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={member.id} />
                      <select
                        name="role"
                        defaultValue={member.role}
                        className="rounded border border-white/20 bg-neutral-900 px-2 py-1 text-xs"
                      >
                        {ALL_ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="text-xs text-lime-400 hover:underline">
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="py-2 pr-4">{member.membership_end_date ?? "—"}</td>
                  <td className="py-2 pr-4">
                    <form action={toggleMemberActive}>
                      <input type="hidden" name="userId" value={member.id} />
                      <input type="hidden" name="isActive" value={String(member.is_active)} />
                      <button
                        type="submit"
                        className={member.is_active ? "text-xs text-green-400" : "text-xs text-red-400"}
                      >
                        {member.is_active ? "Active (suspend)" : "Suspended (activate)"}
                      </button>
                    </form>
                  </td>
                  <td className="py-2">
                    <form action={adminRenewMembership} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={member.id} />
                      <select
                        name="planSlug"
                        defaultValue={plans[0]?.slug}
                        className="rounded border border-white/20 bg-neutral-900 px-2 py-1 text-xs"
                      >
                        {plans.map((plan) => (
                          <option key={plan.slug} value={plan.slug}>
                            {plan.name}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="text-xs text-lime-400 hover:underline">
                        Renew
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {members.length === 0 && <p className="mt-4 text-sm text-neutral-400">No members found.</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold">Email Log</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Emails are mocked for now — nothing is actually delivered.
        </p>
        {emailLogs.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-400">No emails sent yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="text-neutral-500">
                <tr>
                  <th className="pb-2 pr-4">Recipient</th>
                  <th className="pb-2 pr-4">Subject</th>
                  <th className="pb-2 pr-4">Type</th>
                  <th className="pb-2 pr-4">Sent</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {emailLogs.map((log) => (
                  <tr key={log.id} className="border-t border-white/10">
                    <td className="py-2 pr-4">{log.recipient}</td>
                    <td className="py-2 pr-4">{log.subject}</td>
                    <td className="py-2 pr-4">{log.type}</td>
                    <td className="py-2 pr-4 text-neutral-400">{log.created_at}</td>
                    <td className="py-2">
                      <span
                        className={log.status === "sent" ? "text-xs text-green-400" : "text-xs text-red-400"}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold">AI Knowledge Base</h2>
        <p className="mt-1 text-xs text-neutral-500">
          The chat widget only answers from these entries — edits here change its replies immediately.
        </p>

        <form action={createKbEntry} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            name="question"
            placeholder="Question (for reference)"
            required
            className="rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-white/50 focus:outline-none"
          />
          <input
            type="text"
            name="keywords"
            placeholder="Keywords, comma-separated"
            required
            className="rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-white/50 focus:outline-none"
          />
          <textarea
            name="answer"
            placeholder="Answer"
            required
            rows={2}
            className="rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-white/50 focus:outline-none sm:col-span-2"
          />
          <button
            type="submit"
            className="self-start rounded-full bg-lime-400 px-5 py-2 text-xs font-semibold text-neutral-950 hover:bg-lime-300 sm:col-span-2"
          >
            Add Entry
          </button>
        </form>

        <ul className="mt-6 space-y-3">
          {kbEntries.map((entry) => (
            <li key={entry.id} className="rounded-lg border border-white/10 p-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{entry.question}</p>
                  <p className="mt-1 text-neutral-400">{entry.answer}</p>
                  <p className="mt-2 text-xs text-neutral-500">Keywords: {entry.keywords.join(", ")}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <form action={toggleKbActive}>
                    <input type="hidden" name="id" value={entry.id} />
                    <input type="hidden" name="isActive" value={String(entry.is_active)} />
                    <button
                      type="submit"
                      className={entry.is_active ? "text-xs text-green-400" : "text-xs text-red-400"}
                    >
                      {entry.is_active ? "Active (disable)" : "Disabled (enable)"}
                    </button>
                  </form>
                  <form action={deleteKbEntry}>
                    <input type="hidden" name="id" value={entry.id} />
                    <button type="submit" className="text-xs text-neutral-500 hover:text-red-400">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
          {kbEntries.length === 0 && <p className="text-sm text-neutral-400">No knowledge base entries yet.</p>}
        </ul>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold">Support Tickets</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Created automatically when the chat agent can&apos;t answer from the knowledge base.
        </p>
        {openTickets.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-400">No open tickets.</p>
        ) : (
          <ul className="mt-4 space-y-3 text-sm">
            {openTickets.map((ticket) => (
              <li
                key={ticket.id}
                className="flex items-start justify-between gap-4 rounded-lg border border-white/10 p-4"
              >
                <div>
                  <p>{ticket.message}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {ticket.email ?? "Anonymous visitor"} · {ticket.created_at}
                  </p>
                </div>
                <form action={resolveTicket}>
                  <input type="hidden" name="id" value={ticket.id} />
                  <button type="submit" className="shrink-0 text-xs text-lime-400 hover:underline">
                    Resolve
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold">Trainers</h2>
        <p className="mt-1 text-xs text-neutral-500">Shown on the public site&apos;s Personal Training section.</p>

        <form action={createTrainer} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            name="name"
            placeholder="Trainer name"
            required
            className="rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-white/50 focus:outline-none"
          />
          <input
            type="text"
            name="specialty"
            placeholder="Specialty"
            required
            className="rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-white/50 focus:outline-none"
          />
          <textarea
            name="bio"
            placeholder="Bio (optional)"
            rows={2}
            className="rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-white/50 focus:outline-none sm:col-span-2"
          />
          <button
            type="submit"
            className="self-start rounded-full bg-lime-400 px-5 py-2 text-xs font-semibold text-neutral-950 hover:bg-lime-300 sm:col-span-2"
          >
            Add Trainer
          </button>
        </form>

        <ul className="mt-6 space-y-2">
          {trainers.map((trainer) => (
            <li
              key={trainer.id}
              className="flex items-center justify-between rounded-lg border border-white/10 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">{trainer.name}</p>
                <p className="text-xs text-neutral-500">{trainer.specialty}</p>
              </div>
              <form action={toggleTrainerActive}>
                <input type="hidden" name="id" value={trainer.id} />
                <input type="hidden" name="isActive" value={String(trainer.is_active)} />
                <button
                  type="submit"
                  className={trainer.is_active ? "text-xs text-green-400" : "text-xs text-red-400"}
                >
                  {trainer.is_active ? "Active (hide)" : "Hidden (show)"}
                </button>
              </form>
            </li>
          ))}
          {trainers.length === 0 && <p className="text-sm text-neutral-400">No trainers yet.</p>}
        </ul>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold">Classes</h2>
        <p className="mt-1 text-xs text-neutral-500">Members book these from the portal.</p>

        <form action={createClass} className="mt-4 grid gap-3 sm:grid-cols-2">
          <select
            name="trainerId"
            required
            className="rounded-lg border border-white/20 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-white/50 focus:outline-none"
          >
            <option value="">Select trainer</option>
            {trainers.map((trainer) => (
              <option key={trainer.id} value={trainer.id}>
                {trainer.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="name"
            placeholder="Class name"
            required
            className="rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-white/50 focus:outline-none"
          />
          <input
            type="datetime-local"
            name="startsAt"
            required
            className="rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm text-white focus:border-white/50 focus:outline-none"
          />
          <input
            type="number"
            name="durationMinutes"
            placeholder="Duration (min)"
            defaultValue={60}
            min={1}
            required
            className="rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-white/50 focus:outline-none"
          />
          <input
            type="number"
            name="capacity"
            placeholder="Capacity"
            defaultValue={10}
            min={1}
            required
            className="rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-white/50 focus:outline-none"
          />
          <button
            type="submit"
            className="self-start rounded-full bg-lime-400 px-5 py-2 text-xs font-semibold text-neutral-950 hover:bg-lime-300 sm:col-span-2"
          >
            Add Class
          </button>
        </form>

        <ul className="mt-6 space-y-2">
          {classes.map((cls) => (
            <li
              key={cls.id}
              className="flex items-center justify-between rounded-lg border border-white/10 px-4 py-3 text-sm"
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
              <form action={deleteClass}>
                <input type="hidden" name="id" value={cls.id} />
                <button type="submit" className="text-xs text-neutral-500 hover:text-red-400">
                  Delete
                </button>
              </form>
            </li>
          ))}
          {classes.length === 0 && <p className="text-sm text-neutral-400">No classes scheduled.</p>}
        </ul>
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

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
