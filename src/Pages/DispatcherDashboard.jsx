import { Link, useLocation } from "react-router-dom";

export default function DispatcherSidebar() {
    const location = useLocation();

    const menu = [
        { name: "Dashboard", path: "/dispatcher" },
        { name: "Assign Incidents", path: "/dispatcher/assign" },
        { name: "All Incidents", path: "/dispatcher/all" },
        { name: "Logout", path: "/" },
    ];

    return (
        <div className="w-56 min-h-screen bg-gray-200 border-r p-4">
            <h2 className="font-bold mb-6">Dispatcher Panel</h2>

            {menu.map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`block px-3 py-2 mb-2 rounded border ${location.pathname === item.path
                        ? "bg-orange-200 border-orange-400"
                        : "bg-white hover:bg-orange-100"
                        }`}
                >
                    {item.name}
                </Link>
            ))}
        </div>
    );
}