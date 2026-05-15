import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db, auth } from "../firebase";

export default function IncidentsTable() {
  const navigate = useNavigate();

  // Store incidents fetched from Firebase
  const [incidents, setIncidents] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Runs automatically when component loads
  useEffect(() => {

    // Function to fetch incidents
    async function fetchIncidents() {

      try {

        const currentUser = auth.currentUser;

        if (!currentUser) {
          console.log("No authenticated user");
          setLoading(false);
          return;
        }

        console.log("Logged user:", currentUser.uid);

        const q = query(
          collection(db, "Incidents"),
          where("reporterId", "==", currentUser.uid)
        );

        const querySnapshot = await getDocs(q);

        const incidentList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log(incidentList);

        setIncidents(incidentList);

      } catch (error) {

        console.error(
          "Error fetching incidents:",
          error
        );

      } finally {

        // Stop loading whether success or error
        setLoading(false);
      }
    }

    // Call function
    fetchIncidents();

  }, []);

  // Show loading message
  if (loading) {
    return (
      <p className="text-gray-500">
        Loading incidents...
      </p>
    );
  }

  // Show empty state if no incidents
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

        {/* Table Header */}
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

            <th className="px-4 py-3">
              View
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>

          {incidents.map((incident) => (

            <tr
              key={incident.id}
              className="border-t hover:bg-gray-50"
            >

              {/* Incident ID */}
              <td className="px-4 py-3 font-medium">
                {incident.id}
              </td>

              {/* Incident Type */}
              <td className="px-4 py-3">
                {incident.type || "N/A"}
              </td>

              {/* Date */}
              <td className="px-4 py-3">
                {incident.date || "N/A"}
              </td>

              {/* Location */}
              <td className="px-4 py-3">
                {incident.location || "N/A"}
              </td>

              {/* Status */}
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold
                    ${incident.status === "Resolved"
                      ? "bg-green-100 text-green-700"
                      : incident.status === "notAssigned"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }
                  `}
                >
                  {incident.status || "notAssigned"}
                </span>
              </td>

              {/* Assigned Unit */}
              <td className="px-4 py-3">
                {incident.assigned || "notAssigned"}
              </td>

              {/* View */}
              <td className="px-4 py-3">
                <button
                  onClick={() => navigate(`/incident/${incident.id}`)}
                  className="rounded-lg bg-slate-700 px-3 py-2 text-white hover:bg-slate-800"
                >
                  VIEW
                </button>
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}