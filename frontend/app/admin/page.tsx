import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { ADMIN_ROLES, type AppRole } from "@/lib/roles";
import { signOut } from "../(auth)/actions";
import { updateMemberRole, toggleMemberActive, adminRenewMembership } from "./actions";

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

  const [{ rows: statRows }, { rows: members }, { rows: plans }] = await Promise.all([
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
          where end_date >= current_date and end_date <= current_date + interval '7 days') as upcoming_expirations
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
  ]);
  const stats = statRows[0];

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 bg-neutral-950 px-6 py-16 text-white">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-neutral-400">
          {session.email} · {session.role}
        </p>
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
        <StatCard label="Today's Attendance" value="Coming in Phase 7" />
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
