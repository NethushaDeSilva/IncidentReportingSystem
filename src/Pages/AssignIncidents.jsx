import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, LocateFixed } from "lucide-react";
import IncidentColumnFilters from "../Components/IncidentColumnFilters";
import PaginationControls from "../Components/PaginationControls";
import ReporterStatusBadge from "../Components/ReporterStatusBadge";
import { useApp } from "../Context/AppContextBase";
import { useIncidents } from "../hooks/useIncidents";
import { usePagination } from "../hooks/usePagination";
import { assignIncident } from "../services/incidentService";
import { getCurrentPosition, notifyUser } from "../utils/browserCapabilities";
import { distanceInKm, formatDate } from "../utils/formatters";
import {
  DEFAULT_INCIDENT_FILTERS,
  applyIncidentFilters,
  getIncidentFilterOptions,
} from "../utils/incidentFilters";
import DispatcherLayout from "./DispatcherLayout";

export default function AssignIncidents() {
  const { appConfig, profile, user } = useApp();
  const { error, incidents, loading, patchIncident, refreshIncidents } = useIncidents({ activeOnly: true, priorityFirst: true });
  const [selectedUnits, setSelectedUnits] = useState({});
  const [dispatcherPosition, setDispatcherPosition] = useState(null);
  const [locating, setLocating] = useState(false);
  const [assigningId, setAssigningId] = useState("");
  const [assignmentError, setAssignmentError] = useState("");
  const [filters, setFilters] = useState(DEFAULT_INCIDENT_FILTERS);

  function handleFilterChange(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  const nearestUnits = useMemo(() => {
    return appConfig.responseUnits
      .map((unit) => ({
        ...unit,
        distance: distanceInKm(dispatcherPosition, unit),
      }))
      .sort((a, b) => (a.distance ?? Number.POSITIVE_INFINITY) - (b.distance ?? Number.POSITIVE_INFINITY))
      .slice(0, 5);
  }, [appConfig.responseUnits, dispatcherPosition]);

  const filteredIncidents = useMemo(() => applyIncidentFilters(incidents, filters), [filters, incidents]);
  const filterOptions = useMemo(() => getIncidentFilterOptions(incidents), [incidents]);
  const pagination = usePagination(filteredIncidents, JSON.stringify(filters));

  async function handleLocate() {
    setLocating(true);
    const position = await getCurrentPosition();
    setLocating(false);
    if (!position.error) setDispatcherPosition(position);
  }

  async function handleAssign(incident) {
    const selectedUnitId = selectedUnits[incident.id] || nearestUnits[0]?.id;
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
            Dispatch
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Active Incidents</h1>
        </div>
        <button
          type="button"
          onClick={handleLocate}
          disabled={locating}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3D4461] px-7 py-3 font-black text-white shadow-lg transition hover:bg-[#30364f] disabled:opacity-60"
        >
          <LocateFixed size={18} />
          {locating ? "Locating..." : "Nearest units"}
        </button>
      </header>

      <section className="mb-6 rounded-lg bg-white p-5 shadow-xl dark:bg-slate-900 sm:p-6">
        <h2 className="mb-4 text-xl font-black">Nearest 5 units</h2>
        <div className="grid gap-3 md:grid-cols-5">
          {nearestUnits.map((unit) => (
            <div key={unit.id} className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
              <p className="font-black">{unit.name}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">{unit.type}</p>
              <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">{unit.base}</p>
              {unit.distance !== null && (
                <p className="mt-2 text-sm font-black text-[#3D4461] dark:text-white">
                  {unit.distance.toFixed(1)} km
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-white/60 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900">
        {error && <p className="m-5 rounded-lg bg-rose-50 p-4 font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{error}</p>}
        {assignmentError && <p className="m-5 rounded-lg bg-rose-50 p-4 font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{assignmentError}</p>}
        {loading ? (
          <div className="p-12 text-center font-bold text-slate-500">Loading incidents...</div>
        ) : incidents.length === 0 ? (
          <div className="p-12 text-center font-bold text-slate-500">No active incidents.</div>
        ) : (
          <>
            <div className="border-b border-slate-100 p-5 dark:border-white/10 sm:p-6">
              <IncidentColumnFilters
                filters={filters}
                options={filterOptions}
                onChange={handleFilterChange}
                onReset={() => setFilters(DEFAULT_INCIDENT_FILTERS)}
              />
            </div>
            {filteredIncidents.length === 0 ? (
              <div className="p-12 text-center font-bold text-slate-500">No active incidents match these filters.</div>
            ) : (
              <>
                <div className="max-h-[65vh] overflow-auto">
                  <table className="w-full min-w-[960px] text-left text-sm">
                    <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                      <tr>
                        <th className="px-5 py-4">Incident ID</th>
                        <th className="px-5 py-4">Incident Type</th>
                        <th className="px-5 py-4">Date Reported</th>
                        <th className="px-5 py-4">Location</th>
                        <th className="px-5 py-4">Priority</th>
                        <th className="px-5 py-4 text-center">Status</th>
                        <th className="px-5 py-4">Unit</th>
                        <th className="px-5 py-4 text-center">View</th>
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
                          <td className="px-5 py-4">
                            <select
                              value={selectedUnits[incident.id] || incident.assignedUnitId || nearestUnits[0]?.id || ""}
                              onChange={(event) =>
                                setSelectedUnits((prev) => ({ ...prev, [incident.id]: event.target.value }))
                              }
                              className="field-input min-w-56"
                            >
                              {nearestUnits.map((unit) => (
                                <option key={unit.id} value={unit.id}>
                                  {unit.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-5 py-4">
                            <Link
                              to={`/dispatcher/incidents/${incident.id}`}
                              title="View"
                              aria-label="View"
                              className="mx-auto grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                            >
                              <Eye size={17} />
                            </Link>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleAssign(incident)}
                              disabled={assigningId === incident.id}
                              className="rounded-lg bg-[#3D4461] px-5 py-2.5 font-black text-white shadow-lg hover:bg-[#30364f] disabled:opacity-60"
                            >
                              {assigningId === incident.id
                                ? "..."
                                : incident.assignedUserId || incident.assignedUnitId
                                  ? "REASSIGN"
                                  : "ASSIGN"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationControls
                  page={pagination.page}
                  pageCount={pagination.pageCount}
                  pageSize={pagination.pageSize}
                  totalItems={pagination.totalItems}
                  onPageChange={pagination.setPage}
                  onPageSizeChange={pagination.setPageSize}
                />
              </>
            )}
          </>
        )}
      </section>
    </DispatcherLayout>
  );
}
