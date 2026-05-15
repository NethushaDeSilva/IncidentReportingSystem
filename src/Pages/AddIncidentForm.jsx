import { useState } from "react";
import { db, auth } from "../firebase";

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

  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(e) {
    if (e.target.name === "image") {
      setImageFile(e.target.files[0]);
    } else {
      setForm((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
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
          body: data,
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

      // Get logged-in user
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      let finalImageUrl = "";

      if (imageFile) {
        const uploadedUrl = await uploadImage();

        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      }

      const incidentId = "INC" + Date.now();

      await addDoc(collection(db, "Incidents"), {
        incidentId: incidentId,

        type: form.type || "",
        location: form.location || "",
        status: "notAssigned",

        assigned: "",

        description: form.description || "",

        contactNumber: form.contactNumber || "",

        emailAddress: form.emailAddress || "",

        imageUrl: finalImageUrl,

        date: new Date().toLocaleDateString(),

        time: new Date().toLocaleTimeString(),

        createdAt: Timestamp.now(),

        // IMPORTANT RBAC FIELDS
        reporterId: currentUser.uid,

        reporterEmail: currentUser.email,
      });

      setSuccessMsg("Incident reported successfully!");

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
      console.error(error);

      setErrorMsg(error.message || "Failed to submit report.");

    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">

      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">

        <div className="bg-blue-600 px-8 py-10 text-white">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Report Incident
          </h2>

          <p className="mt-2 text-blue-100 opacity-90">
            Please provide accurate details for rapid response.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl">
              ✅ {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl">
              ⚠️ {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Incident Type
              </label>

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 border"
              >
                <option value="" disabled>
                  Select type
                </option>

                {INCIDENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Location
              </label>

              <input
                type="text"
                name="location"
                required
                value={form.location}
                onChange={handleChange}
                placeholder="Street, Building, Floor"
                className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 border"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Contact Number
              </label>

              <input
                type="tel"
                name="contactNumber"
                value={form.contactNumber}
                onChange={handleChange}
                placeholder="123-456-7890"
                className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 border"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                name="emailAddress"
                value={form.emailAddress}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 border"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Briefly describe what happened..."
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 border resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Evidence / Photo
            </label>

            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full"
            />

            <p className="text-xs text-slate-500 mt-2">
              {imageFile
                ? `Selected: ${imageFile.name}`
                : "PNG, JPG up to 10MB"}
            </p>
          </div>

          <div className="flex gap-4 pt-4">

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl"
            >
              {submitting
                ? "Submitting Report..."
                : "Submit Report"}
            </button>

            <button
              type="reset"
              onClick={() => {
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
              }}
              className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl"
            >
              Reset
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}
