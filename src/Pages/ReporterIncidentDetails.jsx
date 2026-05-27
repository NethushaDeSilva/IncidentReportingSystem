import { Link, useParams } from "react-router-dom";
import ReporterStatusBadge from "../Components/ReporterStatusBadge";
import { useApp } from "../Context/AppContextBase";
import { useIncidents } from "../hooks/useIncidents";
import { formatDateTime } from "../utils/formatters";
import { optimizeCloudinaryImage } from "../utils/images";
import ReporterLayout from "./ReporterLayout";

export default function ReporterIncidentDetails() {
  const { incidentId } = useParams();
  const { user } = useApp();
  const { incidents, loading } = useIncidents({ reporterId: user?.uid });
  const incident = incidents.find((item) => item.id === incidentId);
  const images = incident?.imageUrls?.length ? incident.imageUrls : incident?.imageUrl ? [incident.imageUrl] : [];

  return (
    <ReporterLayout>
      <div className="mb-6">
        <Link to="/reporter/my-reports" className="text-sm font-black text-[#3D4461] hover:underline dark:text-white">
          Back to reports
        </Link>
      </div>

      {loading ? (
        <div className="rounded-lg bg-white p-12 text-center font-bold text-slate-500 shadow-xl dark:bg-slate-900">
          Loading report...
        </div>
      ) : !incident ? (
        <div className="rounded-lg bg-white p-12 text-center font-bold text-rose-600 shadow-xl dark:bg-slate-900">
          Report not found.
        </div>
      ) : (
        <article className="overflow-hidden rounded-lg bg-white shadow-xl dark:bg-slate-900">
          <header className="border-b border-slate-100 px-5 py-6 dark:border-white/10 sm:px-8">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs font-black uppercase tracking-widest text-slate-500">
                {incident.incidentId || incident.id.slice(0, 8)}
              </span>
              <ReporterStatusBadge status={incident.status} />
              <span className="rounded-full bg-[#DEDED8] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#3D4461] dark:bg-slate-800 dark:text-white">
                {incident.priority || "Medium"}
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">{incident.type || "Incident"}</h1>
            <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              Submitted {formatDateTime(incident.createdAt)}
            </p>
          </header>

          <div className="grid grid-cols-1 gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_340px]">
            <div className="space-y-8">
              <section>
                <h2 className="mb-3 text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Description
                </h2>
                <p className="leading-7 text-slate-700 dark:text-slate-200">
                  {incident.description || "No description added."}
                </p>
              </section>

              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Detail label="Reported by" value={incident.name} />
                <Detail label="Incident date" value={formatDateTime(incident.dateTime)} />
                <Detail label="Location" value={incident.location} />
                <Detail label="Assigned unit" value={incident.assigned || "notAssigned"} />
                <Detail label="Contact number" value={incident.contactNumber} />
                <Detail label="Email" value={incident.emailAddress || incident.reporterEmail} />
              </section>

              <section>
                <h2 className="mb-3 text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Status timeline
                </h2>
                <div className="space-y-3">
                  {(incident.statusHistory?.length
                    ? incident.statusHistory
                    : [{ status: incident.status || "notAssigned", note: "Current status", at: incident.createdAt }]
                  ).map((item, index) => (
                    <div key={`${item.status}-${index}`} className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-black">{item.status}</p>
                        <p className="text-xs font-bold text-slate-500">{formatDateTime(item.at)}</p>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {item.note || "Status updated"}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside>
              <h2 className="mb-3 text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Evidence
              </h2>
              {images.length > 0 ? (
                <div className="grid gap-3">
                  {images.map((imageUrl) => (
                    <img
                      key={imageUrl}
                      src={optimizeCloudinaryImage(imageUrl)}
                      alt="Incident evidence"
                      width="680"
                      height="510"
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/3] w-full rounded-lg border border-slate-100 object-cover shadow-md dark:border-white/10"
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg bg-[#DEDED8] p-10 text-center font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  No image attached
                </div>
              )}
            </aside>
          </div>
        </article>
      )}
    </ReporterLayout>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
      <p className="mb-1 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="font-bold">{value || "-"}</p>
    </div>
  );
}
