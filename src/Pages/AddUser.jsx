import { useState } from "react";
import { RotateCcw, UserPlus } from "lucide-react";
import { useApp } from "../Context/AppContextBase";
import { createManagedUser } from "../services/userService";
import { notifyUser } from "../utils/browserCapabilities";
import { ROLES } from "../utils/roles";
import AdminLayout from "./AdminLayout";

const EMPTY_FORM = {
  fullName: "",
  email: "",
  mobile: "",
  password: "",
  role: "reporter",
  dob: "",
  nic: "",
  status: "Active",
};

export default function AddUser() {
  const { appConfig } = useApp();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setErrorMsg("");

    try {
      await createManagedUser(form);
      setMessage("Registration Successful");
      setForm(EMPTY_FORM);
      await notifyUser(appConfig.brand.name, "User created successfully.");
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setForm(EMPTY_FORM);
    setErrorMsg("");
    setMessage("");
  }

  return (
    <AdminLayout>
      <header className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#5F675C] dark:text-slate-400">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">ADD USER</h1>
      </header>

      <form onSubmit={handleSubmit} className="max-w-4xl rounded-lg bg-white p-5 shadow-xl dark:bg-slate-900 sm:p-8">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Full Name">
            <Input name="fullName" value={form.fullName} onChange={handleChange} />
          </Field>
          <Field label="Email">
            <Input name="email" type="email" value={form.email} onChange={handleChange} />
          </Field>
          <Field label="Password">
            <Input name="password" type="password" value={form.password} onChange={handleChange} />
          </Field>
          <Field label="Mobile Number">
            <Input name="mobile" type="tel" value={form.mobile} onChange={handleChange} required={false} />
          </Field>
          <Field label="DOB (Date of Birth)">
            <Input name="dob" type="date" value={form.dob} onChange={handleChange} required={false} />
          </Field>
          <Field label="NIC / Passport number">
            <Input name="nic" value={form.nic} onChange={handleChange} required={false} />
          </Field>
          <Field label="Role">
            <select name="role" value={form.role} onChange={handleChange} className="field-input">
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role[0].toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select name="status" value={form.status} onChange={handleChange} className="field-input">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
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
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3D4461] px-6 py-3 font-black text-white shadow-lg hover:bg-[#30364f] disabled:opacity-60"
          >
            <UserPlus size={17} />
            {loading ? "Creating..." : "ADD USER"}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}

function Field({ children, label }) {
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
