import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { isFutureDateTimeValue } from "../utils/dateTimeLimits";

export async function createIncident(payload) {
  if (isFutureDateTimeValue(payload.dateTime)) {
    throw new Error("Incident date and time cannot be in the future.");
  }

  const incidentId = `INC-${Date.now()}`;
  const createdAt = Timestamp.now();

  return addDoc(collection(db, "Incidents"), {
    ...payload,
    incidentId,
    status: payload.status || "notAssigned",
    assigned: payload.assigned || "",
    assignedUserId: payload.assignedUserId || "",
    createdAt,
    updatedAt: createdAt,
    statusHistory: [
      {
        status: payload.status || "notAssigned",
        note: "Report submitted",
        at: createdAt,
      },
    ],
  });
}

export async function updateIncident(incidentId, updates, note = "Incident updated") {
  const historyUpdate = updates.status
    ? {
        statusHistory: arrayUnion({
          status: updates.status,
          note,
          at: Timestamp.now(),
        }),
      }
    : {};

  return updateDoc(doc(db, "Incidents", incidentId), {
    ...updates,
    ...historyUpdate,
    updatedAt: serverTimestamp(),
  });
}

export async function assignIncident(incidentId, unit, dispatcher) {
  return updateIncident(
    incidentId,
    {
      assigned: unit?.name || "",
      assignedUnitId: unit?.id || "",
      assignedUnitType: unit?.type || "",
      assignedUserId: dispatcher?.uid || dispatcher?.id || "",
      assignedDispatcherId: dispatcher?.uid || dispatcher?.id || "",
      assignedDispatcherEmail: dispatcher?.email || "",
      assignedAt: serverTimestamp(),
      status: "Open",
    },
    `Assigned to ${unit?.name || "response unit"}`
  );
}

export async function deleteIncident(incidentId) {
  return deleteDoc(doc(db, "Incidents", incidentId));
}
