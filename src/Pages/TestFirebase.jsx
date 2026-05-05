import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function TestFirebase() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const querySnapshot = await getDocs(collection(db, "Incidents"));

        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Fetched data:", data); // check console

        setIncidents(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Firebase Test</h1>

      {incidents.length === 0 ? (
        <p>No data found</p>
      ) : (
        incidents.map((item) => (
          <div key={item.id} className="border p-3 mb-2">
            <p><strong>Type:</strong> {item.type}</p>
            <p><strong>Location:</strong> {item.location}</p>
            <p><strong>Status:</strong> {item.status}</p>
          </div>
        ))
      )}
    </div>
  );
}