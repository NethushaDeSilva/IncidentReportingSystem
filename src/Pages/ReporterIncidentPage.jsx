import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LocateFixed, RotateCcw, Send } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { useApp } from "../Context/AppContextBase";
import { useDateTimeLimits } from "../hooks/useDateTimeLimits";
import { createIncident } from "../services/incidentService";
import { getCurrentPosition, notifyUser } from "../utils/browserCapabilities";
import { clampDateTimeInputToNow, isFutureDateTimeInput } from "../utils/dateTimeLimits";
import { optimizeCloudinaryImage } from "../utils/images";
import ReporterLayout from "./ReporterLayout";

const EMPTY_FORM = {
  type: "",
  priority: "Medium",
  name: "",
  description: "",
  location: "",
  dateTime: "",
  contactNumber: "",
  emailAddress: "",
};

export default function ReportIncidentPage() {
  const navigate = useNavigate();
  const { appConfig, profile, user } = useApp();
  const { currentDateTime } = useDateTimeLimits();
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    name: profile?.fullName || "",
    emailAddress: profile?.email || user?.email || "",
    contactNumber: profile?.mobile || "",
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [geoPoint, setGeoPoint] = useState(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const canSubmit = useMemo(
    () => form.type && form.name && form.description && form.location && form.dateTime,
    [form]
  );

  function handleChange(event) {
    const value =
      event.target.type === "datetime-local"
        ? clampDateTimeInputToNow(event.target.value)
        : event.target.value;
    setForm((prev) => ({ ...prev, [event.target.name]: value }));
  }

  function handleImageChange(event) {
    const files = Array.from(event.target.files || []).slice(0, 5);
    setImageFiles(files);
    previews.forEach((preview) => URL.revokeObjectURL(preview));
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  }

  async function uploadImage(file) {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "tqqspwob");
    data.append("cloud_name", "dgocoju4l");

    const response = await fetch("https://api.cloudinary.com/v1_1/dgocoju4l/image/upload", {
      method: "POST",
      body: data,
    });
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.error?.message || "Image upload failed");
    }

    return optimizeCloudinaryImage(json.secure_url || "", 1200);
  }

  async function handleLocate() {
    setLocating(true);
    setErrorMsg("");
    const position = await getCurrentPosition();
    setLocating(false);

    if (position.error) {
      setErrorMsg(position.error);
      return;
    }

    setGeoPoint(position);
    setForm((prev) => ({
      ...prev,
      location: prev.location || `${position.latitude.toFixed(5)}, ${position.longitude.toFixed(5)}`,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      if (!user) throw new Error("You must be logged in to report an incident.");
      if (isFutureDateTimeInput(form.dateTime)) {
        throw new Error("Incident date and time cannot be in the future.");
      }

      const uploadedUrls = [];
      for (const file of imageFiles) {
        uploadedUrls.push(await uploadImage(file));
      }

      const incidentDate = new Date(form.dateTime);
      await createIncident({
        type: form.type,
        priority: form.priority,
        name: form.name,
        description: form.description,
        location: form.location,
        dateTime: Number.isNaN(incidentDate.getTime()) ? form.dateTime : Timestamp.fromDate(incidentDate),
        contactNumber: form.contactNumber,
        emailAddress: form.emailAddress || user.email || "",
        imageUrls: uploadedUrls,
        imageUrl: uploadedUrls[0] || "",
        locationGeo: geoPoint,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        reporterId: user.uid,
        reporterEmail: user.email,
      });

      setSuccessMsg("Incident submitted successfully.");
      await notifyUser(appConfig.brand.name, "Incident submitted successfully.");
      navigate("/reporter/my-reports", { replace: true });
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setForm(EMPTY_FORM);
    setImageFiles([]);
    previews.forEach((preview) => URL.revokeObjectURL(preview));
    setPreviews([]);
    setGeoPoint(null);
    setErrorMsg("");
    setSuccessMsg("");
  }

  return (
    <ReporterLayout>
      <header className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#5F675C] dark:text-slate-400">
          Reporter
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">New Incident</h1>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="rounded-lg bg-white p-5 shadow-xl dark:bg-slate-900 sm:p-8">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Incident type">
              <select name="type" value={form.type} onChange={handleChange} required className="field-input">
                <option value="" disabled>
                  Select type
                </option>
                {appConfig.incidentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Priority">
              <select name="priority" value={form.priority} onChange={handleChange} required className="field-input">
                {appConfig.priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Name">
              <Input name="name" value={form.name} onChange={handleChange} />
            </Field>

            <Field label="Date and time">
              <Input
                name="dateTime"
                type="datetime-local"
                value={form.dateTime}
                onChange={handleChange}
                max={currentDateTime}
              />
            </Field>

            <Field label="Location">
              <div className="flex gap-2">
                <Input name="location" value={form.location} onChange={handleChange} />
                <button
                  type="button"
                  onClick={handleLocate}
                  disabled={locating}
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#3D4461] text-white transition hover:bg-[#30364f] disabled:opacity-60"
                  aria-label="Use current location"
                  title="Use current location"
                >
                  <LocateFixed size={18} />
                </button>
              </div>
            </Field>

            <Field label="Contact number">
              <Input name="contactNumber" type="tel" value={form.contactNumber} onChange={handleChange} required={false} />
            </Field>

            <Field label="Email">
              <Input name="emailAddress" type="email" value={form.emailAddress} onChange={handleChange} required={false} />
            </Field>

            <Field label="Description" wide>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter Text"
                required
                rows={7}
                className="field-input resize-none"
              />
            </Field>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-lg bg-white p-5 shadow-xl dark:bg-slate-900">
            <label className="block">
              <span className="mb-3 block text-sm font-black text-slate-700 dark:text-slate-200">
                Upload 5 Image
              </span>
              <div className="grid min-h-48 place-items-center rounded-lg border border-dashed border-[#7E8674]/70 bg-[#f0f2f0] p-4 text-center font-black text-slate-500 dark:border-white/20 dark:bg-slate-800 dark:text-slate-300">
                {previews.length > 0 ? (
                  <div className="grid w-full grid-cols-2 gap-2">
                    {previews.map((preview) => (
                      <img
                        key={preview}
                        src={preview}
                        alt="Incident preview"
                        width="320"
                        height="180"
                        decoding="async"
                        className="h-24 w-full rounded-lg object-cover"
                      />
                    ))}
                  </div>
                ) : (
                  <span>Select images</span>
                )}
              </div>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} className="sr-only" />
            </label>
          </section>

          {geoPoint && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
              Location tagged: {geoPoint.latitude.toFixed(5)}, {geoPoint.longitude.toFixed(5)}
            </div>
          )}

          {errorMsg && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
              {successMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="submit"
              disabled={submitting || !canSubmit}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3D4461] px-5 py-3 font-black text-white shadow-lg transition hover:bg-[#30364f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={17} />
              Submit
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-600 px-5 py-3 font-black text-white shadow-lg transition hover:bg-slate-700"
            >
              <RotateCcw size={17} />
              Reset
            </button>
          </div>
        </aside>
      </form>
    </ReporterLayout>
  );
}

function Field({ label, children, wide = false }) {
  return (
    <label className={wide ? "md:col-span-2" : ""}>
      <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      {children}
    </label>
  );
}

function Input({ required = true, ...props }) {
  return <input {...props} required={required} placeholder="Enter Text" className="field-input" />;
}
