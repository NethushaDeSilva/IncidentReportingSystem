import { useMemo, useState } from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Check, Moon, Sun } from "lucide-react";
import { useApp } from "../Context/AppContextBase";
import { db } from "../firebase";
import { useIncidents } from "../hooks/useIncidents";

export default function ParamedicDashboard() {
  const { activeTheme, appConfig, cycleTheme } = useApp();
  const { incidents, loading } = useIncidents({ activeOnly: true, priorityFirst: true });
  const [savingStatus, setSavingStatus] = useState("");

  const assignedIncidents = useMemo(
    () => incidents.filter((incident) => incident.assignedUnitId || incident.assigned),
    [incidents]
  );
  const currentIncident = useMemo(() => assignedIncidents[0] || null, [assignedIncidents]);

  async function updateIncidentStatus(status) {
    if (!currentIncident || savingStatus) return;

    setSavingStatus(status);
    try {
      const update = {
        status,
        updatedAt: serverTimestamp(),
      };

      if (status === "In Progress") update.startedAt = serverTimestamp();
      if (status === "Resolved") update.resolvedAt = serverTimestamp();

      await updateDoc(doc(db, "Incidents", currentIncident.id), update);
    } catch (error) {
      console.error("Unable to update incident status:", error);
    } finally {
      setSavingStatus("");
    }
  }

  const buttonsDisabled = !currentIncident || loading || Boolean(savingStatus);
  const unit = appConfig.responseUnits.find((item) => item.id === currentIncident?.assignedUnitId);
  const incidentType = currentIncident?.incidentType || currentIncident?.type || "Waiting for dispatch";
  const incidentLocation = currentIncident?.location || "No assigned incident";
  const assignedUnit = currentIncident?.assigned || unit?.name || "No unit assigned";
  const status = loading ? "Syncing" : currentIncident?.status || "Standby";
  const isInProgress = currentIncident?.status === "In Progress";

  return (
    <main className="grid min-h-screen place-items-center bg-[#DEDED8] px-4 py-8 dark:bg-slate-950">
      <section className="flex h-[620px] w-full max-w-[360px] rounded-[56px] bg-slate-950 p-4 shadow-[0_28px_80px_rgba(15,23,42,0.35)] ring-4 ring-slate-800 dark:bg-slate-900 dark:ring-slate-700">
        <div className="flex h-full w-full flex-col rounded-[44px] bg-white p-5 text-slate-900 dark:bg-[#101722] dark:text-white">
          <div className="flex justify-end">
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
