import { formatDate, getIncidentDate } from "./formatters";

export const DEFAULT_INCIDENT_FILTERS = {
  type: "All",
  date: "All",
  location: "All",
  priority: "All",
  status: "All",
};

export const INCIDENT_FILTER_LABELS = {
  type: "Incident Type",
  date: "Date Reported",
  location: "Location",
  priority: "Priority",
  status: "Status",
};

export function getIncidentDateLabel(incident) {
  return incident?.date || formatDate(getIncidentDate(incident));
}

function formatDateInputValue(value) {
  if (!value) return "";
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getIncidentDateFilterValue(incident) {
  if (/^\d{4}-\d{2}-\d{2}/.test(incident?.date || "")) {
    return incident.date.slice(0, 10);
  }

  const date = getIncidentDate(incident);
  return date ? formatDateInputValue(date) : "";
}

export function getIncidentFilterValue(incident, key) {
  if (key === "type") return incident?.type || "-";
  if (key === "date") return getIncidentDateFilterValue(incident);
  if (key === "location") return incident?.location || "-";
  if (key === "priority") return incident?.priority || "Medium";
  if (key === "status") return incident?.status || "notAssigned";
  return "";
}

export function getIncidentFilterOptions(incidents) {
  return Object.keys(DEFAULT_INCIDENT_FILTERS).reduce((options, key) => {
    const values = incidents
      .map((incident) => getIncidentFilterValue(incident, key))
      .filter((value) => value && value !== "-");

    options[key] = [...new Set(values)].sort((a, b) => a.localeCompare(b));
    return options;
  }, {});
}

export function applyIncidentFilters(incidents, filters) {
  return incidents.filter((incident) =>
    Object.entries(filters).every(([key, selected]) => {
      if (!selected || selected === "All") return true;
      return getIncidentFilterValue(incident, key) === selected;
    })
  );
}
