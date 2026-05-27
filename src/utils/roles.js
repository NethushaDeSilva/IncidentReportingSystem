export const ROLES = ["reporter", "dispatcher", "admin", "paramedic"];

export function normalizeRole(role) {
  const nextRole = String(role || "reporter").trim().toLowerCase();
  return ROLES.includes(nextRole) ? nextRole : "reporter";
}
