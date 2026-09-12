import { describe, it, expect, vi, beforeEach } from "vitest";

const sqlMock = vi.fn();
vi.mock("@/lib/db", () => ({ sql: sqlMock }));

import { recordAttendance } from "./attendance";

const future = () => new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);

describe("recordAttendance", () => {
  beforeEach(() => sqlMock.mockReset());

  it("rejects an unknown user", async () => {
    sqlMock.mockResolvedValueOnce({ rows: [] });
    expect(await recordAttendance("u1", "manual")).toEqual({ ok: false, reason: "not_found" });
  });

  it("rejects a suspended account", async () => {
    sqlMock.mockResolvedValueOnce({ rows: [{ email: "a@b.com", full_name: null, is_active: false }] });
    expect(await recordAttendance("u1", "manual")).toEqual({ ok: false, reason: "inactive" });
  });

  it("rejects a member with no membership on file", async () => {
    sqlMock.mockResolvedValueOnce({ rows: [{ email: "a@b.com", full_name: null, is_active: true }] });
    sqlMock.mockResolvedValueOnce({ rows: [] });
    expect(await recordAttendance("u1", "manual")).toEqual({ ok: false, reason: "no_membership" });
  });

  it("rejects an expired membership", async () => {
    sqlMock.mockResolvedValueOnce({ rows: [{ email: "a@b.com", full_name: null, is_active: true }] });
    sqlMock.mockResolvedValueOnce({ rows: [{ end_date: "2000-01-01" }] });
    expect(await recordAttendance("u1", "manual")).toEqual({ ok: false, reason: "expired" });
  });

  it("rejects a second check-in on the same day", async () => {
    sqlMock.mockResolvedValueOnce({ rows: [{ email: "a@b.com", full_name: null, is_active: true }] });
    sqlMock.mockResolvedValueOnce({ rows: [{ end_date: future() }] });
    sqlMock.mockResolvedValueOnce({ rows: [{ id: "existing" }] });
    expect(await recordAttendance("u1", "manual")).toEqual({ ok: false, reason: "already_checked_in" });
  });

  it("records a valid check-in", async () => {
    sqlMock.mockResolvedValueOnce({ rows: [{ email: "a@b.com", full_name: "Alice", is_active: true }] });
    sqlMock.mockResolvedValueOnce({ rows: [{ end_date: future() }] });
    sqlMock.mockResolvedValueOnce({ rows: [] });
    sqlMock.mockResolvedValueOnce({ rows: [] }); // insert
    expect(await recordAttendance("u1", "manual")).toEqual({ ok: true, label: "Alice" });
  });
});
