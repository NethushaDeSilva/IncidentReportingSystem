import { useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebaseAuth";
import appConfig from "../Data/appConfig.json";
import { AppContext } from "./AppContextBase";
import { isFutureDateInput } from "../utils/dateTimeLimits";
import { assertValidNic, limitNic } from "../utils/nic";
import { normalizeRole } from "../utils/roles";
import { buildFallbackProfile } from "../utils/userProfiles";

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

async function readUserProfile(user) {
  if (!user) return null;
  const [{ db }, { doc, getDoc, serverTimestamp, setDoc }] = await Promise.all([
    import("../firebase"),
    import("firebase/firestore"),
  ]);
  const profileRef = doc(db, "users", user.uid);
  let snap;
  try {
    snap = await getDoc(profileRef);
  } catch (error) {
    if (error?.code !== "permission-denied") throw error;
    console.warn("Using auth fallback profile because Firestore blocked the profile read.");
    return buildFallbackProfile(user);
  }

  if (!snap.exists()) {
    const fallbackProfile = buildFallbackProfile(user);
    await persistFallbackProfile(profileRef, fallbackProfile, setDoc, serverTimestamp);
    return fallbackProfile;
  }

  return {
    uid: user.uid,
    email: user.email,
    ...snap.data(),
    role: normalizeRole(snap.data().role),
  };
}

async function persistFallbackProfile(profileRef, fallbackProfile, setDoc, serverTimestamp) {
  try {
    await setDoc(profileRef, {
      uid: fallbackProfile.uid,
      fullName: fallbackProfile.fullName,
      email: fallbackProfile.email,
      role: fallbackProfile.role,
      status: fallbackProfile.status,
      profileSource: fallbackProfile.profileSource,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn("Using auth fallback profile because Firestore could not create the profile document.", error);
  }
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [themePreference, setThemePreference] = useState(
    () => localStorage.getItem("healthlink-theme") || "system"
  );
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setSystemTheme(media.matches ? "dark" : "light");
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const activeTheme = themePreference === "system" ? systemTheme : themePreference;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", activeTheme === "dark");
    document.documentElement.style.colorScheme = activeTheme;
    localStorage.setItem("healthlink-theme", themePreference);
  }, [activeTheme, themePreference]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setProfile(null);
        setAuthLoading(false);
        localStorage.removeItem("role");
        return;
      }

      try {
        const nextProfile = await readUserProfile(nextUser);
        setProfile(nextProfile);
        localStorage.setItem("role", normalizeRole(nextProfile?.role));
      } catch (error) {
        console.error("Unable to load user profile:", error);
        setProfile(null);
      } finally {
        setAuthLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  async function refreshProfile() {
    const nextProfile = await readUserProfile(auth.currentUser);
    setProfile(nextProfile);
    localStorage.setItem("role", normalizeRole(nextProfile?.role));
    return nextProfile;
  }

  async function login(email, password) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const nextProfile = await readUserProfile(credential.user);
    setUser(credential.user);
    setProfile(nextProfile);
    localStorage.setItem("role", normalizeRole(nextProfile?.role));
    return nextProfile;
  }

  async function registerReporter(form) {
    if (isFutureDateInput(form.dob)) {
      throw new Error("Date of birth cannot be in the future.");
    }
    assertValidNic(form.nic || "");

    const credential = await createUserWithEmailAndPassword(auth, form.email, form.password);
    await updateProfile(credential.user, { displayName: form.fullName });
    const [{ db }, { doc, serverTimestamp, setDoc }] = await Promise.all([
      import("../firebase"),
      import("firebase/firestore"),
    ]);
    const nextProfile = {
      uid: credential.user.uid,
      fullName: form.fullName,
      email: form.email,
      mobile: form.mobile,
      dob: form.dob,
      nic: limitNic(form.nic || ""),
      role: "reporter",
      status: "Active",
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, "users", credential.user.uid), nextProfile);
    setProfile(nextProfile);
    localStorage.setItem("role", "reporter");
    return nextProfile;
  }

  async function resetPassword(email) {
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    if (signInMethods.length === 0) {
      throw new Error("No registered account was found for this email address.");
    }

    await sendPasswordResetEmail(auth, email);
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
    setProfile(null);
    localStorage.removeItem("role");
  }

  function cycleTheme() {
    setThemePreference((current) => {
      if (current === "system") return "light";
      if (current === "light") return "dark";
      return "system";
    });
  }

  const value = useMemo(
    () => ({
      appConfig,
      activeTheme,
      authLoading,
      cycleTheme,
      login,
      logout,
      profile,
      refreshProfile,
      registerReporter,
      resetPassword,
      role: profile ? normalizeRole(profile.role) : "",
      setThemePreference,
      themePreference,
      user,
    }),
    [activeTheme, authLoading, profile, themePreference, user]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
