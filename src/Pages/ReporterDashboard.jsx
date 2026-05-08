import { useEffect, useState } from "react";

import Sidebar from "../Components/Sidebar";
import SummaryCard from "../Components/SummaryCard";
import IncidentsTable from "../Components/IncidentsTable";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db, auth } from "../firebase";

export default function ReporterDashboard() {

  // Store incidents
  const [incidents, setIncidents] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Fetch incidents when component loads
  useEffect(() => {

    async function fetchIncidents() {

      try {

        // Get logged-in user
        const currentUser = auth.currentUser;

        if (!currentUser) {
          console.log("No authenticated user");
          setLoading(false);
          return;
        }

        console.log("Reporter UID:", currentUser.uid);

        // Fetch ONLY current user's incidents
        const q = query(
          collection(db, "Incidents"),
          where("reporterId", "==", currentUser.uid)
        );

        const querySnapshot = await getDocs(q);

        const incidentList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Reporter Incidents:", incidentList);

        setIncidents(incidentList);

      } catch (error) {

        console.error(
          "Error fetching reporter incidents:",
          error
        );

      } finally {

        setLoading(false);
      }
    }

    fetchIncidents();

  }, []);

  // Dynamic counts
  const totalIncidents = incidents.length;

  const pendingIncidents = incidents.filter(
    (incident) => incident.status === "Pending"
  ).length;

  const resolvedIncidents = incidents.filter(
    (incident) => incident.status === "Resolved"
  ).length;

  return (

    <div className="min-h-screen bg-slate-50 flex">

      {/* Sidebar */}
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">

        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between mb-10">

            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Welcome, User
              </h1>

              <p className="text-slate-500 mt-1 font-medium">
                Here's a summary of your reported incidents.
              </p>
            </div>

            <div className="mt-4 md:mt-0 flex gap-3">

              <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 text-sm">
                New Incident
              </button>

            </div>

          </header>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">

            <SummaryCard
              title="Total Incidents"
              value={loading ? "..." : totalIncidents}
              color="blue"
            />

            <SummaryCard
              title="Pending Incidents"
              value={loading ? "..." : pendingIncidents}
              color="amber"
            />

            <SummaryCard
              title="Resolved Incidents"
              value={loading ? "..." : resolvedIncidents}
              color="emerald"
            />

          </div>

          {/* Incidents Table */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">

            <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">

              <h2 className="font-bold text-slate-800">
                Recent Entries
              </h2>

              <button className="text-sm font-bold text-blue-600 hover:text-blue-700">
                View All
              </button>

            </div>

            <div className="p-4">
              <IncidentsTable />
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}