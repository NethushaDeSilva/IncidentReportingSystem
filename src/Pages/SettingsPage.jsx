import { Bell, Monitor } from "lucide-react";
import { useApp } from "../Context/AppContextBase";
import { requestBrowserNotificationPermission } from "../utils/browserCapabilities";
import AdminLayout from "./AdminLayout";
import DispatcherLayout from "./DispatcherLayout";
import ReporterLayout from "./ReporterLayout";

const LAYOUTS = {
  admin: AdminLayout,
  dispatcher: DispatcherLayout,
  reporter: ReporterLayout,
};

export default function SettingsPage({ role = "admin" }) {
  const { setThemePreference, themePreference } = useApp();
  const Layout = LAYOUTS[role] || AdminLayout;

  async function handleNotificationPermission() {
    await requestBrowserNotificationPermission();
  }

  return (
    <Layout>
      <header className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#5F675C] dark:text-slate-400">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Settings</h1>
      </header>

      <section className="grid gap-5 md:grid-cols-2">
        <div className="rounded-lg bg-white p-5 shadow-xl dark:bg-slate-900 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#3D4461] text-white">
              <Monitor size={20} />
            </span>
            <h2 className="text-xl font-black">Appearance</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["system", "light", "dark"].map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => setThemePreference(theme)}
                className={`rounded-lg px-4 py-3 text-sm font-black capitalize transition ${
                  themePreference === theme
                    ? "bg-[#3D4461] text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-white p-5 shadow-xl dark:bg-slate-900 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#3D4461] text-white">
              <Bell size={20} />
            </span>
            <h2 className="text-xl font-black">Notifications</h2>
          </div>
          <button
            type="button"
            onClick={handleNotificationPermission}
            className="rounded-lg bg-[#3D4461] px-5 py-3 font-black text-white shadow-lg hover:bg-[#30364f]"
          >
            Enable notifications
          </button>
        </div>
      </section>
    </Layout>
  );
}
