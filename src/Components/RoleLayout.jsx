import { NavLink, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  ClipboardList,
  FileText,
  Headphones,
  Home,
  LogOut,
  Monitor,
  Moon,
  Plus,
  Radio,
  Settings,
  Sun,
  User,
  Users,
} from "lucide-react";
import { useApp } from "../Context/AppContextBase";

const ROLE_NAV = {
  reporter: [
    { name: "Dashboard", path: "/reporter", icon: Home },
    { name: "New Incident", path: "/reporter/report", icon: Plus },
    { name: "View Reports", path: "/reporter/my-reports", icon: FileText },
    { name: "Edit Profile", path: "/reporter/profile", icon: User },
    { name: "Support", path: "/reporter/support", icon: Headphones },
  ],
  dispatcher: [
    { name: "Dashboard", path: "/dispatcher", icon: Home },
    { name: "All Incidents", path: "/dispatcher/all", icon: ClipboardList },
    { name: "Active Incidents", path: "/dispatcher/assign", icon: Radio },
    { name: "View Reports", path: "/dispatcher/reports", icon: BarChart3 },
  ],
  paramedic: [
    { name: "Dashboard", path: "/paramedic", icon: Home },
  ],
  admin: [
    { name: "Dashboard", path: "/admin", icon: Home },
    { name: "Manage Incidents", path: "/admin/incidents", icon: AlertTriangle },
    { name: "Manage Users", path: "/admin/users", icon: Users },
    { name: "Add User", path: "/admin/add-user", icon: Plus },
    { name: "View Reports", path: "/admin/reports", icon: BarChart3 },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ],
};

function ThemeIcon({ theme }) {
  if (theme === "dark") return <Moon size={18} aria-hidden="true" />;
  if (theme === "light") return <Sun size={18} aria-hidden="true" />;
  return <Monitor size={18} aria-hidden="true" />;
}

export default function RoleLayout({ children, role = "reporter" }) {
  const { activeTheme, appConfig, cycleTheme, logout, themePreference } = useApp();
  const navigate = useNavigate();
  const navItems = ROLE_NAV[role] || ROLE_NAV.reporter;

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-[#DEDED8] text-slate-800 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-[#DEDED8]/95 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-slate-950/95 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <NavLink to={`/${role}`} className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#3D4461] text-sm font-black text-white shadow-md">
              HL
            </span>
            <span className="min-w-0">
              <span className="block text-base font-black tracking-tight text-[#3D4461] dark:text-white">
                {appConfig.brand.name}
              </span>
              <span className="hidden text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 sm:block">
                {role}
              </span>
            </span>
          </NavLink>

          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {navItems.map((item) => (
              <DesktopNavItem key={item.path} item={item} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cycleTheme}
              className="grid h-10 w-10 place-items-center rounded-lg border border-black/10 bg-white/70 text-[#3D4461] transition hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white"
              title={`Theme: ${themePreference}`}
              aria-label={`Theme: ${themePreference}`}
            >
              <ThemeIcon theme={themePreference === "system" ? activeTheme : themePreference} />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="hidden h-10 items-center gap-2 rounded-lg bg-[#3D4461] px-4 text-sm font-bold text-white transition hover:bg-[#30364f] sm:inline-flex"
            >
              <LogOut size={17} aria-hidden="true" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 md:pb-8 lg:px-8">
        {children}
      </main>

      <Footer supportPhone={appConfig.brand.supportPhone} emergencyPhone={appConfig.brand.emergencyPhone} />

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/95 px-2 py-2 shadow-[0_-14px_30px_rgba(15,23,42,0.12)] backdrop-blur md:hidden dark:border-white/10 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-md items-center justify-around gap-1">
          {navItems.slice(0, 5).map((item) => (
            <MobileNavItem key={item.path} item={item} />
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-black text-rose-600"
          >
            <LogOut size={18} aria-hidden="true" />
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
}

function DesktopNavItem({ item }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      end={item.path.split("/").length <= 2}
      className={({ isActive }) =>
        `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition ${
          isActive
            ? "bg-[#3D4461] text-white shadow-md"
            : "text-slate-600 hover:bg-white/70 hover:text-[#3D4461] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
        }`
      }
    >
      <Icon size={17} aria-hidden="true" />
      {item.name}
    </NavLink>
  );
}

function MobileNavItem({ item }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      end={item.path.split("/").length <= 2}
      className={({ isActive }) =>
        `flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-black transition ${
          isActive
            ? "bg-[#3D4461] text-white"
            : "text-slate-500 dark:text-slate-300"
        }`
      }
    >
      <Icon size={18} aria-hidden="true" />
      <span className="max-w-full truncate">{item.name}</span>
    </NavLink>
  );
}

function Footer({ emergencyPhone, supportPhone }) {
  return (
    <footer className="border-t border-black/5 bg-[#cfd2ca] px-4 py-8 pb-28 text-sm text-slate-600 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 sm:px-6 md:pb-8 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
        <div>
          <p className="font-black text-[#3D4461] dark:text-white">Health LINK</p>
          <p className="mt-1 font-semibold">Secure incident coordination</p>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Emergency
          </p>
          <p className="mt-1 font-black text-slate-800 dark:text-white">{emergencyPhone}</p>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Support Desk
          </p>
          <p className="mt-1 font-black text-slate-800 dark:text-white">{supportPhone}</p>
        </div>
      </div>
    </footer>
  );
}
