import { describe, it, expect } from "vitest";
import { ADMIN_ROLES, RECEPTION_ROLES } from "./roles";

describe("role boundaries", () => {
  it("only admin and super_admin are admin roles", () => {
    expect(ADMIN_ROLES.has("admin")).toBe(true);
    expect(ADMIN_ROLES.has("super_admin")).toBe(true);
    expect(ADMIN_ROLES.has("reception")).toBe(false);
    expect(ADMIN_ROLES.has("member")).toBe(false);
    expect(ADMIN_ROLES.has("customer_service")).toBe(false);
  });

  it("reception roles are reception, admin, and super_admin only", () => {
    expect(RECEPTION_ROLES.has("reception")).toBe(true);
    expect(RECEPTION_ROLES.has("admin")).toBe(true);
    expect(RECEPTION_ROLES.has("super_admin")).toBe(true);
    expect(RECEPTION_ROLES.has("member")).toBe(false);
    expect(RECEPTION_ROLES.has("customer_service")).toBe(false);
  });
});
