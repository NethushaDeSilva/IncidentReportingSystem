import { useState } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { Save, RotateCcw } from "lucide-react";
import { useApp } from "../Context/AppContextBase";
import { auth, db } from "../firebase";
import { notifyUser } from "../utils/browserCapabilities";
import { initials } from "../utils/formatters";
import ReporterLayout from "./ReporterLayout";

export default function ReporterProfilePage() {
  const { appConfig, profile, refreshProfile, user } = useApp();
  const [draft, setDraft] = useState(() => ({
    fullName: profile?.fullName || user?.displayName || "",
    mobile: profile?.mobile || "",
    dob: profile?.dob || "",
    nic: profile?.nic || "",
    email: profile?.email || user?.email || "",
  }));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(event) {
    setDraft((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage("");
    setErrorMsg("");

    try {
      await updateProfile(auth.currentUser, { displayName: draft.fullName });
      await setDoc(
        doc(db, "users", user.uid),
        {
          fullName: draft.fullName,
          mobile: draft.mobile,
          dob: draft.dob,
          nic: draft.nic,
          email: draft.email || user.email,
          role: "reporter",
          status: profile?.status || "Active",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      await refreshProfile();
      setMessage("Profile updated successfully.");
      await notifyUser(appConfig.brand.name, "Profile updated successfully.");
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setDraft({
      fullName: profile?.fullName || user?.displayName || "",
      mobile: profile?.mobile || "",
      dob: profile?.dob || "",
      nic: profile?.nic || "",
      email: profile?.email || user?.email || "",
    });
    setMessage("");
    setErrorMsg("");
  }

  return (
    <ReporterLayout>
      <header className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#5F675C] dark:text-slate-400">
          Reporter Account
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">EDIT PROFILE</h1>
      </header>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-lg bg-[#3D4461] p-6 text-white shadow-xl">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-[#DEDED8] text-2xl font-black text-[#3D4461]">
            {initials(draft.fullName || draft.email)}
          </div>
          <h2 className="mt-5 text-2xl font-black">{draft.fullName || "Reporter"}</h2>
          <p className="mt-2 break-words text-sm font-semibold text-slate-200">{draft.email || user?.email}</p>
        </aside>

        <form onSubmit={handleSubmit} className="rounded-lg bg-white p-5 shadow-xl dark:bg-slate-900 sm:p-8">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Full Name">
              <Input name="fullName" value={draft.fullName} onChange={handleChange} />
            </Field>
            <Field label="Email">
              <Input name="email" type="email" value={draft.email} onChange={handleChange} />
            </Field>
            <Field label="Phone Number">
              <Input name="mobile" type="tel" value={draft.mobile} onChange={handleChange} />
            </Field>
            <Field label="DOB">
              <Input name="dob" type="date" value={draft.dob} onChange={handleChange} required={false} />
            </Field>
            <Field label="NIC / Passport number">
              <Input name="nic" value={draft.nic} onChange={handleChange} required={false} />
            </Field>
          </div>

          {errorMsg && <p className="mt-6 rounded-lg bg-rose-50 p-4 text-center font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{errorMsg}</p>}
          {message && <p className="mt-6 rounded-lg bg-emerald-50 p-4 text-center font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">{message}</p>}

          <div className="mt-8 flex flex-col justify-end gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-600 px-6 py-3 font-black text-white shadow-lg hover:bg-slate-700"
            >
              <RotateCcw size={17} />
              Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3D4461] px-6 py-3 font-black text-white shadow-lg hover:bg-[#30364f] disabled:opacity-60"
            >
              <Save size={17} />
              {saving ? "Saving..." : "Submit"}
            </button>
          </div>
        </form>
      </section>
    </ReporterLayout>
  );
}

function Field({ label, children }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      {children}
    </label>
  );
}

function Input({ required = true, ...props }) {
  return <input {...props} required={required} placeholder="Enter Text" className="field-input" />;
}
