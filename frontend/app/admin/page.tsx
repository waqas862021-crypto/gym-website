import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/roles";
import { signOut } from "../(auth)/actions";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!ADMIN_ROLES.has(session.role)) redirect("/portal");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-950 px-6 text-center text-white">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-neutral-400">
        Logged in as {session.email} · role: {session.role}
      </p>
      <p className="max-w-md text-sm text-neutral-500">
        This is a Phase 2 skeleton — member management, stats, and the rest
        of the dashboard arrive in Phase 5.
      </p>
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
