import DispatcherSidebar from "../Components/DispatcherSidebar";
import IncidentTable from "../Components/IncidentsTable";

export default function AllIncidents() {
    return (
        <div className="flex min-h-screen">
            <DispatcherSidebar />

            <div className="flex-1 p-6">
                <h1 className="text-xl font-bold mb-4">All Incidents</h1>

                <IncidentTable />
            </div>
        </div>
    );
}