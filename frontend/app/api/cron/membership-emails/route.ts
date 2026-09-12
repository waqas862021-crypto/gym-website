import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { sendAndLogEmail } from "@/lib/email";

// Vercel Cron sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is
// set on the project — this rejects any other caller.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Each membership's end_date is fixed once inserted, so it equals
  // "today + 3" (or "today - 1") on exactly one calendar day — that's
  // enough to send each notice once per membership with no extra
  // sent-tracking column.
  const { rows: reminders } = await sql`
    with latest_memberships as (
      select distinct on (user_id) user_id, end_date
      from memberships
      order by user_id, end_date desc
    )
    select u.email, to_char(lm.end_date, 'YYYY-MM-DD') as end_date
    from users u
    join latest_memberships lm on lm.user_id = u.id
    where lm.end_date = current_date + 3
  `;
  for (const row of reminders) {
    await sendAndLogEmail(
      row.email,
      "Your Goodlife Fitness Gym membership is expiring soon",
      `Your membership ends on ${row.end_date}. Renew from your member portal to keep your access.`,
      "renewal_reminder",
    );
  }

  const { rows: expired } = await sql`
    with latest_memberships as (
      select distinct on (user_id) user_id, end_date
      from memberships
      order by user_id, end_date desc
    )
    select u.email
    from users u
    join latest_memberships lm on lm.user_id = u.id
    where lm.end_date = current_date - 1
  `;
  for (const row of expired) {
    await sendAndLogEmail(
      row.email,
      "Your Goodlife Fitness Gym membership has expired",
      "Your membership has expired. You can renew anytime from your member portal.",
      "membership_expired",
    );
  }

  return NextResponse.json({
    remindersSent: reminders.length,
    expiredNoticesSent: expired.length,
  });
}
