import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useApp } from "../Context/AppContextBase";
import { useDateTimeLimits } from "../hooks/useDateTimeLimits";
import { notifyUser } from "../utils/browserCapabilities";
import { clampDateInputToToday, isFutureDateInput } from "../utils/dateTimeLimits";
import { NIC_MAX_LENGTH, assertValidNic, limitNic } from "../utils/nic";

const EMPTY_FORM = {
  fullName: "",
  email: "",
  mobile: "",
  password: "",
  confirmPassword: "",
  dob: "",
  nic: "",
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { appConfig, registerReporter } = useApp();
  const { today } = useDateTimeLimits();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const value =
      event.target.type === "date"
        ? clampDateInputToToday(event.target.value)
        : event.target.name === "nic"
          ? limitNic(event.target.value)
          : event.target.value;
    setForm((prev) => ({ ...prev, [event.target.name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (form.password !== form.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (isFutureDateInput(form.dob)) {
      setErrorMsg("Date of birth cannot be in the future.");
      return;
    }

    try {
      assertValidNic(form.nic);
    } catch (error) {
      setErrorMsg(error.message);
      return;
    }

    try {
      setLoading(true);
      await registerReporter(form);
      setSuccessMsg("Registration Successful");
      await notifyUser(appConfig.brand.name, "Registration Successful");
      navigate("/reporter", { replace: true });
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#DEDED8] px-4 py-8 text-slate-800 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/"
          className="mb-8 inline-flex rounded-lg bg-[#3D4461] px-5 py-3 font-black text-white shadow-lg"
        >
          {appConfig.brand.name}
        </Link>

        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#5F675C] dark:text-slate-400">
            Reporter access
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Register Account</h1>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg bg-white p-5 shadow-xl dark:bg-slate-900 sm:p-8">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Full Name">
              <Input name="fullName" value={form.fullName} onChange={handleChange} autoComplete="name" />
            </Field>
            <Field label="Email">
              <Input name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" />
            </Field>
            <Field label="Password">
              <Input name="password" type="password" value={form.password} onChange={handleChange} autoComplete="new-password" />
            </Field>
            <Field label="Confirm Password">
              <Input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" />
            </Field>
            <Field label="Mobile Number">
              <Input name="mobile" type="tel" value={form.mobile} onChange={handleChange} autoComplete="tel" />
            </Field>
            <Field label="DOB (Date of Birth)">
              <Input name="dob" type="date" value={form.dob} onChange={handleChange} max={today} />
            </Field>
            <Field label="NIC / Passport number">
              <Input name="nic" value={form.nic} onChange={handleChange} maxLength={NIC_MAX_LENGTH} />
            </Field>
          </div>

          {errorMsg && (
            <p className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-bold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
              {errorMsg}
            </p>
          )}
          {successMsg && (
            <p className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-bold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
              {successMsg}
            </p>
          )}

          <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Link to="/" className="text-sm font-bold text-[#3D4461] hover:underline dark:text-white">
              Back to Login
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#3D4461] px-8 py-3 font-black text-white shadow-lg transition hover:bg-[#30364f] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <UserPlus size={18} />
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
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

function Input(props) {
  return <input {...props} required placeholder="Enter Text" className="field-input" />;
}
