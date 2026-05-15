import { useState } from "react";
import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { useApp } from "../Context/AppContextBase";
import { notifyUser } from "../utils/browserCapabilities";

export default function ForgotPasswordPage() {
  const { appConfig, resetPassword } = useApp();
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(event) {
    event.preventDefault();
    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      await resetPassword(email.trim());
      setSuccess(true);
      await notifyUser(appConfig.brand.name, "Password reset email sent.");
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#DEDED8] px-4 py-8 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <div className="w-full max-w-xl">
        <Link
          to="/"
          className="mb-8 inline-flex rounded-lg bg-[#3D4461] px-5 py-3 font-black text-white shadow-lg"
        >
          {appConfig.brand.name}
        </Link>

        <section className="rounded-lg bg-white p-6 shadow-xl dark:bg-slate-900 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#5F675C] dark:text-slate-400">
            Account recovery
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Forgot Password</h1>

          <form onSubmit={handleReset} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email@example.com"
                required
                className="field-input"
              />
            </label>

            {errorMsg && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
                {errorMsg}
              </p>
            )}
            {success && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
                Password reset email sent successfully.
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#3D4461] px-8 py-3 font-black text-white shadow-lg transition hover:bg-[#30364f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MailCheck size={18} />
              {loading ? "Sending..." : "Reset Password"}
            </button>
          </form>

          <Link to="/" className="mt-6 inline-flex text-sm font-bold text-[#3D4461] hover:underline dark:text-white">
            Back to Login
          </Link>
        </section>
      </div>
    </div>
  );
}
