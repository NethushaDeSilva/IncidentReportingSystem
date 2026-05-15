import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const NAV_ITEMS = [
  { name: "Dashboard", path: "/reporter", icon: "D" },
  { name: "Report Incident", path: "/reporter/report", icon: "+" },
  { name: "My Reports", path: "/reporter/my-reports", icon: "R" },
  { name: "Profile", path: "/reporter/profile", icon: "P" },
  { name: "Support", path: "/reporter/support", icon: "?" },
];

export default function ReporterSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <aside className="w-full lg:w-64 lg:min-h-screen bg-[#3D4461] text-white flex flex-col shadow-2xl">
      <div className="p-5 lg:p-8">
        <Link
          to="/reporter"
          className="block bg-[#DEDED8] text-[#3D4461] px-4 py-2 rounded-lg font-black text-center mb-6 lg:mb-10 shadow-inner"
        >
          Health LINK
        </Link>

        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-[0.2em] mb-4 lg:mb-6">
          Reporter Menu
        </h2>

        <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3">
          {NAV_ITEMS.map((item) => {
            const active =
              location.pathname === item.path ||
              (item.path !== "/reporter" && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                  active
                    ? "bg-[#DEDED8] text-[#3D4461] shadow-lg"
                    : "text-slate-200 hover:bg-white/10"
                }`}
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black ${
                    active ? "bg-[#3D4461] text-white" : "bg-white/10 text-white"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-5 lg:p-8">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 bg-rose-500/20 text-rose-100 hover:bg-rose-500 hover:text-white rounded-xl font-bold transition-all border border-rose-400/30"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
