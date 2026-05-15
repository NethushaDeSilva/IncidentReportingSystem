import { Link, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function AdminSidebar() {

    const location = useLocation();

    // Sidebar menu items
    const menuItems = [
        { name: "Dashboard", path: "/admin" },

        { name: "Manage Incidents", path: "/admin/incidents" },

        { name: "Manage Users", path: "/admin/users" },

        { name: "Add User", path: "/admin/add-user" },

        // NEW REPORTS PAGE
        { name: "View Reports", path: "/admin/reports" },
    ];


    // Logout function
    const handleLogout = async () => {

        try {
            localStorage.clear();
            sessionStorage.clear();
            await signOut(auth);

            // Redirect to login
            window.location.href = "/";

        } catch (error) {

            console.error(
                "Logout Error:",
                error
            );
        }
    };

    return (

        <div className="w-64 min-h-screen bg-[#3D4461] text-white flex flex-col shadow-2xl">

            {/* Logo + Menu */}
            <div className="p-8">

                {/* Logo */}
                <div className="bg-[#DEDED8] text-[#3D4461] px-4 py-2 rounded-lg font-black text-center mb-10 shadow-inner">

                    Health LINK

                </div>

                {/* Section Title */}
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">

                    Main Menu

                </h2>

                {/* Navigation */}
                <nav className="space-y-3">

                    {menuItems.map((item) => (

                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center px-4 py-3 rounded-xl font-semibold transition-all

                                ${location.pathname === item.path

                                    ? "bg-[#DEDED8] text-[#3D4461] shadow-lg"

                                    : "hover:bg-white/10 text-slate-300"
                                }
                            `}
                        >

                            {item.name}

                        </Link>

                    ))}

                </nav>

            </div>

            {/* Logout Button */}
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