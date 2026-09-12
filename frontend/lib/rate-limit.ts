import "server-only";
import { headers } from "next/headers";
import { sql } from "@/lib/db";

// A fixed-window counter backed by the same Postgres database — chosen over
// an external service (e.g. Upstash) to avoid a second account beyond the
// Vercel one already in use (see CLAUDE.md). The upsert is atomic per key
// via Postgres row locking, which is precise enough at this app's scale.
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const { rows } = await sql`
    insert into rate_limits (key, window_start, count)
    values (${key}, now(), 1)
    on conflict (key) do update set
      count = case
        when rate_limits.window_start < now() - (${windowSeconds}::text || ' seconds')::interval then 1
        else rate_limits.count + 1
      end,
      window_start = case
        when rate_limits.window_start < now() - (${windowSeconds}::text || ' seconds')::interval then now()
        else rate_limits.window_start
      end
    returning count
  `;
  return rows[0].count <= limit;
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}
