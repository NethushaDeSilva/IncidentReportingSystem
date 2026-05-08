import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../Components/AdminSidebar";
import SummaryCard from "../Components/SummaryCard";
import AdminIncidentsTable from "../Components/AdminIncidents";

export default function AdminDashboard() {

    // Store incidents
    const [incidents, setIncidents] = useState([]);

    // Loading state
    const [loading, setLoading] = useState(true);

    // Fetch all incidents
    useEffect(() => {

        async function fetchIncidents() {

            try {

                console.log("Fetching admin incidents...");

                // Get ALL incidents
                const querySnapshot =
                    await getDocs(collection(db, "Incidents"));

                // Convert Firebase docs into normal array
                const incidentList =
                    querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));

                console.log("Admin Incident List:", incidentList);

                // Save to state
                setIncidents(incidentList);

            } catch (error) {

                console.error(
                    "Error fetching admin incidents:",
                    error
                );

            } finally {

                setLoading(false);
            }
        }

        fetchIncidents();

    }, []);

    // Dynamic Card Counts

    // Total incidents
    const totalIncidents = incidents.length;

    // Active incidents
    const activeIncidents = incidents.filter(
        (incident) =>
            incident.status === "Pending" ||
            incident.status === "In Progress"
    ).length;

    // High priority incidents
    const highPriorityIncidents = incidents.filter(
        (incident) =>
            incident.priority === "High"
    ).length;

    // Resolved incidents
    const resolvedIncidents = incidents.filter(
        (incident) =>
            incident.status === "Resolved"
    ).length;

    return (

        <div className="min-h-screen bg-slate-50 flex">

            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">

                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <header className="mb-10">

                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                            Welcome "Name"
                        </h1>

                        <p className="text-slate-500 mt-1 font-medium">
                            Monitor incidents and system activity.
                        </p>

                    </header>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

                        <SummaryCard
                            title="TOTAL INCIDENTS"
                            value={loading ? "..." : totalIncidents}
                            color="blue"
                        />

                        <SummaryCard
                            title="ACTIVE INCIDENTS"
                            value={loading ? "..." : activeIncidents}
                            color="blue"
                        />

                        <SummaryCard
                            title="HIGH PRIORITY"
                            value={loading ? "..." : highPriorityIncidents}
                            color="blue"
                        />

                        <SummaryCard
                            title="RESOLVED"
                            value={loading ? "..." : resolvedIncidents}
                            color="blue"
                        />

                    </div>

                    {/* Recent Incidents Table */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">

                        <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50">

                            <h2 className="font-bold text-slate-800">
                                Recent Incidents
                            </h2>

                        </div>

                        <div className="p-4">

                            {/* Show table */}
                            <AdminIncidentsTable />

                        </div>

                    </div>

                </div>

            </main>

        </div>
    );
}