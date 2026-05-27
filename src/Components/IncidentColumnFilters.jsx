import { DEFAULT_INCIDENT_FILTERS, INCIDENT_FILTER_LABELS } from "../utils/incidentFilters";

function todayInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function IncidentColumnFilters({ filters, onChange, onReset, options }) {
  const hasActiveFilter = Object.values(filters).some((value) => value !== "All");
  const today = todayInputValue();

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[repeat(5,minmax(0,1fr))_auto]">
      {Object.keys(DEFAULT_INCIDENT_FILTERS).map((key) => (
        <label key={key} className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {INCIDENT_FILTER_LABELS[key]}
          </span>
          {key === "date" ? (
            <input
              type="date"
              value={filters.date === "All" ? "" : filters.date}
              onChange={(event) => onChange("date", event.target.value || "All")}
              max={today}
              className="field-input"
            />
          ) : (
            <select
              value={filters[key]}
              onChange={(event) => onChange(key, event.target.value)}
              className="field-input"
            >
              <option value="All">All</option>
              {(options[key] || []).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          )}
        </label>
      ))}

      <div className="flex items-end">
        <button
          type="button"
          onClick={onReset}
          disabled={!hasActiveFilter}
          className="w-full rounded-lg bg-slate-100 px-5 py-3 font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 xl:w-auto"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
