import { Link, useLocation } from "react-router-dom";

export default function AdminSidebar() {
    const location = useLocation();

    const menuItems = [
        { name: "Dashboard", path: "/admin" },
        { name: "Manage Incidents", path: "/admin/incidents" },
        { name: "Manage Users", path: "/admin/users" },
        { name: "Add User", path: "/admin/add-user" },
        { name: "Logout", path: "/" },
    ];

    return (
        <div className="w-52 min-h-screen bg-gray-100 border-r p-4">
            <h2 className="text-lg font-bold mb-6">Admin Panel</h2>

            <div className="space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`block px-3 py-2 rounded text-sm border ${location.pathname === item.path
                            ? "bg-orange-200 border-orange-400"
                            : "bg-white border-gray-300 hover:bg-orange-100"
                            }`}
                    >
                        {item.name}
                    </Link>
                ))}
            </div>
        </div>
    );
}
