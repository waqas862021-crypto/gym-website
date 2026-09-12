import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/roles";
import { SimpleBarChart } from "@/components/admin/simple-bar-chart";
import {
  getMembershipsByMonth,
  getMembershipsByPlan,
  getRevenueByMonth,
  getRevenueByPlan,
  getPaymentStatusBreakdown,
  getAttendanceByDay,
  getAttendanceByMethod,
  getTopAttendees,
} from "@/lib/reports";

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!ADMIN_ROLES.has(session.role)) redirect("/portal");

  const [
    membershipsByMonth,
    membershipsByPlan,
    revenueByMonth,
    revenueByPlan,
    paymentStatus,
    attendanceByDay,
    attendanceByMethod,
    topAttendees,
  ] = await Promise.all([
    getMembershipsByMonth(),
    getMembershipsByPlan(),
    getRevenueByMonth(),
    getRevenueByPlan(),
    getPaymentStatusBreakdown(),
    getAttendanceByDay(),
    getAttendanceByMethod(),
    getTopAttendees(10),
  ]);

  const totalRevenue = revenueByPlan.reduce((sum, p) => sum + p.revenue, 0);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 bg-neutral-950 px-6 py-16 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-neutral-400">Membership, financial, and attendance activity.</p>
        </div>
        <Link href="/admin" className="text-sm text-lime-400 hover:underline">
          Back to Admin
        </Link>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Membership Report</h2>
          <a href="/admin/reports/export?type=memberships" className="text-xs text-lime-400 hover:underline">
            Export CSV
          </a>
        </div>
        <p className="mt-1 text-xs text-neutral-500">New memberships started, per month (last 12 months).</p>
        <div className="mt-4">
          <SimpleBarChart
            data={membershipsByMonth}
            xKey="month"
            yKey="count"
          />
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="text-neutral-500">
              <tr>
                <th className="pb-2 pr-4">Plan</th>
                <th className="pb-2 pr-4">Active</th>
                <th className="pb-2">Expired</th>
              </tr>
            </thead>
            <tbody>
              {membershipsByPlan.map((row) => (
                <tr key={row.planSlug} className="border-t border-white/10">
                  <td className="py-2 pr-4">{row.planName}</td>
                  <td className="py-2 pr-4 text-green-400">{row.active}</td>
                  <td className="py-2 text-red-400">{row.expired}</td>
                </tr>
              ))}
              {membershipsByPlan.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-neutral-400">
                    No memberships yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Financial Report</h2>
          <a href="/admin/reports/export?type=payments" className="text-xs text-lime-400 hover:underline">
            Export CSV
          </a>
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          Total revenue (succeeded payments): <span className="font-semibold text-white">{totalRevenue} SAR</span>
        </p>
        <div className="mt-4">
          <SimpleBarChart data={revenueByMonth} xKey="month" yKey="revenue" />
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead className="text-neutral-500">
                <tr>
                  <th className="pb-2 pr-4">Plan</th>
                  <th className="pb-2 pr-4">Payments</th>
                  <th className="pb-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {revenueByPlan.map((row) => (
                  <tr key={row.planSlug} className="border-t border-white/10">
                    <td className="py-2 pr-4">{row.planName}</td>
                    <td className="py-2 pr-4">{row.count}</td>
                    <td className="py-2">{row.revenue} SAR</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead className="text-neutral-500">
                <tr>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Count</th>
                  <th className="pb-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {paymentStatus.map((row) => (
                  <tr key={row.status} className="border-t border-white/10">
                    <td className="py-2 pr-4 capitalize">{row.status}</td>
                    <td className="py-2 pr-4">{row.count}</td>
                    <td className="py-2">{row.total} SAR</td>
                  </tr>
                ))}
                {paymentStatus.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-neutral-400">
                      No payments yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Attendance Report</h2>
          <a href="/admin/reports/export?type=attendance" className="text-xs text-lime-400 hover:underline">
            Export CSV
          </a>
        </div>
        <p className="mt-1 text-xs text-neutral-500">Check-ins per day (last 30 days).</p>
        <div className="mt-4">
          <SimpleBarChart data={attendanceByDay} xKey="day" yKey="count" color="#38bdf8" />
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[240px] text-left text-sm">
              <thead className="text-neutral-500">
                <tr>
                  <th className="pb-2 pr-4">Method</th>
                  <th className="pb-2">Check-ins</th>
                </tr>
              </thead>
              <tbody>
                {attendanceByMethod.map((row) => (
                  <tr key={row.method} className="border-t border-white/10">
                    <td className="py-2 pr-4 capitalize">{row.method}</td>
                    <td className="py-2">{row.count}</td>
                  </tr>
                ))}
                {attendanceByMethod.length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-4 text-neutral-400">
                      No check-ins yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="overflow-x-auto">
            <p className="mb-2 text-xs font-medium text-neutral-400">Most active members</p>
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead className="text-neutral-500">
                <tr>
                  <th className="pb-2 pr-4">Member</th>
                  <th className="pb-2">Visits</th>
                </tr>
              </thead>
              <tbody>
                {topAttendees.map((row) => (
                  <tr key={row.userId} className="border-t border-white/10">
                    <td className="py-2 pr-4">{row.name || row.email}</td>
                    <td className="py-2">{row.visits}</td>
                  </tr>
                ))}
                {topAttendees.length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-4 text-neutral-400">
                      No check-ins yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
