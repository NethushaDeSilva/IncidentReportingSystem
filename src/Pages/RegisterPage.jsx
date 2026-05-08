import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createUserWithEmailAndPassword } from "firebase/auth";

import { doc, setDoc } from "firebase/firestore";

import { auth, db } from "../firebase";

export default function RegisterPage() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    dob: "",
    nic: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setErrorMsg("");
    setSuccessMsg("");

    // Password validation
    if (form.password !== form.confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // Create Firebase Authentication account
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          form.email,
          form.password
        );

      const user = userCredential.user;

      // Save additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName: form.fullName,
        email: form.email,
        mobile: form.mobile,
        dob: form.dob,
        nic: form.nic,
        role: "reporter", // Automatic role assignment
        createdAt: new Date(),
      });

      setSuccessMsg("Account created successfully!");

      // Redirect to reporter dashboard
      setTimeout(() => {
        navigate("/reporter");
      }, 1500);

    } catch (error) {

      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        setErrorMsg("Email is already registered");
      }
      else if (error.code === "auth/weak-password") {
        setErrorMsg("Password should be at least 6 characters");
      }
      else {
        setErrorMsg(error.message);
      }

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">

      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-10 border border-slate-100">

        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Register Account
          </h1>

          <p className="text-slate-500 mt-2">
            Join our incident reporting network
          </p>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-green-100 text-green-700">
            {successMsg}
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-100 text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >

          {/* Full Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Full Name
            </label>

            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 border"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 border"
              placeholder="john@example.com"
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Mobile Number
            </label>

            <input
              type="tel"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 border"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 border"
              placeholder="••••••••"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 border"
              placeholder="••••••••"
            />
          </div>

          {/* DOB */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Date of Birth
            </label>

            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 border"
            />
          </div>

          {/* NIC */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              NIC / Passport Number
            </label>

            <input
              type="text"
              name="nic"
              value={form.nic}
              onChange={handleChange}
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 border"
              placeholder="ABC123456"
            />
          </div>

          {/* Submit */}
          <div className="md:col-span-2 pt-4">

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                to="/"
                className="font-bold text-blue-600 hover:text-blue-700"
              >
                Log In
              </Link>
            </p>

          </div>

        </form>

      </div>
    </div>
  );
}