import { getAuth } from "firebase/auth";
import { app, secondaryApp } from "./firebaseCore";

export const auth = getAuth(app);
export const secondaryAuth = getAuth(secondaryApp);
