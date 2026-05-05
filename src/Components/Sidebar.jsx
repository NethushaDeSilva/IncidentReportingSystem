import { Link } from "react-router-dom";

export default function Sidebar() {
    const menuItems = [
        { name: "Dashboard", path: "/admin" },
        { name: "Add Incident", path: "/report" },
        { name: "Reports", path: "/reporter" },
        { name: "Settings", path: "/settings" },
        { name: "Logout", path: "/" },
    ];

    return (
        <div className="w-52 min-h-screen bg-gray-100 border-r p-4">
            <div className="mb-8">
                <h2 className="text-lg font-bold">Admin Panel</h2>
            </div>

            <div className="space-y-3">
                {menuItems.map((item, index) => (
                    <Link
                        key={index}
                        to={item.path}
                        className="block w-full border border-gray-400 bg-white px-3 py-2 text-sm text-left hover:bg-orange-100 transition rounded"
                    >
                        {item.name}
                    </Link>
                ))}
            </div>
        </div>
    );
}