import { createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { deleteDoc, doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db, secondaryAuth } from "../firebase";
import { isFutureDateInput } from "../utils/dateTimeLimits";
import { assertValidNic, limitNic } from "../utils/nic";
import { normalizeRole } from "../utils/roles";

export async function createManagedUser(form) {
  if (isFutureDateInput(form.dob)) {
    throw new Error("Date of birth cannot be in the future.");
  }
  assertValidNic(form.nic || "");

  const credential = await createUserWithEmailAndPassword(secondaryAuth, form.email, form.password);
  await updateProfile(credential.user, { displayName: form.fullName });

  await setDoc(doc(db, "users", credential.user.uid), {
    fullName: form.fullName,
    email: form.email,
    mobile: form.mobile || "",
    dob: form.dob || "",
    nic: limitNic(form.nic || ""),
    role: normalizeRole(form.role),
    responseUnitId: normalizeRole(form.role) === "paramedic" ? form.responseUnitId || "" : "",
    status: form.status || "Active",
    createdAt: serverTimestamp(),
  });

  await signOut(secondaryAuth);
  return credential.user.uid;
}

export async function updateManagedUser(userId, updates) {
  const nextUpdates = { ...updates };
  if ("role" in nextUpdates) nextUpdates.role = normalizeRole(nextUpdates.role);
  if (nextUpdates.role && nextUpdates.role !== "paramedic") nextUpdates.responseUnitId = "";
  if ("dob" in nextUpdates && isFutureDateInput(nextUpdates.dob)) {
    throw new Error("Date of birth cannot be in the future.");
  }
  if ("nic" in nextUpdates) {
    assertValidNic(nextUpdates.nic || "");
    nextUpdates.nic = limitNic(nextUpdates.nic || "");
  }

  return updateDoc(doc(db, "users", userId), {
    ...nextUpdates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteManagedUser(userId) {
  return deleteDoc(doc(db, "users", userId));
}
