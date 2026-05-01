import { useState } from "react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-10 border border-slate-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Forgot Password</h1>
          <p className="text-slate-500 mt-2">Reset your security credentials</p>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
            <input type="password" placeholder="••••••••" className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 border focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
            <input type="password" placeholder="••••••••" className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 border focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Mobile Number (xxxxxxx94)</label>
            <input type="tel" placeholder="Enter linked mobile number" className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 border focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">One-Time Code (OTP)</label>
            <div className="flex gap-2">
              <input type="text" className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 border text-center font-bold tracking-widest outline-none focus:ring-2 focus:ring-blue-500" placeholder="000000" />
              <button type="button" className="px-4 bg-slate-100 rounded-xl text-blue-600 font-bold text-xs hover:bg-slate-200 transition-colors">Resend</button>
            </div>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95">
            Reset Password
          </button>

          <p className="text-center">
            <a href="/login" className="text-sm font-bold text-slate-400 hover:text-slate-600">Back to Login</a>
          </p>
        </form>
      </div>
    </div>
  );
}
