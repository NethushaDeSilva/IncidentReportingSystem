import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { isActiveIncident, isHighPriority, sortNewestFirst, sortPriorityFirst } from "../utils/formatters";

async function fetchIncidents(reporterId, assignedUserId) {
  const queryConstraints = [];
  if (reporterId) queryConstraints.push(where("reporterId", "==", reporterId));
  if (assignedUserId) queryConstraints.push(where("assignedUserId", "==", assignedUserId));

  const incidentQuery = queryConstraints.length
    ? query(collection(db, "Incidents"), ...queryConstraints)
    : collection(db, "Incidents");

  const snapshot = await getDocs(incidentQuery);
  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

export function useIncidents({
  reporterId,
  assignedUserId,
  activeOnly = false,
  priorityFirst = false,
  refreshIntervalMs = 15000,
} = {}) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshIncidents = useCallback(
    async ({ silent = true } = {}) => {
      if (!silent) setLoading(true);

      try {
        const nextIncidents = await fetchIncidents(reporterId, assignedUserId);
        setIncidents(nextIncidents);
        setLoading(false);
        setError("");
        return nextIncidents;
      } catch (snapshotError) {
        console.error("Unable to load incidents:", snapshotError);
        setError(
          snapshotError?.code === "permission-denied"
            ? "Firebase rules are blocking incident access for this account."
            : "Could not load incident data."
        );
        setLoading(false);
        return [];
      }
    },
    [assignedUserId, reporterId]
  );

  const patchIncident = useCallback((incidentId, updates) => {
    setIncidents((currentIncidents) =>
      currentIncidents.map((incident) =>
        incident.id === incidentId
          ? {
              ...incident,
              ...(typeof updates === "function" ? updates(incident) : updates),
            }
          : incident
      )
    );
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadIncidents({ silent = false } = {}) {
      if (!silent) setLoading(true);

      try {
        const nextIncidents = await fetchIncidents(reporterId, assignedUserId);
        if (cancelled) return;

        setIncidents(nextIncidents);
        setLoading(false);
        setError("");
      } catch (snapshotError) {
        if (cancelled) return;

        console.error("Unable to load incidents:", snapshotError);
        setError(
          snapshotError?.code === "permission-denied"
            ? "Firebase rules are blocking incident access for this account."
            : "Could not load incident data."
        );
        setLoading(false);
      }
    }

    loadIncidents();
    const intervalId =
      refreshIntervalMs > 0
        ? window.setInterval(() => loadIncidents({ silent: true }), refreshIntervalMs)
        : null;

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [assignedUserId, refreshIntervalMs, reporterId]);

  const filteredIncidents = useMemo(() => {
    return incidents
      .filter((incident) => {
        if (reporterId && incident.reporterId !== reporterId) return false;
        if (assignedUserId && incident.assignedUserId !== assignedUserId) return false;
        if (activeOnly && !isActiveIncident(incident)) return false;
        return true;
      })
      .sort(priorityFirst ? sortPriorityFirst : sortNewestFirst);
  }, [activeOnly, assignedUserId, incidents, priorityFirst, reporterId]);

  const stats = useMemo(() => {
    const active = filteredIncidents.filter(isActiveIncident);
    const inProgress = filteredIncidents.filter((incident) => incident.status === "In Progress");
    const resolved = filteredIncidents.filter((incident) => ["Resolved", "Closed"].includes(incident.status));
    const notAssigned = active.filter(
      (incident) => !incident.assignedUserId && ["notAssigned", "Open"].includes(incident.status || "notAssigned")
    );

    return {
      total: filteredIncidents.length,
      active: active.length,
      notAssigned: notAssigned.length,
      inProgress: inProgress.length,
      resolved: resolved.length,
      highPriority: filteredIncidents.filter(isHighPriority).length,
    };
  }, [filteredIncidents]);

//   const stats = useMemo(() => {
//   const  notAssigned= filteredIncidents.filter((incident) =>
//     ["notAssigned", "Open"].includes(incident.status || "notAssigned")
//   );

//   const inProgress = filteredIncidents.filter(
//     (incident) => incident.status === "In Progress"
//   );

//   const resolved = filteredIncidents.filter((incident) =>
//     ["Resolved", "Closed"].includes(incident.status)
//   );

  
//   const active = [...notAssigned, ...inProgress];

//   return {
//     total: notAssigned.length + inProgress.length + resolved.length,
//     active: active.length,
//     notAssigned: notAssigned.length,
//     inProgress: inProgress.length,
//     resolved: resolved.length,
//     highPriority: filteredIncidents.filter(isHighPriority).length,
//   };
// }, [filteredIncidents]);

  return { incidents: filteredIncidents, loading, error, patchIncident, refreshIncidents, stats };
}
