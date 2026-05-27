import { useMemo, useState } from "react";
import { serverTimestamp } from "firebase/firestore";
import { Check, LogOut, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../Context/AppContextBase";
import { useIncidents } from "../hooks/useIncidents";
import { updateIncident } from "../services/incidentService";

export default function ParamedicDashboard() {
  const { activeTheme, appConfig, cycleTheme, logout, profile } = useApp();
  const navigate = useNavigate();
  const { error, incidents, loading } = useIncidents({
    activeOnly: true,
    priorityFirst: true,
    refreshIntervalMs: 3000,
  });
  const [savingStatus, setSavingStatus] = useState("");
  const [statusError, setStatusError] = useState("");

  const paramedicUnitIds = useMemo(
    () => getParamedicUnitIds(profile, appConfig.responseUnits),
    [appConfig.responseUnits, profile]
  );

  const assignedIncidents = useMemo(
    () =>
      incidents.filter(
        (incident) =>
          hasAssignedUnit(incident) &&
          matchesParamedicUnit(incident, paramedicUnitIds, appConfig.responseUnits)
      ),
    [appConfig.responseUnits, incidents, paramedicUnitIds]
  );
  const currentIncident = useMemo(() => assignedIncidents[0] || null, [assignedIncidents]);

  async function updateIncidentStatus(status) {
    if (!currentIncident || savingStatus) return;

    setSavingStatus(status);
    setStatusError("");
    try {
      const update = {
        status,
        updatedAt: serverTimestamp(),
      };

      if (status === "In Progress") update.startedAt = serverTimestamp();
      if (status === "Resolved") update.resolvedAt = serverTimestamp();

      await updateIncident(currentIncident.id, update, `Paramedic marked ${status}`);
    } catch (error) {
      console.error("Unable to update incident status:", error);
      setStatusError(error?.code === "permission-denied" ? "Firebase blocked this status update." : "Could not update mission status.");
    } finally {
      setSavingStatus("");
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  const buttonsDisabled = !currentIncident || loading || Boolean(savingStatus) || Boolean(error);
  const unit = appConfig.responseUnits.find((item) => item.id === currentIncident?.assignedUnitId);
  const incidentType = currentIncident?.incidentType || currentIncident?.type || "Waiting for dispatch";
  const incidentLocation = currentIncident?.location || "No assigned incident";
  const assignedUnit = currentIncident?.assigned || unit?.name || "No unit assigned";
  const status = loading ? "Syncing" : currentIncident?.status || "Standby";
  const isInProgress = currentIncident?.status === "In Progress";
  const watchingUnit = getWatchingUnitLabel(paramedicUnitIds, appConfig.responseUnits);

  return (
    <main className="grid min-h-screen place-items-center bg-[#DEDED8] px-4 py-8 dark:bg-slate-950">
      <section className="flex h-[620px] w-full max-w-[360px] rounded-[56px] bg-slate-950 p-4 shadow-[0_28px_80px_rgba(15,23,42,0.35)] ring-4 ring-slate-800 dark:bg-slate-900 dark:ring-slate-700">
        <div className="flex h-full w-full flex-col rounded-[44px] bg-white p-5 text-slate-900 dark:bg-[#101722] dark:text-white">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={13} />
              Logout
            </button>
            <button
              type="button"
              onClick={cycleTheme}
              className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {activeTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <div className="flex flex-1 flex-col justify-between pt-10">
            <div className="space-y-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  {assignedUnit}
                </p>
                <h1 className="mt-3 text-3xl font-black leading-tight">{incidentType}</h1>
              </div>

              <div className="space-y-3 text-sm font-bold text-slate-600 dark:text-slate-300">
                <p>{incidentLocation}</p>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {status}
                </p>
                <p className="rounded-2xl bg-slate-100 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-500 dark:bg-white/10 dark:text-slate-300">
                  Watching: {watchingUnit}
                </p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {assignedIncidents.length
                    ? `${assignedIncidents.length} active mission${assignedIncidents.length === 1 ? "" : "s"} in queue`
                    : "No mission assigned yet"}
                </p>
                {error && (
                  <p className="rounded-2xl bg-rose-100 px-4 py-3 text-xs font-black text-rose-700 dark:bg-rose-950/50 dark:text-rose-200">
                    {error}
                  </p>
                )}
                {statusError && (
                  <p className="rounded-2xl bg-rose-100 px-4 py-3 text-xs font-black text-rose-700 dark:bg-rose-950/50 dark:text-rose-200">
                    {statusError}
                  </p>
                )}
              </div>
            </div>

            <div className="grid w-full grid-cols-2 gap-3">
              <button
                type="button"
                disabled={buttonsDisabled || isInProgress}
                onClick={() => updateIncidentStatus("In Progress")}
                className="min-h-24 rounded-[28px] bg-amber-400 px-3 text-sm font-black text-slate-950 shadow-sm transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {savingStatus === "In Progress" ? "Saving" : "In Progress"}
              </button>
              <button
                type="button"
                disabled={buttonsDisabled}
                onClick={() => updateIncidentStatus("Resolved")}
                className="grid min-h-24 place-items-center rounded-[28px] bg-emerald-400 px-3 text-slate-950 shadow-sm transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-45"
                aria-label="Resolved"
                title="Resolved"
              >
                <Check size={36} strokeWidth={3.2} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function hasAssignedUnit(incident) {
  return Boolean(incident?.assignedUnitId || incident?.assigned);
}

function matchesParamedicUnit(incident, paramedicUnitIds, responseUnits) {
  if (paramedicUnitIds.length === 0) return true;

  const assignedUnitId = String(incident?.assignedUnitId || "");
  const assignedUnitName = String(incident?.assigned || "").toLowerCase();
  const assignedUnitType = String(incident?.assignedUnitType || "").toLowerCase();

  return paramedicUnitIds.some((unitId) => {
    const unit = responseUnits.find((item) => item.id === unitId);
    if (assignedUnitId === unitId) return true;
    if (unit?.name && assignedUnitName === unit.name.toLowerCase()) return true;
    if (unit?.type && assignedUnitType === unit.type.toLowerCase()) return true;
    return false;
  });
}

function getParamedicUnitIds(profile, responseUnits) {
  const explicitUnit = profile?.responseUnitId || profile?.assignedUnitId || profile?.unitId || profile?.unit || "";
  const explicitValues = Array.isArray(explicitUnit) ? explicitUnit : [explicitUnit];
  const explicitMatches = explicitValues
    .map((value) => String(value || "").trim().toLowerCase())
    .filter(Boolean)
    .flatMap((value) =>
      responseUnits
        .filter(
          (unit) =>
            unit.id.toLowerCase() === value ||
            unit.name.toLowerCase() === value ||
            unit.type.toLowerCase() === value
        )
        .map((unit) => unit.id)
    );

  if (explicitMatches.length > 0) return [...new Set(explicitMatches)];

  const hint = `${profile?.email || ""} ${profile?.fullName || ""}`.toLowerCase();
  const numberMatch = hint.match(/\b(?:unit|paramedic|ambulance|amb|medic)?[-_\s]*(\d{1,2})\b/);
  if (!numberMatch) return [];

  const unitNumber = numberMatch[1].padStart(2, "0");
  return responseUnits
    .filter((unit) => `${unit.id} ${unit.name}`.toLowerCase().includes(unitNumber))
    .map((unit) => unit.id);
}

function getWatchingUnitLabel(paramedicUnitIds, responseUnits) {
  if (paramedicUnitIds.length === 0) return "All assigned units";

  return paramedicUnitIds
    .map((unitId) => responseUnits.find((unit) => unit.id === unitId)?.name)
    .filter(Boolean)
    .join(", ");
}
