import Link from "next/link";
import { signUp } from "../actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white">Create an account</h1>

        <form action={signUp} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none focus:border-lime-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none focus:border-lime-400"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-lime-400 px-6 py-3.5 text-sm font-semibold text-neutral-950 transition-transform hover:scale-[1.02]"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-sm text-neutral-500">
          Already have an account?{" "}
          <Link href="/login" className="text-lime-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
