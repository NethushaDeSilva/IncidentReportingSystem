import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import IncidentColumnFilters from "../Components/IncidentColumnFilters";
import PaginationControls from "../Components/PaginationControls";
import ReporterStatusBadge from "../Components/ReporterStatusBadge";
import { useIncidents } from "../hooks/useIncidents";
import { usePagination } from "../hooks/usePagination";
import { formatDate, getIncidentDate, sortNewestFirst } from "../utils/formatters";
import {
  DEFAULT_INCIDENT_FILTERS,
  applyIncidentFilters,
  getIncidentFilterOptions,
} from "../utils/incidentFilters";
import DispatcherLayout from "./DispatcherLayout";

export default function DispatcherReports() {
  const { incidents, loading } = useIncidents();
  const [filters, setFilters] = useState(DEFAULT_INCIDENT_FILTERS);

  function handleFilterChange(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  const filtered = useMemo(
    () =>
      applyIncidentFilters(incidents, filters)
        .sort((a, b) => sortNewestFirst(a, b)),
    [filters, incidents]
  );

  const filterOptions = useMemo(() => getIncidentFilterOptions(incidents), [incidents]);
  const pagination = usePagination(filtered, JSON.stringify(filters));

  return (
    <DispatcherLayout>
      <header className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#5F675C] dark:text-slate-400">
          Dispatch
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">View Reports</h1>
      </header>

      <section className="mb-6 rounded-lg bg-white p-5 shadow-xl dark:bg-slate-900 sm:p-6">
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
            <table className="w-full min-w-[940px] text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="px-5 py-4">Incident ID</th>
                  <th className="px-5 py-4">Incident Type</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Priority</th>
                  <th className="px-5 py-4">Assigned Unit</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-right">View</th>
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
                      {incident.date || formatDate(getIncidentDate(incident))}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{incident.location || "-"}</td>
                    <td className="px-5 py-4 font-bold">{incident.priority || "Medium"}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {incident.assigned || "notAssigned"}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <ReporterStatusBadge status={incident.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <Link
                          to={`/dispatcher/incidents/${incident.id}`}
                          title="View report"
                          aria-label="View report"
                          className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                        >
                          <Eye size={17} />
                        </Link>
                      </div>
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
    </DispatcherLayout>
  );
}
