import type { UserRole } from "@prisma/client";

export const permissions = {
  listings_read: ["ADMIN", "AGENCY_OWNER", "AGENT"],
  listings_write: ["ADMIN", "AGENCY_OWNER", "AGENT"],
  listings_publish: ["ADMIN", "AGENCY_OWNER", "AGENT"],
  leads_read: ["ADMIN", "AGENCY_OWNER", "AGENT"],
  leads_write: ["ADMIN", "AGENCY_OWNER", "AGENT"],
  billing_manage: ["ADMIN", "AGENCY_OWNER"],
  api_keys_manage: ["ADMIN", "AGENCY_OWNER"],
  admin_read: ["ADMIN"],
  ops_read: ["ADMIN", "AGENCY_OWNER"],
  feature_flags_manage: ["ADMIN"]
} as const;

export type Permission = keyof typeof permissions;

export function can(role: UserRole | string, permission: Permission) {
  return (permissions[permission] as readonly string[]).includes(role);
}

export function assertCan(role: UserRole | string, permission: Permission) {
  if (!can(role, permission)) throw new Error(`Forbidden: missing permission ${permission}`);
}

export function roleMatrix() {
  return Object.entries(permissions).map(([permission, roles]) => ({ permission, roles }));
}
