import { useMemo, useState } from "react";
import IncidentColumnFilters from "../Components/IncidentColumnFilters";
import PaginationControls from "../Components/PaginationControls";
import ReporterStatusBadge from "../Components/ReporterStatusBadge";
import { useIncidents } from "../hooks/useIncidents";
import { usePagination } from "../hooks/usePagination";
import { formatDate } from "../utils/formatters";
import {
  DEFAULT_INCIDENT_FILTERS,
  applyIncidentFilters,
  getIncidentFilterOptions,
} from "../utils/incidentFilters";
import DispatcherLayout from "./DispatcherLayout";

export default function AllIncidents() {
  const { error, incidents, loading } = useIncidents();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_INCIDENT_FILTERS);

  function handleFilterChange(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const searched = incidents.filter((incident) => {
      if (!needle) return true;
      return [incident.incidentId, incident.type, incident.location, incident.status, incident.name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(needle));
    });
    return applyIncidentFilters(searched, filters);
  }, [filters, incidents, search]);

  const filterOptions = useMemo(() => getIncidentFilterOptions(incidents), [incidents]);
  const pagination = usePagination(filtered, `${search}|${JSON.stringify(filters)}`);

  return (
    <DispatcherLayout>
      <header className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#5F675C] dark:text-slate-400">
          Dispatch
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">All Incidents</h1>
      </header>

      <section className="rounded-lg bg-white p-5 shadow-xl dark:bg-slate-900 sm:p-6">
        {error && <p className="mb-4 rounded-lg bg-rose-50 p-4 font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{error}</p>}

        <div className="mb-4 space-y-4">
          <input
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
        </div>

        <div className="max-h-[65vh] overflow-auto rounded-lg border border-slate-100 dark:border-white/10">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-5 py-4">Incident ID</th>
                <th className="px-5 py-4">Incident Type</th>
                <th className="px-5 py-4">Date Reported</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Priority</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4">Assigned Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center font-bold text-slate-500">
                    Loading incidents...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center font-bold text-slate-500">
                    No incidents found.
                  </td>
                </tr>
              ) : (
                pagination.paginatedItems.map((incident) => (
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
