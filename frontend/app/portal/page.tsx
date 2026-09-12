import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../(auth)/actions";

export default async function PortalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-950 px-6 text-center text-white">
      <h1 className="text-3xl font-bold">Member Portal</h1>
      <p className="text-neutral-400">
        Logged in as {user.email} · role: {profile?.role ?? "unknown"}
      </p>
      <p className="max-w-md text-sm text-neutral-500">
        This is a Phase 2 skeleton — membership status, profile editing, and
        payments arrive in later phases.
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
