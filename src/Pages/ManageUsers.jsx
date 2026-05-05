import AdminSidebar from "../Components/AdminSidebar";

export default function ManageUsers() {
    return (
        <div className="flex min-h-screen">
            <AdminSidebar />

            <div className="flex-1 p-6">
                <h1 className="text-xl font-bold mb-4">Manage Users</h1>

                <table className="w-full bg-white border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th>User ID</th>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                </table>
            </div>
        </div>
    );
}
