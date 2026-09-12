export type AppRole =
  | "super_admin"
  | "admin"
  | "reception"
  | "customer_service"
  | "member";

export const ADMIN_ROLES: ReadonlySet<AppRole> = new Set(["admin", "super_admin"]);

export const RECEPTION_ROLES: ReadonlySet<AppRole> = new Set(["reception", "admin", "super_admin"]);
