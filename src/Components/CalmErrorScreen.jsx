import { Activity, AlertTriangle, HeartPulse, Home, RefreshCw, Thermometer } from "lucide-react";

function findNumericErrorCode(...values) {
  for (const value of values) {
    const text = String(value || "");
    const match = text.match(/\b([1-5]\d{2})\b/);
    if (match) return match[1];
  }
  return "";
}

function formatErrorCode(error, fallbackCode) {
  const directCode =
    error?.status ||
    error?.statusCode ||
    error?.response?.status ||
    error?.code ||
    error?.name ||
    fallbackCode;

  return (
    findNumericErrorCode(
      error?.status,
      error?.statusCode,
      error?.response?.status,
      error?.code,
      error?.message,
      fallbackCode
    ) ||
    String(directCode || "500").toUpperCase()
  );
}

function formatErrorMessage(error, fallbackMessage) {
  if (error?.message) return error.message;
  if (typeof error === "string") return error;
  return fallbackMessage || "Something went wrong. Please try again in a moment.";
}

export default function CalmErrorScreen({
  code,
  error,
  message,
  title = "Something needs attention",
}) {
  const displayCode = formatErrorCode(error, code);
  const displayMessage = formatErrorMessage(error, message);

  function handleRetry() {
    window.location.reload();
  }

  return (
    <main className="error-screen min-h-screen overflow-hidden bg-[#F4F6EF] px-4 py-8 text-slate-800 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-center gap-8 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="order-2 lg:order-1">
          <p className="text-sm font-bold uppercase text-[#4E7C6C] dark:text-emerald-300">
            Health LINK system notice
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight text-[#26324C] dark:text-white sm:text-6xl">
            {title}
          </h1>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <span className="error-code-pill inline-flex items-center rounded-lg border border-[#A7D7C5] bg-white/80 px-5 py-3 text-4xl font-semibold text-[#EF4B4B] shadow-sm dark:border-emerald-900/60 dark:bg-slate-900 sm:text-5xl">
              {displayCode}
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg bg-[#E7F6EF] px-4 py-3 text-sm font-bold text-[#345D52] dark:bg-emerald-950/40 dark:text-emerald-100">
              <HeartPulse size={18} />
              We caught the error safely
            </span>
          </div>
          <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-600 dark:text-slate-300">
            {displayMessage}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3D4461] px-6 py-3 font-black text-white shadow-lg transition hover:bg-[#30364f]"
            >
              <Home size={18} />
              Home
            </a>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 font-black text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <RefreshCw size={18} />
              Try again
            </button>
          </div>
        </section>

        <section className="error-illustration order-1 mx-auto w-full max-w-xl lg:order-2" aria-hidden="true">
          <div className="error-blob error-blob-green" />
          <div className="error-blob error-blob-blue" />

          <div className="error-device">
            <div className="error-device-screen">
              <div className="error-warning-triangle">
                <AlertTriangle size={88} />
              </div>
              <div className="error-device-code">{displayCode}</div>
              <div className="error-pulse-line">
                <Activity size={64} />
              </div>
            </div>
            <div className="error-device-stand" />
          </div>

          <div className="error-floating-icon error-floating-icon-left">
            <Thermometer size={42} />
          </div>
          <div className="error-floating-icon error-floating-icon-right">
            <HeartPulse size={46} />
          </div>
        </section>
      </div>
    </main>
  );
}
