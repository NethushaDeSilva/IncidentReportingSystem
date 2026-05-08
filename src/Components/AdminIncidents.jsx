import { useEffect, useState } from "react";

import {
    collection,
    getDocs,
} from "firebase/firestore";

import { db } from "../firebase";

export default function AdminIncidentsTable() {

    const [incidents, setIncidents] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        async function fetchIncidents() {

            try {

                // Fetch ALL incidents
                const querySnapshot =
                    await getDocs(collection(db, "Incidents"));

                const incidentList =
                    querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));

                setIncidents(incidentList);

            } catch (error) {

                console.error(
                    "Error fetching incidents:",
                    error
                );

            } finally {

                setLoading(false);
            }
        }

        fetchIncidents();

    }, []);

    // Loading
    if (loading) {
        return (
            <p className="text-gray-500">
                Loading incidents...
            </p>
        );
    }

    // Empty state
    if (incidents.length === 0) {
        return (
            <p className="text-gray-500">
                No incidents found
            </p>
        );
    }

    return (

        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">

            <table className="w-full text-left text-sm">

                {/* Header */}
                <thead className="bg-gray-100 text-gray-700">

                    <tr>

                        <th className="px-4 py-3">
                            Incident ID
                        </th>

                        <th className="px-4 py-3">
                            Incident Type
                        </th>

                        <th className="px-4 py-3">
                            Date Reported
                        </th>

                        <th className="px-4 py-3">
                            Location
                        </th>

                        <th className="px-4 py-3">
                            Status
                        </th>

                        <th className="px-4 py-3">
                            Assigned Unit
                        </th>

                    </tr>

                </thead>

                {/* Body */}
                <tbody>

                    {incidents.map((incident) => (

                        <tr
                            key={incident.id}
                            className="border-t hover:bg-gray-50"
                        >

                            <td className="px-4 py-3 font-medium">
                                {incident.incidentId || incident.id}
                            </td>

                            <td className="px-4 py-3">
                                {incident.type || "N/A"}
                            </td>

                            <td className="px-4 py-3">
                                {incident.date || "N/A"}
                            </td>

                            <td className="px-4 py-3">
                                {incident.location || "N/A"}
                            </td>

                            <td className="px-4 py-3">

                                <span
                                    className={`px-2 py-1 rounded text-xs font-semibold
                    ${incident.status === "Resolved"
                                            ? "bg-green-100 text-green-700"

                                            : incident.status === "Pending"
                                                ? "bg-yellow-100 text-yellow-700"

                                                : "bg-red-100 text-red-700"
                                        }
                  `}
                                >
                                    {incident.status || "Pending"}
                                </span>

                            </td>

                            <td className="px-4 py-3">
                                {incident.assigned || "Not Assigned"}
                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
}