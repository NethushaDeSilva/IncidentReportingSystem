import { useMemo, useState } from "react";
import ReporterStatusBadge from "../Components/ReporterStatusBadge";
import { useIncidents } from "../hooks/useIncidents";
import { formatDate, getIncidentDate, sortNewestFirst } from "../utils/formatters";
import DispatcherLayout from "./DispatcherLayout";

export default function DispatcherReports() {
  const { incidents, loading } = useIncidents();
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = useMemo(
    () =>
      incidents
        .filter((incident) => statusFilter === "All" || (incident.status || "notAssigned") === statusFilter)
        .sort((a, b) => sortNewestFirst(a, b)),
    [incidents, statusFilter]
  );

  return (
    <DispatcherLayout>
      <header className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#5F675C] dark:text-slate-400">
          Dispatch
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">View Reports</h1>
      </header>

      <section className="mb-6 flex flex-wrap gap-2">
        {["All", "notAssigned", "In Progress", "Resolved", "Closed"].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`rounded-lg px-4 py-3 text-sm font-black transition ${
              statusFilter === status
                ? "bg-[#3D4461] text-white"
                : "bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            {status}
          </button>
        ))}
      </section>

      <section className="overflow-hidden rounded-lg border border-white/60 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900">
        {loading ? (
          <div className="p-12 text-center font-bold text-slate-500">Loading reports...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center font-bold text-slate-500">No reports found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="px-5 py-4">Incident ID</th>
                  <th className="px-5 py-4">Incident Type</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Assigned Unit</th>
                  <th className="px-5 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {filtered.map((incident) => (
                  <tr key={incident.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">
                      {incident.incidentId || incident.id.slice(0, 8)}
                    </td>
                    <td className="px-5 py-4 font-black">{incident.type || "-"}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {incident.date || formatDate(getIncidentDate(incident))}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{incident.location || "-"}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {incident.assigned || "notAssigned"}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <ReporterStatusBadge status={incident.status} />
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
