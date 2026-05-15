import { Link } from "react-router-dom";
import SummaryCard from "../Components/SummaryCard";
import ReporterStatusBadge from "../Components/ReporterStatusBadge";
import { useApp } from "../Context/AppContextBase";
import { useIncidents } from "../hooks/useIncidents";
import { formatDate } from "../utils/formatters";
import AdminLayout from "./AdminLayout";

export default function AdminDashboard() {
  const { profile } = useApp();
  const { incidents, loading, stats } = useIncidents();
  const recent = incidents.slice(0, 5);

  return (
    <AdminLayout>
      <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#5F675C] dark:text-slate-400">
            Admin Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Welcome {profile?.fullName || "Admin"}
          </h1>
        </div>
        <Link
          to="/admin/users"
          className="inline-flex justify-center rounded-lg bg-[#3D4461] px-7 py-3 font-black text-white shadow-lg transition hover:bg-[#30364f]"
        >
          Manage Users
        </Link>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total Incidents" value={loading ? "..." : stats.total} />
        <SummaryCard title="Active Incidents" value={loading ? "..." : stats.active} tone="danger" />
        <SummaryCard title="High-priority Incidents" value={loading ? "..." : stats.highPriority} tone="warning" />
        <SummaryCard title="Resolved Incidents" value={loading ? "..." : stats.resolved} tone="success" />
      </section>

      <section className="overflow-hidden rounded-lg border border-white/60 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-5 py-4 dark:border-white/10">
          <h2 className="text-xl font-black">Recent reports</h2>
        </div>
        {loading ? (
          <div className="p-12 text-center font-bold text-slate-500">Loading incidents...</div>
        ) : recent.length === 0 ? (
          <div className="p-12 text-center font-bold text-slate-500">No incidents found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="px-5 py-4">Incident ID</th>
                  <th className="px-5 py-4">Incident Type</th>
                  <th className="px-5 py-4">Reporter</th>
                  <th className="px-5 py-4">Date Reported</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {recent.map((incident) => (
                  <tr key={incident.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">
                      {incident.incidentId || incident.id.slice(0, 8)}
                    </td>
                    <td className="px-5 py-4 font-black">{incident.type || "-"}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{incident.name || "-"}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {incident.date || formatDate(incident.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{incident.location || "-"}</td>
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
    </AdminLayout>
  );
}
