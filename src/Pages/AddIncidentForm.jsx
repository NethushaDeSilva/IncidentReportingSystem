import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

const INCIDENT_TYPES = [
  "Fire",
  "Medical Emergency",
  "Theft",
  "Vandalism",
  "Traffic Accident",
  "Natural Disaster",
  "Other",
];

const STATUS_OPTIONS = ["Open", "In Progress", "Resolved", "Closed"];

export default function AddIncidentForm() {
  const [form, setForm] = useState({
    type: "",
    location: "",
    status: "Open",
    assigned: "",
    description: "",
    contactNumber: "",
    emailAddress: "",
  });

  const [imageFile, setImageFile] = useState(null); // Store the actual file object
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Cloudinary Config - YOU NEED TO FILL THESE FROM YOUR CLOUDINARY DASHBOARD
  const CLOUDINARY_CLOUD_NAME = "YOUR_CLOUD_NAME";
  const CLOUDINARY_UPLOAD_PRESET = "YOUR_UNSIGNED_PRESET";

  function handleChange(e) {
    if (e.target.name === "image") {
      setImageFile(e.target.files[0]);
    } else {
      setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  }

  async function uploadImage() {
    if (!imageFile) return null;

    const data = new FormData();
    data.append("file", imageFile);
    data.append("upload_preset", "tqqspwob");
    data.append("cloud_name", "dgocoju4l");

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dgocoju4l/image/upload`,
        {
          method: "POST",
          body: data, // Fixed: Use the instance 'data', not the class 'FormData'
        }
      );
      const resData = await response.json();
      return resData.secure_url;
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      throw new Error("Image upload failed");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      let finalImageUrl = "";
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) finalImageUrl = uploadedUrl;
      }

      const incidentId = "INC" + Date.now();

      const docRef = await addDoc(collection(db, "Incidents"), {
        incidentId: incidentId,
        type: form.type || "",
        location: form.location || "",
        status: "Pending", // Default for new reports
        description: form.description || "",
        contactNumber: form.contactNumber || "",
        emailAddress: form.emailAddress || "",
        imageUrl: finalImageUrl,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        createdAt: Timestamp.now(),
      });

      setSuccessMsg(`Incident reported successfully! ID: ${docRef.id}`);
      setForm({
        type: "",
        location: "",
        status: "Open",
        assigned: "",
        description: "",
        contactNumber: "",
        emailAddress: "",
      });
      setImageFile(null);
      e.target.reset();

    } catch (error) {
      setErrorMsg(error.message || "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
        <div className="bg-blue-600 px-8 py-10 text-white">
          <h2 className="text-3xl font-extrabold tracking-tight">Report Incident</h2>
          <p className="mt-2 text-blue-100 opacity-90">Please provide accurate details for rapid response.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
              <p className="font-medium flex items-center">✅ {successMsg}</p>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
              <p className="font-medium flex items-center">⚠️ {errorMsg}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Incident Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 focus:border-blue-500 focus:ring-blue-500 transition-all outline-none border"
              >
                <option value="" disabled>Select type</option>
                {INCIDENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
              <input
                type="text"
                name="location"
                required
                value={form.location}
                onChange={handleChange}
                placeholder="Street, Building, Floor"
                className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 focus:border-blue-500 focus:ring-blue-500 transition-all outline-none border"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Number</label>
              <input
                type="tel"
                name="contactNumber"
                value={form.contactNumber}
                onChange={handleChange}
                placeholder="123-456-7890"
                className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 focus:border-blue-500 focus:ring-blue-500 transition-all outline-none border"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                name="emailAddress"
                value={form.emailAddress}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 focus:border-blue-500 focus:ring-blue-500 transition-all outline-none border"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Briefly describe what happened..."
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 focus:border-blue-500 focus:ring-blue-500 transition-all outline-none border resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Evidence / Photo</label>
            <div className="relative border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl p-6 hover:border-blue-400 transition-colors group text-center">
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-slate-400 group-hover:text-blue-500 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-sm text-slate-600">
                  <span className="text-blue-600 font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500">{imageFile ? `Selected: ${imageFile.name}` : "PNG, JPG up to 10MB"}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {submitting ? "Submitting Report..." : "Submit Report"}
            </button>
            <button
              type="reset"
              onClick={() => { setForm({ type: "", location: "", status: "Open", assigned: "", description: "", contactNumber: "", emailAddress: "" }); setImageFile(null); }}
              className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

