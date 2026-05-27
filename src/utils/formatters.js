const priorityRank = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === "function") return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(value) {
  const date = toDate(value);
  if (!date) return "-";
  return date.toLocaleDateString();
}

export function formatDateTime(value) {
  const date = toDate(value);
  if (!date) return "-";
  return date.toLocaleString();
}

export function getIncidentDate(incident) {
  return toDate(incident?.createdAt) || toDate(incident?.dateTime) || toDate(incident?.date);
}

export function sortNewestFirst(a, b) {
  return (getIncidentDate(b)?.getTime() || 0) - (getIncidentDate(a)?.getTime() || 0);
}

export function sortPriorityFirst(a, b) {
  const rankDiff = (priorityRank[b?.priority] || 0) - (priorityRank[a?.priority] || 0);
  if (rankDiff !== 0) return rankDiff;
  return sortNewestFirst(a, b);
}

export function isActiveIncident(incident) {
  return !["Resolved", "Closed"].includes(incident?.status);
}

export function isHighPriority(incident) {
  return ["High", "Critical"].includes(incident?.priority);
}

export function initials(value = "") {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "HL";
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export function distanceInKm(a, b) {
  if (!a?.latitude || !a?.longitude || !b?.latitude || !b?.longitude) return null;

  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const value =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}
