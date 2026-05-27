import { getFirestore } from "firebase/firestore";
import { app } from "./firebaseCore";
export { auth, secondaryAuth } from "./firebaseAuth";

export const db = getFirestore(app);
