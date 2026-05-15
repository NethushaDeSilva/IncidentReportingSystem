import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import ReporterStatusBadge from "../Components/ReporterStatusBadge";
import { useIncidents } from "../hooks/useIncidents";
import { formatDate } from "../utils/formatters";
import DispatcherLayout from "./DispatcherLayout";

export default function AllIncidents() {
  const { incidents, loading } = useIncidents();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return incidents.filter((incident) => {
      if (!needle) return true;
      return [incident.incidentId, incident.type, incident.location, incident.status, incident.name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(needle));
    });
  }, [incidents, search]);

  return (
    <DispatcherLayout>
      <header className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#5F675C] dark:text-slate-400">
          Dispatch
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">All Incidents</h1>
      </header>

      <section className="rounded-lg bg-white p-5 shadow-xl dark:bg-slate-900 sm:p-6">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search"
          className="field-input mb-4"
        />

        <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-white/10">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-5 py-4">Incident ID</th>
                <th className="px-5 py-4">Incident Type</th>
                <th className="px-5 py-4">Date Reported</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Priority</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4">Assigned Unit</th>
                <th className="px-5 py-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center font-bold text-slate-500">
                    Loading incidents...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center font-bold text-slate-500">
                    No incidents found.
                  </td>
                </tr>
              ) : (
                filtered.map((incident) => (
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
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {incident.assigned || "notAssigned"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <Link
                          to={`/dispatcher/incidents/${incident.id}`}
                          title="View"
                          aria-label="View"
                          className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                        >
                          <Eye size={17} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </DispatcherLayout>
  );
}
