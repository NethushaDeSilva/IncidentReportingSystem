import AdminIncidentsTable from "../Components/AdminIncidents";
import AdminLayout from "./AdminLayout";

export default function ManageIncidents() {
  return (
    <AdminLayout>
      <header className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#5F675C] dark:text-slate-400">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Manage Incidents</h1>
        <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">System reports</p>
      </header>

      <section className="rounded-lg bg-white p-5 shadow-xl dark:bg-slate-900 sm:p-6">
        <AdminIncidentsTable />
      </section>
    </AdminLayout>
  );
}
