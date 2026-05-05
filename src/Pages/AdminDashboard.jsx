import AdminSidebar from "../Components/AdminSidebar";
import SummaryCard from "../Components/SummaryCard";
import IncidentTable from "../Components/IncidentsTable";

export default function AdminDashboard() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />

            <div className="flex-1 p-6">
                <h1 className="text-xl font-bold mb-6">Welcome "Name"</h1>

                {/* Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <SummaryCard title="Total Incidents" value="56" />
                    <SummaryCard title="Active Incidents" value="13" />
                    <SummaryCard title="High Priority" value="15" />
                    <SummaryCard title="Resolved" value="28" />
                </div>

                {/* Recent Incidents Table */}
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-semibold mb-3">Recent Incidents</h2>
                    <IncidentTable />
                </div>
            </div>
        </div>
    );
}