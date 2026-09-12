import { NextResponse, type NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/roles";

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => {
    const s = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  for (const row of rows) lines.push(headers.map((h) => escape(row[h])).join(","));
  return lines.join("\n");
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || !ADMIN_ROLES.has(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const type = request.nextUrl.searchParams.get("type");
  let rows: Record<string, unknown>[];
  let filename: string;

  if (type === "memberships") {
    ({ rows } = await sql`
      select u.email, p.name as plan,
        to_char(m.start_date, 'YYYY-MM-DD') as start_date,
        to_char(m.end_date, 'YYYY-MM-DD') as end_date,
        case when m.end_date >= current_date then 'active' else 'expired' end as status
      from memberships m
      join users u on u.id = m.user_id
      join membership_plans p on p.slug = m.plan_slug
      order by m.created_at desc
    `);
    filename = "memberships.csv";
  } else if (type === "payments") {
    ({ rows } = await sql`
      select u.email, pay.plan_slug as plan, pay.amount_sar, pay.status,
        to_char(pay.created_at, 'YYYY-MM-DD HH24:MI') as created_at
      from payments pay
      join users u on u.id = pay.user_id
      order by pay.created_at desc
    `);
    filename = "payments.csv";
  } else if (type === "attendance") {
    ({ rows } = await sql`
      select u.email, a.method, to_char(a.checked_in_at, 'YYYY-MM-DD HH24:MI') as checked_in_at
      from attendance a
      join users u on u.id = a.user_id
      order by a.checked_in_at desc
    `);
    filename = "attendance.csv";
  } else {
    return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
  }

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
