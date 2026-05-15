export default function SummaryCard({ title, value, tone = "default" }) {
  const toneClass =
    {
      default: "text-[#3D4461] dark:text-white",
      warning: "text-amber-700 dark:text-amber-300",
      danger: "text-rose-700 dark:text-rose-300",
      success: "text-emerald-700 dark:text-emerald-300",
    }[tone] || "text-[#3D4461] dark:text-white";

  return (
    <div className="flex min-h-32 flex-col justify-between rounded-lg border border-white/60 bg-white p-5 shadow-lg shadow-slate-200/40 transition-transform hover:-translate-y-0.5 dark:border-white/10 dark:bg-slate-900 dark:shadow-none sm:p-6">
      <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <p className={`text-4xl font-black tracking-tight sm:text-5xl ${toneClass}`}>{value}</p>
    </div>
  );
}
