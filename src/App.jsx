// import TestFirebase from "./Pages/TestFirebase";
// import AdminDashboard from "./Pages/AdminDashboard";
// import AddIncidentForm from "./Pages/AddIncidentForm";

// // export default function App() {
// //   return <AdminDashboard />;
// // }

// // export default function App() {
// //   return <TestFirebase />;
// // }

// export default function App() {
//   return <AddIncidentForm />;
// }

import { Routes, Route } from "react-router-dom";

import AddIncidentForm from "./Pages/AddIncidentForm";
import AdminDashboard from "./Pages/AdminDashboard";
import ReporterDashboard from "./Pages/ReporterDashboard";
import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import ForgotPasswordPage from "./Pages/ForgotPasswordPage";
// import DispatcherDashboard from "./Pages/DispatcherDashboard";
import ManageUsers from "./Pages/ManageUsers";
import AddUser from "./Pages/AddUser";
import DispatcherDashboard from "./Pages/DispatcherDashboard";
import AssignIncidents from "./Pages/AssignIncidents";
import AllIncidents from "./Pages/AllIncidents";
import ProtectedRoute from "./Components/ProtectedRoute";

export default function App() {
  const role = "admin";
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/report" element={<AddIncidentForm />} />
      <Route path="/reporter" element={<ReporterDashboard />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      {/* <Route path="/dispatcher" element={<DispatcherDashboard />} /> */}
      <Route path="/admin/users" element={<ManageUsers />} />
      <Route path="/admin/add-user" element={<AddUser />} />
      <Route path="/dispatcher" element={<DispatcherDashboard />} />
      <Route path="/dispatcher/assign" element={<AssignIncidents />} />
      <Route path="/dispatcher/all" element={<AllIncidents />} />
      <Route path="/admin" element={<ProtectedRoute allowedRole="admin" userRole={role}>
        <AdminDashboard />
      </ProtectedRoute>
      }
      />

    </Routes>
  );
}