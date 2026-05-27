import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import IncidentColumnFilters from "../Components/IncidentColumnFilters";
import PaginationControls from "../Components/PaginationControls";
import ReporterStatusBadge from "../Components/ReporterStatusBadge";
import { useApp } from "../Context/AppContextBase";
import { useIncidents } from "../hooks/useIncidents";
import { usePagination } from "../hooks/usePagination";
import { formatDate } from "../utils/formatters";
import {
  DEFAULT_INCIDENT_FILTERS,
  applyIncidentFilters,
  getIncidentFilterOptions,
} from "../utils/incidentFilters";
import ReporterLayout from "./ReporterLayout";

export default function MyReportsPage() {
  const { user } = useApp();
  const { incidents, loading } = useIncidents({ reporterId: user?.uid });
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_INCIDENT_FILTERS);

  function handleFilterChange(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const searched = [...incidents]
      .reverse()
      .filter((incident) => {
        if (!needle) return true;
        return (
          [incident.type, incident.location, incident.name, incident.incidentId, incident.description]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(needle))
        );
      });
    return applyIncidentFilters(searched, filters);
  }, [filters, incidents, search]);

  const filterOptions = useMemo(() => getIncidentFilterOptions(incidents), [incidents]);
  const pagination = usePagination(filtered, `${search}|${JSON.stringify(filters)}`);

  return (
    <ReporterLayout>
      <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#5F675C] dark:text-slate-400">
            Report History
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">View all reports</h1>
        </div>

        <Link
          to="/reporter/report"
          className="inline-flex justify-center rounded-lg bg-[#3D4461] px-7 py-3 font-black text-white shadow-lg hover:bg-[#30364f]"
        >
          New Incident
        </Link>
      </header>

      <section className="mb-6 space-y-4">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search"
          className="field-input"
        />

        <IncidentColumnFilters
          filters={filters}
          options={filterOptions}
          onChange={handleFilterChange}
          onReset={() => setFilters(DEFAULT_INCIDENT_FILTERS)}
        />
      </section>

      <section className="overflow-hidden rounded-lg border border-white/60 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900">
        {loading ? (
          <div className="p-12 text-center font-bold text-slate-500">Loading reports...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center font-bold text-slate-500">No reports found.</div>
        ) : (
          <div className="max-h-[65vh] overflow-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="px-5 py-4">Incident ID</th>
                  <th className="px-5 py-4">Incident Type</th>
                  <th className="px-5 py-4">Date Reported</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Priority</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {pagination.paginatedItems.map((incident) => (
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
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/reporter/my-reports/${incident.id}`}
                        className="font-black text-[#3D4461] hover:underline dark:text-white"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <PaginationControls
            page={pagination.page}
            pageCount={pagination.pageCount}
            pageSize={pagination.pageSize}
            totalItems={pagination.totalItems}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setPageSize}
          />
        )}
      </section>
    </ReporterLayout>
  );
}
