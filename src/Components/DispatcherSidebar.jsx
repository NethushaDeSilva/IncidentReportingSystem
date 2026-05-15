import { Link, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function DispatcherSidebar() {
    const location = useLocation();

    const menuItems = [
        { name: "Dashboard", path: "/dispatcher" },
        { name: "Assign Incidents", path: "/dispatcher/assign" },
        { name: "All Incidents", path: "/dispatcher/all" },
    ];

    const handleLogout = async () => {
        await signOut(auth);
        window.location.href = "/";
    };

    return (
        <div className="w-64 min-h-screen bg-[#3D4461] text-white flex flex-col shadow-2xl">
            <div className="p-8">
                <div className="bg-[#DEDED8] text-[#3D4461] px-4 py-2 rounded-lg font-black text-center mb-10 shadow-inner">
                    Health LINK
                </div>
                
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Dispatch Menu</h2>

                <nav className="space-y-3">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center px-4 py-3 rounded-xl font-semibold transition-all
                                ${location.pathname === item.path
                                    ? "bg-[#DEDED8] text-[#3D4461] shadow-lg"
                                    : "hover:bg-white/10 text-slate-300"
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="mt-auto p-8">
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white rounded-xl font-bold transition-all border border-rose-500/30"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
