import { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import SummaryCard from "../Components/SummaryCard";
import IncidentsTable from "../Components/IncidentsTable";

export default function ReporterDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Reusing your component but it will need styling polish later */}
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <header className="flex flex-col md:flex-row md:items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome, User</h1>
              <p className="text-slate-500 mt-1 font-medium">Here's a summary of your reported incidents.</p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-3">
              <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 text-sm">
                New Incident
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <SummaryCard title="Total Incidents" value="3" color="blue" />
            <SummaryCard title="Pending Incidents" value="1" color="amber" />
            <SummaryCard title="Resolved Incidents" value="2" color="emerald" />
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Recent Entries</h2>
              <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</button>
            </div>
            <div className="p-4">
              <IncidentsTable />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
