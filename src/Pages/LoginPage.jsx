import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useApp } from "../Context/AppContextBase";
import { normalizeRole } from "../utils/roles";

export default function LoginPage() {
  const navigate = useNavigate();
  const { appConfig, authLoading, login, role, user } = useApp();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!authLoading && user && role) navigate(`/${normalizeRole(role)}`, { replace: true });
  }, [authLoading, navigate, role, user]);

  function handleChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const profile = await login(form.email.trim(), form.password);
      navigate(`/${normalizeRole(profile.role)}`, { replace: true });
    } catch (error) {
      setErrorMsg(error.code === "auth/invalid-credential" ? "Invalid email or password." : error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-[#DEDED8] text-slate-800 dark:bg-slate-950 dark:text-slate-100 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="flex min-h-[36vh] flex-col justify-between bg-[#3D4461] p-6 text-white sm:p-10 lg:min-h-screen">
        <div className="w-fit rounded-lg bg-white/10 px-4 py-2 text-sm font-black uppercase tracking-[0.18em]">
          PWA
        </div>
        <div className="max-w-xl py-12">
          <h1 className="text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
            {appConfig.brand.name}
          </h1>
          <p className="mt-5 max-w-md text-base font-semibold leading-7 text-slate-200">
            {appConfig.brand.tagline}
          </p>
        </div>
        <div className="grid gap-3 text-sm font-semibold text-slate-200 sm:grid-cols-2">
          <span>Emergency {appConfig.brand.emergencyPhone}</span>
          <span>Support {appConfig.brand.supportPhone}</span>
        </div>
      </section>

      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#5F675C] dark:text-slate-400">
              Secure access
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Login</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">
                Username
              </span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@example.com"
                autoComplete="email"
                required
                className="field-input"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">
                Password
              </span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                  className="field-input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {errorMsg && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#3D4461] px-6 py-3 font-black text-white shadow-lg transition hover:bg-[#30364f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogIn size={18} />
              {loading ? "Checking..." : "LOGIN"}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-3 text-sm font-bold sm:flex-row sm:items-center sm:justify-between">
            <Link to="/forgot-password" className="text-[#3D4461] hover:underline dark:text-slate-100">
              Forgot Password
            </Link>
            <span className="text-slate-600 dark:text-slate-400">
              Create a new account?{" "}
              <Link to="/register" className="text-[#3D4461] hover:underline dark:text-white">
                Sign up
              </Link>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
