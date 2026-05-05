import { Link } from "react-router-dom";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-10 border border-slate-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Register Account</h1>
          <p className="text-slate-500 mt-2">Join our incident reporting network</p>
        </div>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
            <input type="text" className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 border" placeholder="John Doe" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <input type="email" className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 border" placeholder="john@example.com" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Mobile Number</label>
            <input type="tel" className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 border" placeholder="+1 (555) 000-0000" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <input type="password" className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 border" placeholder="••••••••" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
            <input type="password" className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 border" placeholder="••••••••" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth</label>
            <input type="date" className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 border" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">NIC / Passport Number</label>
            <input type="text" className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 border" placeholder="ABC123456" />
          </div>

          <div className="md:col-span-2 pt-4">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95">
              Create Account
            </button>
            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account? <Link to="/" className="font-bold text-blue-600 hover:text-blue-700">Log In</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
