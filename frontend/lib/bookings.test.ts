import { describe, it, expect, vi, beforeEach } from "vitest";

const sqlMock = vi.fn();
vi.mock("@/lib/db", () => ({ sql: sqlMock }));

import { bookClass, cancelBooking } from "./bookings";

const future = () => new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);

describe("bookClass", () => {
  beforeEach(() => sqlMock.mockReset());

  it("rejects an unknown user", async () => {
    sqlMock.mockResolvedValueOnce({ rows: [] });
    expect(await bookClass("u1", "c1")).toEqual({ ok: false, reason: "not_found" });
  });

  it("rejects a suspended account", async () => {
    sqlMock.mockResolvedValueOnce({ rows: [{ is_active: false }] });
    expect(await bookClass("u1", "c1")).toEqual({ ok: false, reason: "inactive" });
  });

  it("rejects a member with no membership", async () => {
    sqlMock.mockResolvedValueOnce({ rows: [{ is_active: true }] });
    sqlMock.mockResolvedValueOnce({ rows: [] });
    expect(await bookClass("u1", "c1")).toEqual({ ok: false, reason: "no_membership" });
  });

  it("rejects an expired membership", async () => {
    sqlMock.mockResolvedValueOnce({ rows: [{ is_active: true }] });
    sqlMock.mockResolvedValueOnce({ rows: [{ end_date: "2000-01-01" }] });
    expect(await bookClass("u1", "c1")).toEqual({ ok: false, reason: "expired" });
  });

  it("rejects a class that doesn't exist", async () => {
    sqlMock.mockResolvedValueOnce({ rows: [{ is_active: true }] });
    sqlMock.mockResolvedValueOnce({ rows: [{ end_date: future() }] });
    sqlMock.mockResolvedValueOnce({ rows: [] });
    expect(await bookClass("u1", "c1")).toEqual({ ok: false, reason: "class_not_found" });
  });

  it("rejects a duplicate booking", async () => {
    sqlMock.mockResolvedValueOnce({ rows: [{ is_active: true }] });
    sqlMock.mockResolvedValueOnce({ rows: [{ end_date: future() }] });
    sqlMock.mockResolvedValueOnce({ rows: [{ name: "Yoga", capacity: 10 }] });
    sqlMock.mockResolvedValueOnce({ rows: [{ id: "existing" }] });
    expect(await bookClass("u1", "c1")).toEqual({ ok: false, reason: "already_booked" });
  });

  it("rejects booking a full class", async () => {
    sqlMock.mockResolvedValueOnce({ rows: [{ is_active: true }] });
    sqlMock.mockResolvedValueOnce({ rows: [{ end_date: future() }] });
    sqlMock.mockResolvedValueOnce({ rows: [{ name: "Yoga", capacity: 1 }] });
    sqlMock.mockResolvedValueOnce({ rows: [] });
    sqlMock.mockResolvedValueOnce({ rows: [{ count: "1" }] });
    expect(await bookClass("u1", "c1")).toEqual({ ok: false, reason: "class_full" });
  });

  it("books an open spot", async () => {
    sqlMock.mockResolvedValueOnce({ rows: [{ is_active: true }] });
    sqlMock.mockResolvedValueOnce({ rows: [{ end_date: future() }] });
    sqlMock.mockResolvedValueOnce({ rows: [{ name: "Yoga", capacity: 10 }] });
    sqlMock.mockResolvedValueOnce({ rows: [] });
    sqlMock.mockResolvedValueOnce({ rows: [{ count: "3" }] });
    sqlMock.mockResolvedValueOnce({ rows: [] }); // insert
    expect(await bookClass("u1", "c1")).toEqual({ ok: true, className: "Yoga" });
  });
});

describe("cancelBooking", () => {
  it("deletes the booking row for that class and user", async () => {
    sqlMock.mockReset();
    sqlMock.mockResolvedValueOnce({ rows: [] });
    await cancelBooking("u1", "c1");
    expect(sqlMock).toHaveBeenCalledTimes(1);
    expect(sqlMock.mock.calls[0]).toContain("u1");
    expect(sqlMock.mock.calls[0]).toContain("c1");
  });
});
