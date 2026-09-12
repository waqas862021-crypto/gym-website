import { describe, it, expect, vi, beforeEach } from "vitest";

const sqlMock = vi.fn();
vi.mock("@/lib/db", () => ({ sql: sqlMock }));

import { extendMembership, getCurrentMembership } from "./memberships";

function addDaysUtc(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

describe("extendMembership", () => {
  beforeEach(() => sqlMock.mockReset());

  it("starts from today when there is no existing membership", async () => {
    sqlMock.mockResolvedValueOnce({ rows: [] }); // select latest end_date
    sqlMock.mockResolvedValueOnce({ rows: [] }); // insert
    await extendMembership("user-1", "monthly", 30);

    const today = new Date().toISOString().slice(0, 10);
    const insertArgs = sqlMock.mock.calls[1];
    expect(insertArgs[4]).toBe(today);
    expect(insertArgs[5]).toBe(addDaysUtc(today, 30));
  });

  it("stacks onto an existing future end date instead of starting over", async () => {
    const today = new Date().toISOString().slice(0, 10);
    const futureEnd = addDaysUtc(today, 10);
    sqlMock.mockResolvedValueOnce({ rows: [{ end_date: futureEnd }] });
    sqlMock.mockResolvedValueOnce({ rows: [] });
    await extendMembership("user-1", "monthly", 30);

    const insertArgs = sqlMock.mock.calls[1];
    expect(insertArgs[4]).toBe(futureEnd);
    expect(insertArgs[5]).toBe(addDaysUtc(futureEnd, 30));
  });

  it("starts over from today when the previous membership already expired", async () => {
    const today = new Date().toISOString().slice(0, 10);
    const pastEnd = addDaysUtc(today, -10);
    sqlMock.mockResolvedValueOnce({ rows: [{ end_date: pastEnd }] });
    sqlMock.mockResolvedValueOnce({ rows: [] });
    await extendMembership("user-1", "monthly", 30);

    const insertArgs = sqlMock.mock.calls[1];
    expect(insertArgs[4]).toBe(today);
    expect(insertArgs[5]).toBe(addDaysUtc(today, 30));
  });
});

describe("getCurrentMembership", () => {
  beforeEach(() => sqlMock.mockReset());

  it("reports active when end_date is in the future", async () => {
    sqlMock.mockResolvedValueOnce({
      rows: [
        {
          plan_slug: "monthly",
          plan_name: "Monthly Membership",
          start_date: "2026-01-01",
          end_date: "2026-02-01",
          is_active: true,
        },
      ],
    });
    const result = await getCurrentMembership("u1");
    expect(result?.status).toBe("active");
  });

  it("reports expired when end_date has passed", async () => {
    sqlMock.mockResolvedValueOnce({
      rows: [
        {
          plan_slug: "monthly",
          plan_name: "Monthly Membership",
          start_date: "2020-01-01",
          end_date: "2020-02-01",
          is_active: false,
        },
      ],
    });
    const result = await getCurrentMembership("u1");
    expect(result?.status).toBe("expired");
  });

  it("returns null when there is no membership on file", async () => {
    sqlMock.mockResolvedValueOnce({ rows: [] });
    const result = await getCurrentMembership("u1");
    expect(result).toBeNull();
  });
});
