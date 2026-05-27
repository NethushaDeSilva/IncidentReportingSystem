import { useState } from "react";
import { Link } from "react-router-dom";
import SummaryCard from "../Components/SummaryCard";
import ReporterStatusBadge from "../Components/ReporterStatusBadge";
import { useApp } from "../Context/AppContextBase";
import { useIncidents } from "../hooks/useIncidents";
import { assignIncident } from "../services/incidentService";
import { notifyUser } from "../utils/browserCapabilities";
import { formatDate, isActiveIncident, isHighPriority } from "../utils/formatters";
import DispatcherLayout from "./DispatcherLayout";

export default function DispatcherDashboard() {
  const { appConfig, profile, user } = useApp();
  const { error, incidents, loading, patchIncident, refreshIncidents, stats } = useIncidents({ priorityFirst: true });
  const [selectedUnits, setSelectedUnits] = useState({});
  const [assigningId, setAssigningId] = useState("");
  const [assignmentError, setAssignmentError] = useState("");
  const priorityIncidents = incidents.filter((incident) => isActiveIncident(incident) && isHighPriority(incident));

  async function handleAssign(incident) {
    const selectedUnitId = selectedUnits[incident.id] || incident.assignedUnitId || appConfig.responseUnits[0]?.id;
    const unit = appConfig.responseUnits.find((item) => item.id === selectedUnitId);
    if (!unit) return;

    const dispatcherId = user?.uid || "";
    const dispatcherEmail = profile?.email || user?.email || "";
    const assignmentPreview = {
      assigned: unit.name,
      assignedUnitId: unit.id,
      assignedUnitType: unit.type,
      assignedUserId: dispatcherId,
      assignedDispatcherId: dispatcherId,
      assignedDispatcherEmail: dispatcherEmail,
      status: "Open",
    };

    setAssignmentError("");
    setAssigningId(incident.id);
    patchIncident(incident.id, assignmentPreview);
    try {
      await assignIncident(incident.id, unit, {
        id: dispatcherId,
        uid: dispatcherId,
        email: dispatcherEmail,
      });
      notifyUser(appConfig.brand.name, `${incident.incidentId || "Incident"} assigned.`).catch(() => {});
    } catch (assignmentError) {
      console.error("Unable to assign incident:", assignmentError);
      setAssignmentError("Could not assign this incident. Please try again.");
      await refreshIncidents({ silent: true });
    } finally {
      setAssigningId("");
    }
  }

  return (
    <DispatcherLayout>
      <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#5F675C] dark:text-slate-400">
            Dispatch Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Welcome {profile?.fullName || "Dispatcher"}
          </h1>
        </div>
        <Link
          to="/dispatcher/assign"
          className="inline-flex justify-center rounded-lg bg-[#3D4461] px-7 py-3 font-black text-white shadow-lg transition hover:bg-[#30364f]"
        >
          Active Incidents
        </Link>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total Incidents" value={loading ? "..." : stats.total} />
        <SummaryCard title="Active Incidents" value={loading ? "..." : stats.active} tone="danger" />
        <SummaryCard title="Resolved Incidents" value={loading ? "..." : stats.resolved} tone="success" />
        <SummaryCard title="High-priority Incidents" value={loading ? "..." : stats.highPriority} tone="warning" />
      </section>

      {error && <p className="mb-6 rounded-lg bg-rose-50 p-4 font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{error}</p>}
      {assignmentError && <p className="mb-6 rounded-lg bg-rose-50 p-4 font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{assignmentError}</p>}

      <section className="overflow-hidden rounded-lg border border-white/60 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-5 py-4 dark:border-white/10">
          <h2 className="text-xl font-black">High-priority incidents</h2>
        </div>
        {loading ? (
          <div className="p-12 text-center font-bold text-slate-500">Loading incidents...</div>
        ) : priorityIncidents.length === 0 ? (
          <div className="p-12 text-center font-bold text-slate-500">No active high-priority incidents.</div>
        ) : (
          <div className="max-h-[58vh] overflow-auto">
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="px-5 py-4">Incident ID</th>
                  <th className="px-5 py-4">Incident Type</th>
                  <th className="px-5 py-4">Date Reported</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Priority</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4">Assign Unit</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {priorityIncidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">
                      {incident.incidentId || incident.id.slice(0, 8)}
                    </td>
                    <td className="px-5 py-4 font-black">{incident.type || "-"}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {incident.date || formatDate(incident.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{incident.location || "-"}</td>
                    <td className="px-5 py-4 font-bold">{incident.priority || "Medium"}</td>
                    <td className="px-5 py-4 text-center">
                      <ReporterStatusBadge status={incident.status} />
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={selectedUnits[incident.id] || incident.assignedUnitId || appConfig.responseUnits[0]?.id || ""}
                        onChange={(event) =>
                          setSelectedUnits((prev) => ({ ...prev, [incident.id]: event.target.value }))
                        }
                        className="field-input min-w-56"
                      >
                        {appConfig.responseUnits.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleAssign(incident)}
                        disabled={assigningId === incident.id}
                        className="rounded-lg bg-[#3D4461] px-5 py-2.5 font-black text-white shadow-lg transition hover:bg-[#30364f] disabled:opacity-60"
                      >
                        {assigningId === incident.id ? "..." : incident.assignedUserId ? "REASSIGN" : "ASSIGN"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DispatcherLayout>
  );
}
