import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function IncidentTable() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function fetchIncidents() {
      try {
        const querySnapshot = await getDocs(collection(db, "Incidents"));

        const incidentList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setIncidents(incidentList);
      } catch (error) {
        console.error("Error fetching incidents:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchIncidents();
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading incidents...</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-4 py-3">Incident ID</th>
            <th className="px-4 py-3">Incident Type</th>
            <th className="px-4 py-3">Date reported</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Assigned Unit</th>
          </tr>

        </thead>

        <tbody>
          {incidents.map((incident) => (
            console.log(incident),
            <tr key={incident.id} className="border-t">
              <td className="px-4 py-3 font-medium">{incident.incidentId}</td>
              <td className="px-4 py-3">{incident.type}</td>
              <td className="px-4 py-3">{incident.date}</td>
              <td className="px-4 py-3">{incident.location}</td>
              <td className="px-4 py-3">{incident.status}</td>
              <td className="px-4 py-3">{incident.assigned || "Not assigned"}</td>

            </tr>
          )
          )}
        </tbody>
      </table>
    </div>
  );
}

// Explanation of the above code:
// 1) This is a React functional component called IncidentTable.
// 2) It uses the useState hook to manage the state of incidents and loading.
// 3) The useEffect hook is used to fetch incident data from Firestore when the component mounts.
// 4) The getDocs function retrieves documents from the "incidents" collection in Firestore.
// 5) The retrieved data is stored in the incidents state variable, and loading is set to false once the data is fetched.
// 6) If loading is true, a loading message is displayed. Otherwise, a table of incidents is rendered.
// 7) The table displays various details about each incident, such as ID, type, date, location, status, and assigned unit.