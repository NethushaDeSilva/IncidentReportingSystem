import { Link, useParams } from "react-router-dom";
import ReporterStatusBadge from "../Components/ReporterStatusBadge";
import { useIncidents } from "../hooks/useIncidents";
import { formatDateTime } from "../utils/formatters";
import AdminLayout from "./AdminLayout";
import DispatcherLayout from "./DispatcherLayout";

const ROLE_CONFIG = {
  admin: {
    backLabel: "Back to manage incidents",
    backPath: "/admin/incidents",
    heading: "Incident details",
    Layout: AdminLayout,
  },
  dispatcher: {
    backLabel: "Back to all incidents",
    backPath: "/dispatcher/all",
    heading: "Incident details",
    Layout: DispatcherLayout,
  },
};

export default function IncidentDetailsPage({ role = "admin" }) {
  const { incidentId } = useParams();
  const { incidents, loading } = useIncidents();
  const incident = incidents.find((item) => item.id === incidentId);
  const images = incident?.imageUrls?.length ? incident.imageUrls : incident?.imageUrl ? [incident.imageUrl] : [];
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.admin;
  const Layout = config.Layout;

  return (
    <Layout>
      <div className="mb-6">
        <Link to={config.backPath} className="text-sm font-black text-[#3D4461] hover:underline dark:text-white">
          {config.backLabel}
        </Link>
      </div>

      {loading ? (
        <StateMessage>Loading incident...</StateMessage>
      ) : !incident ? (
        <StateMessage danger>Incident not found.</StateMessage>
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
              {config.heading} - Submitted {formatDateTime(incident.createdAt)}
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
                <Detail label="Reporter" value={incident.name || incident.reporterName} />
                <Detail label="Reporter email" value={incident.emailAddress || incident.reporterEmail} />
                <Detail label="Contact number" value={incident.contactNumber} />
                <Detail label="Incident date" value={formatDateTime(incident.dateTime)} />
                <Detail label="Date reported" value={formatDateTime(incident.createdAt)} />
                <Detail label="Last updated" value={formatDateTime(incident.updatedAt)} />
                <Detail label="Location" value={incident.location} />
                <Detail label="Assigned unit" value={incident.assigned || "notAssigned"} />
                <Detail label="Unit type" value={incident.assignedUnitType} />
                <Detail label="Dispatcher email" value={incident.assignedDispatcherEmail} />
                <Detail label="Incident document ID" value={incident.id} />
                <Detail label="Reporter ID" value={incident.reporterId} />
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
                Images
              </h2>
              {images.length > 0 ? (
                <div className="grid gap-3">
                  {images.map((imageUrl) => (
                    <img
                      key={imageUrl}
                      src={imageUrl}
                      alt="Incident evidence"
                      className="w-full rounded-lg border border-slate-100 object-cover shadow-md dark:border-white/10"
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
    </Layout>
  );
}

function StateMessage({ children, danger = false }) {
  return (
    <div className={`rounded-lg bg-white p-12 text-center font-bold shadow-xl dark:bg-slate-900 ${danger ? "text-rose-600" : "text-slate-500"}`}>
      {children}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
      <p className="mb-1 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="break-words font-bold text-slate-800 dark:text-slate-100">{value || "-"}</p>
    </div>
  );
}
