import { useMemo, useState } from "react";
import { serverTimestamp } from "firebase/firestore";
import { Check, ClipboardList, LogOut, MapPin, Moon, Phone, Radio, Sun, UserRound } from "lucide-react";
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
  const incidentType =
    safeDisplayText(currentIncident?.incidentType) ||
    safeDisplayText(currentIncident?.type) ||
    (currentIncident ? "Incident awaiting details" : "Waiting for dispatch");
  const incidentLocation =
    safeDisplayText(currentIncident?.location) ||
    (currentIncident ? "Location not recorded" : "No assigned incident");
  const assignedUnit =
    safeDisplayText(currentIncident?.assigned) ||
    safeDisplayText(unit?.name) ||
    (currentIncident ? "Response unit pending" : "No unit assigned");
  const status = loading
    ? "Syncing"
    : safeDisplayText(currentIncident?.status) || (currentIncident ? "Open" : "Standby");
  const incidentCode =
    safeDisplayText(currentIncident?.incidentId) ||
    (currentIncident?.id ? currentIncident.id.slice(0, 8) : "No incident selected");
  const reporterName =
    safeDisplayText(currentIncident?.name) ||
    safeDisplayText(currentIncident?.reporterName) ||
    "Reporter not recorded";
  const contactNumber =
    safeDisplayText(currentIncident?.contactNumber) ||
    safeDisplayText(currentIncident?.phone) ||
    "Contact not recorded";
  const priority = safeDisplayText(currentIncident?.priority) || "Medium";
  const isInProgress = currentIncident?.status === "In Progress";
  const watchingUnit = getWatchingUnitLabel(paramedicUnitIds, appConfig.responseUnits);
  const queueLabel = assignedIncidents.length
    ? `${assignedIncidents.length} active mission${assignedIncidents.length === 1 ? "" : "s"} in queue`
    : error
      ? "Incident feed blocked"
      : "No active mission in queue";

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

          <div className="flex min-h-0 flex-1 flex-col gap-4 pt-8">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1" data-testid="paramedic-mission-summary">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#4E7C6C] dark:text-emerald-300">
                    {currentIncident ? "Current mission" : "Mission queue"}
                  </p>
                  <h1 className="mt-2 text-2xl font-black leading-tight text-slate-950 dark:text-white">
                    {incidentType}
                  </h1>
                </div>
                <span className="shrink-0 rounded-full bg-[#DEDED8] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#3D4461] dark:bg-white/10 dark:text-white">
                  {status}
                </span>
              </div>

              <div className="space-y-3 rounded-[24px] border border-slate-100 bg-slate-50 p-4 text-sm font-bold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                <MissionRow icon={<ClipboardList size={16} />} label="Incident" value={incidentCode} />
                <MissionRow icon={<MapPin size={16} />} label="Location" value={incidentLocation} />
                <MissionRow icon={<Radio size={16} />} label="Unit" value={assignedUnit} />
                <MissionRow icon={<UserRound size={16} />} label="Reporter" value={reporterName} />
                <MissionRow icon={<Phone size={16} />} label="Contact" value={contactNumber} />
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2 text-xs dark:bg-slate-950/40">
                  <span className="font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Priority
                  </span>
                  <span className="font-black text-slate-900 dark:text-white">{priority}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                <p className="rounded-2xl bg-slate-100 px-4 py-3 dark:bg-white/10 dark:text-slate-300">
                  Watching: {watchingUnit}
                </p>
                <p className="px-1 normal-case tracking-normal">{queueLabel}</p>
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

function MissionRow({ icon, label, value }) {
  return (
    <div className="grid grid-cols-[18px_70px_1fr] items-center gap-2">
      <span className="text-[#4E7C6C] dark:text-emerald-300" aria-hidden="true">
        {icon}
      </span>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span className="min-w-0 break-words text-right font-black text-slate-950 dark:text-white">
        {value}
      </span>
    </div>
  );
}

function hasAssignedUnit(incident) {
  return Boolean(
    safeDisplayText(incident?.assignedUnitId) ||
      safeDisplayText(incident?.assigned) ||
      safeDisplayText(incident?.assignedUnitType)
  );
}

function matchesParamedicUnit(incident, paramedicUnitIds, responseUnits) {
  if (paramedicUnitIds.length === 0) return true;

  const assignedValues = [
    incident?.assignedUnitId,
    incident?.assigned,
    incident?.assignedUnitName,
    incident?.assignedUnitType,
    incident?.responseUnitId,
    incident?.unitId,
    incident?.unit,
  ];

  return paramedicUnitIds.some((unitId) => {
    const unit = responseUnits.find((item) => item.id === unitId);
    if (!unit) return false;
    return assignedValues.some((value) => valueMatchesUnit(value, unit));
  });
}

function getParamedicUnitIds(profile, responseUnits) {
  const explicitValues = [
    profile?.responseUnitId,
    profile?.responseUnitName,
    profile?.assignedUnitId,
    profile?.assignedUnit,
    profile?.assigned,
    profile?.unitId,
    profile?.unit,
    profile?.unitName,
  ].flatMap((value) => (Array.isArray(value) ? value : [value]));
  const explicitMatches = explicitValues
    .map(safeDisplayText)
    .filter(Boolean)
    .flatMap((value) =>
      responseUnits.filter((unit) => valueMatchesUnit(value, unit)).map((unit) => unit.id)
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

  const unitNames = paramedicUnitIds
    .map((unitId) => responseUnits.find((unit) => unit.id === unitId)?.name)
    .filter(Boolean)
    .join(", ");

  return unitNames || "Configured unit unavailable";
}

function valueMatchesUnit(value, unit) {
  const normalizedValue = normalizeMatchText(value);
  if (!normalizedValue) return false;

  const unitValues = [unit.id, unit.name, unit.type, unit.base].map(normalizeMatchText).filter(Boolean);
  if (unitValues.some((unitValue) => unitValue === normalizedValue)) return true;

  const compactValue = compactMatchText(value);
  if (compactValue && unitValues.some((unitValue) => compactMatchText(unitValue) === compactValue)) return true;

  const unitNumber = extractUnitNumber(value);
  if (!unitNumber) return false;

  return unitValues.some((unitValue) => extractUnitNumber(unitValue) === unitNumber);
}

function extractUnitNumber(value) {
  const match = normalizeMatchText(value).match(/\b0?(\d{1,2})\b/);
  return match ? match[1].padStart(2, "0") : "";
}

function normalizeMatchText(value) {
  return safeDisplayText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function compactMatchText(value) {
  return normalizeMatchText(value).replaceAll(" ", "");
}

function safeDisplayText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}
