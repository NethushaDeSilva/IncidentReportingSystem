import AdminSidebar from "../Components/AdminSidebar";

export default function AddUser() {
    return (
        <div className="flex min-h-screen">
            <AdminSidebar />

            <div className="flex-1 p-6">
                <h1 className="text-xl font-bold mb-4">Add User</h1>

                <form className="bg-white p-6 rounded shadow space-y-4 max-w-md">
                    <input placeholder="Full Name" className="w-full border p-2" />
                    <input placeholder="Email" className="w-full border p-2" />
                    <input placeholder="Password" className="w-full border p-2" />

                    <button className="bg-blue-600 text-white px-4 py-2 rounded">
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
}