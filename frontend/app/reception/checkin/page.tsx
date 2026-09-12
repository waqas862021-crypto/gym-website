import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { RECEPTION_ROLES } from "@/lib/roles";
import { signOut } from "../../(auth)/actions";
import { checkInByToken, checkInByUserId } from "./actions";

export default async function ReceptionCheckinPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; error?: string; success?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!RECEPTION_ROLES.has(session.role)) redirect("/portal");

  const { q, error, success } = await searchParams;
  const search = (q ?? "").trim();
  const searchPattern = `%${search}%`;

  const [{ rows: members }, { rows: todaysCheckins }] = await Promise.all([
    search
      ? sql`
          select id, email, full_name
          from users
          where role = 'member'
            and (email ilike ${searchPattern} or coalesce(full_name, '') ilike ${searchPattern})
          order by created_at desc
          limit 20
        `
      : Promise.resolve({ rows: [] as { id: string; email: string; full_name: string | null }[] }),
    sql`
      select a.method, to_char(a.checked_in_at, 'HH24:MI') as checked_in_at,
        u.email, u.full_name
      from attendance a
      join users u on u.id = a.user_id
      where a.checked_in_at::date = current_date
      order by a.checked_in_at desc
      limit 30
    `,
  ]);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 bg-neutral-950 px-6 py-12 text-white">
      <div>
        <h1 className="text-3xl font-bold">Reception Check-In</h1>
        <p className="text-neutral-400">
          {session.email} · {session.role}
        </p>
      </div>

      {success && (
        <p className="rounded-lg border border-green-400/30 bg-green-400/10 px-4 py-3 text-lg text-green-400">
          {success}
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-lg text-red-400">
          {error}
        </p>
      )}

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold">Scan QR Code</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Scan the member&apos;s QR code — a handheld scanner types it in like a keyboard.
        </p>
        <form action={checkInByToken} className="mt-4">
          <input
            type="text"
            name="token"
            autoFocus
            placeholder="Scan or paste QR code"
            className="w-full rounded-lg border border-white/20 bg-transparent px-4 py-4 text-lg text-white placeholder:text-neutral-500 focus:border-white/50 focus:outline-none"
          />
        </form>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold">Manual Check-In</h2>
        <form method="get" className="mt-4">
          <input
            type="text"
            name="q"
            defaultValue={search}
            placeholder="Search member by name or email"
            className="w-full rounded-lg border border-white/20 bg-transparent px-4 py-3 text-white placeholder:text-neutral-500 focus:border-white/50 focus:outline-none"
          />
        </form>

        {search && (
          <ul className="mt-4 space-y-2">
            {members.length === 0 && <p className="text-sm text-neutral-400">No members found.</p>}
            {members.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between rounded-lg border border-white/10 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{member.full_name ?? member.email}</p>
                  <p className="text-xs text-neutral-500">{member.email}</p>
                </div>
                <form action={checkInByUserId}>
                  <input type="hidden" name="userId" value={member.id} />
                  <button
                    type="submit"
                    className="rounded-full bg-lime-400 px-5 py-2 text-sm font-semibold text-neutral-950 hover:bg-lime-300"
                  >
                    Check In
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold">Today&apos;s Check-Ins ({todaysCheckins.length})</h2>
        {todaysCheckins.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-400">No check-ins yet today.</p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm">
            {todaysCheckins.map((row, i) => (
              <li key={i} className="flex items-center justify-between border-b border-white/10 pb-2 last:border-0">
                <span>{row.full_name ?? row.email}</span>
                <span className="text-neutral-500">
                  {row.checked_in_at} · {row.method}
                </span>
              </li>
            ))}
          </ul>
        )}
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
