import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Edit, Eye, Trash2, X } from "lucide-react";
import IncidentColumnFilters from "./IncidentColumnFilters";
import PaginationControls from "./PaginationControls";
import ReporterStatusBadge from "./ReporterStatusBadge";
import { useApp } from "../Context/AppContextBase";
import { useIncidents } from "../hooks/useIncidents";
import { usePagination } from "../hooks/usePagination";
import { useUsers } from "../hooks/useUsers";
import { deleteIncident, updateIncident } from "../services/incidentService";
import { notifyUser } from "../utils/browserCapabilities";
import { formatDate } from "../utils/formatters";
import {
  DEFAULT_INCIDENT_FILTERS,
  applyIncidentFilters,
  getIncidentFilterOptions,
} from "../utils/incidentFilters";

export default function AdminIncidentsTable({ limit }) {
  const { appConfig } = useApp();
  const { incidents, loading } = useIncidents();
  const { dispatchers } = useUsers();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_INCIDENT_FILTERS);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  function handleFilterChange(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const source = limit ? incidents.slice(0, limit) : incidents;

    const searched = source.filter((incident) => {
      if (!needle) return true;
      return [incident.incidentId, incident.type, incident.location, incident.status, incident.name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(needle));
    });
    return applyIncidentFilters(searched, filters);
  }, [filters, incidents, limit, search]);

  const filterOptions = useMemo(() => {
    const source = limit ? incidents.slice(0, limit) : incidents;
    return getIncidentFilterOptions(source);
  }, [incidents, limit]);
  const pagination = usePagination(filtered, `${search}|${JSON.stringify(filters)}`);

  async function handleDelete(incident) {
    if (!window.confirm(`Delete ${incident.incidentId || incident.id}?`)) return;
    await deleteIncident(incident.id);
    await notifyUser(appConfig.brand.name, "Incident deleted.");
  }

  async function handleEditSubmit(event) {
    event.preventDefault();
    setSaving(true);

    const form = new FormData(event.currentTarget);
    const assignedUserId = form.get("assignedUserId");
    const dispatcher = dispatchers.find((item) => item.id === assignedUserId);
    const assignedUnitId = form.get("assignedUnitId");
    const unit = appConfig.responseUnits.find((item) => item.id === assignedUnitId);

    try {
      await updateIncident(
        editing.id,
        {
          type: form.get("type"),
          priority: form.get("priority"),
          status: form.get("status"),
          location: form.get("location"),
          assignedUserId: assignedUserId || "",
          assignedDispatcherEmail: dispatcher?.email || "",
          assignedUnitId: assignedUnitId || "",
          assigned: unit?.name || "",
          assignedUnitType: unit?.type || "",
        },
        "Updated by admin"
      );
      await notifyUser(appConfig.brand.name, "Incident updated.");
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
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

      <div className="max-h-[65vh] overflow-auto rounded-lg border border-slate-100 bg-white dark:border-white/10 dark:bg-slate-900">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th className="px-5 py-4">Incident ID</th>
              <th className="px-5 py-4">Incident Type</th>
              <th className="px-5 py-4">Date Reported</th>
              <th className="px-5 py-4">Location</th>
              <th className="px-5 py-4">Priority</th>
              <th className="px-5 py-4 text-center">Status</th>
              <th className="px-5 py-4">Assigned Unit</th>
              <th className="px-5 py-4 text-right">Actions</th>
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
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <IconLink label="View" to={`/admin/incidents/${incident.id}`}>
                        <Eye size={17} />
                      </IconLink>
                      <IconButton label="Edit" onClick={() => setEditing(incident)}>
                        <Edit size={17} />
                      </IconButton>
                      <IconButton label="Delete" danger onClick={() => handleDelete(incident)}>
                        <Trash2 size={17} />
                      </IconButton>
                    </div>
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

      {editing && (
        <EditDialog
          appConfig={appConfig}
          dispatchers={dispatchers}
          incident={editing}
          saving={saving}
          onClose={() => setEditing(null)}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
}

function IconLink({ children, label, to }) {
  return (
    <Link
      to={to}
      title={label}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
    >
      {children}
    </Link>
  );
}

function IconButton({ children, danger = false, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`grid h-9 w-9 place-items-center rounded-lg transition ${
        danger
          ? "bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-200"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function EditDialog({ appConfig, dispatchers, incident, onClose, onSubmit, saving }) {
  return (
    <Dialog title="Edit incident" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Incident Type">
            <select name="type" defaultValue={incident.type || appConfig.incidentTypes[0]} className="field-input">
              {appConfig.incidentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select name="priority" defaultValue={incident.priority || "Medium"} className="field-input">
              {appConfig.priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select name="status" defaultValue={incident.status || "notAssigned "} className="field-input">
              {appConfig.statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Location">
            <input name="location" defaultValue={incident.location || ""} className="field-input" />
          </Field>
          <Field label="Dispatcher">
            <select name="assignedUserId" defaultValue={incident.assignedUserId || ""} className="field-input">
              <option value="">Select dispatcher</option>
              {dispatchers.map((dispatcher) => (
                <option key={dispatcher.id} value={dispatcher.id}>
                  {dispatcher.fullName || dispatcher.email}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Unit">
            <select name="assignedUnitId" defaultValue={incident.assignedUnitId || ""} className="field-input">
              <option value="">Select unit</option>
              {appConfig.responseUnits.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg bg-slate-100 px-5 py-3 font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="rounded-lg bg-[#3D4461] px-5 py-3 font-black text-white disabled:opacity-60">
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

function Dialog({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/50 p-4">
      <section className="w-full max-w-3xl rounded-lg bg-white p-5 shadow-2xl dark:bg-slate-900 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-black">{title}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </section>
    </div>
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
