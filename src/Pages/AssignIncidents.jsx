import DispatcherSidebar from "../Components/DispatcherSidebar";

export default function AssignIncidents() {
    return (
        <div className="flex min-h-screen">
            <DispatcherSidebar />

            <div className="flex-1 p-6">
                <h1 className="text-xl font-bold mb-4">Assign Incidents</h1>

                <table className="w-full bg-white border text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th>ID</th>
                            <th>Type</th>
                            <th>Date</th>
                            <th>Location</th>
                            <th>Priority</th>
                            <th>Assign Reporter</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <td>INC001</td>
                            <td>Cardiac Arrest</td>
                            <td>10/04/2026</td>
                            <td>Colombo</td>
                            <td>High</td>
                            <td>
                                <select className="border p-1">
                                    <option>Select</option>
                                    <option>Unit 1</option>
                                    <option>Unit 2</option>
                                </select>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}