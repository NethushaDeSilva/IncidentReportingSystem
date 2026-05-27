import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import IncidentColumnFilters from "../Components/IncidentColumnFilters";
import PaginationControls from "../Components/PaginationControls";
import ReporterStatusBadge from "../Components/ReporterStatusBadge";
import { useDateTimeLimits } from "../hooks/useDateTimeLimits";
import { useIncidents } from "../hooks/useIncidents";
import { usePagination } from "../hooks/usePagination";
import { clampDateInputToToday } from "../utils/dateTimeLimits";
import { formatDate, getIncidentDate, sortNewestFirst } from "../utils/formatters";
import {
  DEFAULT_INCIDENT_FILTERS,
  applyIncidentFilters,
  getIncidentFilterOptions,
} from "../utils/incidentFilters";
import AdminLayout from "./AdminLayout";

export default function AdminReports() {
  const { incidents, loading } = useIncidents();
  const { today } = useDateTimeLimits();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortOption, setSortOption] = useState("date");
  const [filters, setFilters] = useState(DEFAULT_INCIDENT_FILTERS);

  function handleFilterChange(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  const filteredIncidents = useMemo(() => {
    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

    const dateRangeFiltered = incidents
      .filter((incident) => {
        const incidentDate = getIncidentDate(incident);
        if (!incidentDate) return true;
        if (start && incidentDate < start) return false;
        if (end && incidentDate > end) return false;
        return true;
      })

    return applyIncidentFilters(dateRangeFiltered, filters)
      .sort((a, b) => {
        if (sortOption === "type") return (a.type || "").localeCompare(b.type || "");
        if (sortOption === "location") return (a.location || "").localeCompare(b.location || "");
        return sortNewestFirst(a, b);
    });
  }, [endDate, filters, incidents, sortOption, startDate]);

  const filterOptions = useMemo(() => getIncidentFilterOptions(incidents), [incidents]);
  const pagination = usePagination(
    filteredIncidents,
    `${startDate}|${endDate}|${sortOption}|${JSON.stringify(filters)}`
  );

  function handleStartDateChange(event) {
    setStartDate(clampDateInputToToday(event.target.value));
  }

  function handleEndDateChange(event) {
    setEndDate(clampDateInputToToday(event.target.value));
  }

  async function downloadPDF() {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Health LINK Incident Report", 14, 20);
    doc.setFontSize(11);
    doc.text(`Date Range: ${startDate || "All"} to ${endDate || "All"}`, 14, 30);
    doc.text(`Sorted By: ${sortOption}`, 14, 38);

    autoTable(doc, {
      startY: 48,
      head: [["Incident ID", "Type", "Date", "Location", "Priority", "Status"]],
      body: filteredIncidents.map((incident) => [
        incident.incidentId || incident.id,
        incident.type || "N/A",
        formatDate(incident.createdAt),
        incident.location || "N/A",
        incident.priority || "Medium",
        incident.status || "notAssigned",
      ]),
    });

    doc.save("health-link-incident-report.pdf");
  }

  return (
    <AdminLayout>
      <header className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#5F675C] dark:text-slate-400">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">View Reports</h1>
      </header>

      <section className="mb-6 rounded-lg bg-white p-5 shadow-xl dark:bg-slate-900 sm:p-6">
        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Field label="Start Date">
            <input type="date" value={startDate} onChange={handleStartDateChange} max={today} className="field-input" />
          </Field>
          <Field label="End Date">
            <input type="date" value={endDate} onChange={handleEndDateChange} max={today} className="field-input" />
          </Field>
          <Field label="Sort By">
            <select value={sortOption} onChange={(event) => setSortOption(event.target.value)} className="field-input">
              <option value="date">Date</option>
              <option value="type">Incident Type</option>
              <option value="location">Location</option>
            </select>
          </Field>
          <div className="flex items-end">
            <button
              type="button"
              onClick={downloadPDF}
              className="w-full rounded-lg bg-[#3D4461] px-5 py-3 font-black text-white shadow-lg hover:bg-[#30364f]"
            >
              Download PDF
            </button>
          </div>
        </div>
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
        ) : filteredIncidents.length === 0 ? (
          <div className="p-12 text-center font-bold text-slate-500">No incidents found.</div>
        ) : (
          <div className="max-h-[65vh] overflow-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="px-5 py-4">Incident ID</th>
                  <th className="px-5 py-4">Incident Type</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Priority</th>
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
                      {incident.date || formatDate(incident.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{incident.location || "-"}</td>
                    <td className="px-5 py-4 font-bold">{incident.priority || "Medium"}</td>
                    <td className="px-5 py-4 text-center">
                      <ReporterStatusBadge status={incident.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <Link
                          to={`/admin/incidents/${incident.id}`}
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
        {!loading && filteredIncidents.length > 0 && (
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
    </AdminLayout>
  );
}

function Field({ children, label }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      {children}
    </label>
  );
}
