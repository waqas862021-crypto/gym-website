import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { getCurrentMembership } from "@/lib/memberships";
import { signOut } from "../(auth)/actions";
import { updateProfile } from "./actions";

export default async function PortalPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [{ rows }, membership] = await Promise.all([
    sql`select full_name from users where id = ${session.userId}`,
    getCurrentMembership(session.userId),
  ]);
  const fullName: string = rows[0]?.full_name ?? "";

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 bg-neutral-950 px-6 py-16 text-white">
      <div>
        <h1 className="text-3xl font-bold">Member Portal</h1>
        <p className="text-neutral-400">{session.email}</p>
      </div>

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
