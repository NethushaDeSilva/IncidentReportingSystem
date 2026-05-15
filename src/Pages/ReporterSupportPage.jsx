import { Link } from "react-router-dom";
import ReporterStatusBadge from "../Components/ReporterStatusBadge";
import { useApp } from "../Context/AppContextBase";
import { useIncidents } from "../hooks/useIncidents";
import ReporterLayout from "./ReporterLayout";

export default function ReporterSupportPage() {
  const { appConfig, user } = useApp();
  const { incidents, loading } = useIncidents({ reporterId: user?.uid, activeOnly: true });
  const activeReports = incidents.slice(0, 4);

  return (
    <ReporterLayout>
      <header className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#5F675C] dark:text-slate-400">
          Reporter Support
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Help and active reports</h1>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <section className="rounded-lg bg-white p-5 shadow-xl dark:bg-slate-900 sm:p-8">
          <h2 className="mb-5 text-xl font-black">Active reports</h2>

          {loading ? (
            <p className="py-12 text-center font-bold text-slate-500">Loading active reports...</p>
          ) : activeReports.length === 0 ? (
            <div className="rounded-lg bg-slate-50 p-8 text-center dark:bg-slate-800">
              <p className="font-bold text-slate-600 dark:text-slate-300">No active reports right now.</p>
              <Link
                to="/reporter/report"
                className="mt-4 inline-flex rounded-lg bg-[#3D4461] px-6 py-3 font-black text-white hover:bg-[#30364f]"
              >
                New Incident
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeReports.map((report) => (
                <Link
                  key={report.id}
                  to={`/reporter/my-reports/${report.id}`}
                  className="flex flex-col gap-4 rounded-lg bg-slate-50 p-5 transition hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="mb-1 font-mono text-xs font-black uppercase tracking-widest text-slate-500">
                      {report.incidentId || report.id.slice(0, 8)}
                    </p>
                    <h3 className="font-black">{report.type || "Incident"}</h3>
                    <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {report.location || "Location not added"}
                    </p>
                  </div>
                  <ReporterStatusBadge status={report.status} />
                </Link>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <div className="rounded-lg bg-[#3D4461] p-6 text-white shadow-xl">
            <h2 className="text-xl font-black">Emergency contacts</h2>
            <div className="mt-5 space-y-3">
              <Contact label="Police Emergency" value={appConfig.brand.emergencyPhone} />
              <Contact label="Ambulance / Fire" value="110" />
              <Contact label="System Desk" value={appConfig.brand.supportPhone} />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-xl dark:bg-slate-900">
            <h2 className="text-xl font-black">Response desk</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
              {appConfig.brand.supportPhone}
            </p>
          </div>
        </aside>
      </div>
    </ReporterLayout>
  );
}

function Contact({ label, value }) {
  return (
    <div className="rounded-lg bg-white/10 p-4">
      <p className="text-xs font-black uppercase tracking-widest text-slate-300">{label}</p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
}
