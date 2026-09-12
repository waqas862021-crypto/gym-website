import "server-only";
import { randomUUID } from "node:crypto";
import { sql } from "@/lib/db";

// user_id null = a broadcast notification for every admin (e.g. a new
// escalated support ticket), rather than one specific member's own alert.
export async function notifyAdmins(title: string, body: string): Promise<void> {
  await sql`
    insert into notifications (id, user_id, channel, title, body)
    values (${randomUUID()}, null, 'in_app', ${title}, ${body})
  `;
}
