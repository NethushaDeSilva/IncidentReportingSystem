import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebaseAuth";
import { buildFallbackProfile } from "../utils/userProfiles";

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      setLoading(true);

      try {
        const snapshot = await getDocs(collection(db, "users"));
        if (cancelled) return;

        const nextUsers = snapshot.docs.map((document) => ({
          id: document.id,
          uid: document.id,
          ...document.data(),
        }));
        setUsers(
          nextUsers.sort((a, b) =>
            (a.fullName || a.email || "").localeCompare(b.fullName || b.email || "")
          )
        );
        setLoading(false);
        setError("");
      } catch (snapshotError) {
        if (cancelled) return;

        console.error("Unable to stream users:", snapshotError);
        const currentUser = auth.currentUser;
        setUsers(currentUser ? [buildFallbackProfile(currentUser)] : []);
        setError(
          snapshotError?.code === "permission-denied"
            ? "Firebase rules are blocking the full users list. Showing the signed-in user only."
            : "Could not load user data."
        );
        setLoading(false);
      }
    }

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  const dispatchers = useMemo(
    () => users.filter((user) => user.role === "dispatcher" && user.status !== "Inactive"),
    [users]
  );

  return { dispatchers, error, loading, users };
}
