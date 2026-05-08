import { Link, useLocation } from "react-router-dom";
import AdminIncidentsTable from "../Components/AdminIncidentsTable";
import { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    doc,
    updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import DispatcherSidebar from "../Components/DispatcherSidebar";

// ─── colour tokens ────────────────────────────────────────────────────────────
const SAGE = "#636B5B";
const PURPLE = "#4E4468";
const PAGE_BG = "#DEDED8";

const STATUS_STYLES = {
    Open: "bg-yellow-100 text-yellow-800",
    "In Progress": "bg-blue-100  text-blue-800",
    Resolved: "bg-green-100 text-green-800",
    Closed: "bg-gray-100  text-gray-600",
};

const STATUS_OPTIONS = ["Open", "In Progress", "Resolved", "Closed"];

// ─── Summary Card ─────────────────────────────────────────────────────────────
function Card({ label, value, color }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <p className="text-sm text-gray-500">{label}</p>
            <h3 className="text-3xl font-bold mt-2" style={{ color }}>
                {value}
            </h3>
        </div>
    );
}

export default function DispatcherDashboard() {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    const uid = auth.currentUser?.uid;

    useEffect(() => {
        async function load() {
            if (!uid) { setLoading(false); return; }
            try {
                // Fetch incidents assigned to this dispatcher
                const q = query(
                    collection(db, "incidents"),
                    where("assignedUserId", "==", uid),
                    orderBy("createdAt", "desc")
                );
                const snap = await getDocs(q);
                setIncidents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
            } catch (err) {
                console.error("Error loading dispatcher incidents:", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [uid]);

    async function handleStatusChange(incidentId, newStatus) {
        setUpdatingId(incidentId);
        try {
            await updateDoc(doc(db, "incidents", incidentId), { status: newStatus });
            setIncidents((prev) =>
                prev.map((i) => (i.id === incidentId ? { ...i, status: newStatus } : i))
            );
        } catch (err) {
            console.error(err);
        } finally {
            setUpdatingId(null);
        }
    }

    // ── Stats ──────────────────────────────────────────────────────────────────
    const total = incidents.length;
    const open = incidents.filter((i) => i.status === "Open").length;
    const inProgress = incidents.filter((i) => i.status === "In Progress").length;
    const resolved = incidents.filter(
        (i) => i.status === "Resolved" || i.status === "Closed"
    ).length;

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: PAGE_BG }}>
            <DispatcherSidebar active="dashboard" />

            <main className="flex-1 p-6 overflow-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Incidents assigned to you
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                    <Card label="Total Assigned" value={total} color="#374151" />
                    <Card label="Open" value={open} color="#B45309" />
                    <Card label="In Progress" value={inProgress} color="#1D4ED8" />
                    <Card label="Resolved/Closed" value={resolved} color="#15803D" />
                </div>

                {/* Incidents Table */}
                <h2 className="text-lg font-semibold text-gray-700 mb-3">
                    Assigned Incidents
                </h2>

                {loading ? (
                    <div className="flex items-center gap-2 text-gray-500 py-12 justify-center">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Loading…
                    </div>
                ) : incidents.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-200 text-gray-400">
                        <p className="text-5xl mb-3">📭</p>
                        <p className="font-medium">No incidents assigned to you yet.</p>
                        <p className="text-sm mt-1">An admin will assign incidents here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wide">
                                <tr>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Reporter</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Location</th>
                                    <th className="px-4 py-3">Contact</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {incidents.map((incident) => (
                                    <tr key={incident.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3 font-medium text-gray-800">
                                            {incident.type || "—"}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{incident.name || "—"}</td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">{incident.date || "—"}</td>
                                        <td className="px-4 py-3 text-gray-600">{incident.location || "—"}</td>
                                        <td className="px-4 py-3 text-gray-600 text-xs">
                                            {incident.contactNumber || "—"}
                                        </td>

                                        {/* Inline status change */}
                                        <td className="px-4 py-3">
                                            <select
                                                value={incident.status || "Open"}
                                                disabled={updatingId === incident.id}
                                                onChange={(e) =>
                                                    handleStatusChange(incident.id, e.target.value)
                                                }
                                                className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-300 ${STATUS_STYLES[incident.status] || STATUS_STYLES.Open
                                                    }`}
                                            >
                                                {STATUS_OPTIONS.map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </td>

                                        <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                                            {incident.description || "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
