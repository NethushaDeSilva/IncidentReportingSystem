export function inferRoleFromEmail(email) {
  const username = String(email || "").split("@")[0].toLowerCase();
  if (username.startsWith("admin")) return "admin";
  if (username.startsWith("dispatcher")) return "dispatcher";
  if (
    username.startsWith("paramedic") ||
    username.startsWith("medic") ||
    username.startsWith("ambulance") ||
    username.startsWith("amb")
  ) {
    return "paramedic";
  }
  return "reporter";
}

export function buildFallbackProfile(user) {
  return {
    uid: user.uid,
    id: user.uid,
    email: user.email,
    fullName: user.displayName || user.email?.split("@")[0] || "User",
    role: inferRoleFromEmail(user.email),
    status: "Active",
    profileSource: "auth-fallback",
  };
}
