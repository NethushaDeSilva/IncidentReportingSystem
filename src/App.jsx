import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { useApp } from "./Context/AppContextBase";
import { normalizeRole } from "./utils/roles";

const LoginPage = lazy(() => import("./Pages/LoginPage"));
const RegisterPage = lazy(() => import("./Pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./Pages/ForgotPasswordPage"));

const AdminDashboard = lazy(() => import("./Pages/AdminDashboard"));
const ManageUsers = lazy(() => import("./Pages/ManageUsers"));
const ManageIncidents = lazy(() => import("./Pages/ManageIncidents"));
const AddUser = lazy(() => import("./Pages/AddUser"));
const AdminReports = lazy(() => import("./Pages/AdminReports"));
const SettingsPage = lazy(() => import("./Pages/SettingsPage"));

const DispatcherDashboard = lazy(() => import("./Pages/DispatcherDashboard"));
const AssignIncidents = lazy(() => import("./Pages/AssignIncidents"));
const AllIncidents = lazy(() => import("./Pages/AllIncidents"));
const DispatcherReports = lazy(() => import("./Pages/DispatcherReports"));

const ReporterDashboard = lazy(() => import("./Pages/ReporterDashboard"));
const ReportIncidentPage = lazy(() => import("./Pages/ReporterIncidentPage"));
const MyReportsPage = lazy(() => import("./Pages/MyReportsPage"));
const ReporterIncidentDetails = lazy(() => import("./Pages/ReporterIncidentDetails"));
const ReporterProfilePage = lazy(() => import("./Pages/ReporterProfilePage"));
const ReporterSupportPage = lazy(() => import("./Pages/ReporterSupportPage"));

const IncidentDetailsPage = lazy(() => import("./Pages/IncidentDetailsPage"));
const ParamedicDashboard = lazy(() => import("./Pages/ParamedicDashboard"));
const CalmErrorScreen = lazy(() => import("./Components/CalmErrorScreen"));

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route path="/reporter" element={<RoleRoute allowedRole="reporter"><ReporterDashboard /></RoleRoute>} />
        <Route path="/reporter/report" element={<RoleRoute allowedRole="reporter"><ReportIncidentPage /></RoleRoute>} />
        <Route path="/reporter/my-reports" element={<RoleRoute allowedRole="reporter"><MyReportsPage /></RoleRoute>} />
        <Route path="/reporter/my-reports/:incidentId" element={<RoleRoute allowedRole="reporter"><ReporterIncidentDetails /></RoleRoute>} />
        <Route path="/reporter/profile" element={<RoleRoute allowedRole="reporter"><ReporterProfilePage /></RoleRoute>} />
        <Route path="/reporter/support" element={<RoleRoute allowedRole="reporter"><ReporterSupportPage /></RoleRoute>} />

        <Route path="/admin" element={<RoleRoute allowedRole="admin"><AdminDashboard /></RoleRoute>} />
        <Route path="/admin/users" element={<RoleRoute allowedRole="admin"><ManageUsers /></RoleRoute>} />
        <Route path="/admin/incidents" element={<RoleRoute allowedRole="admin"><ManageIncidents /></RoleRoute>} />
        <Route path="/admin/incidents/:incidentId" element={<RoleRoute allowedRole="admin"><IncidentDetailsPage role="admin" /></RoleRoute>} />
        <Route path="/admin/add-user" element={<RoleRoute allowedRole="admin"><AddUser /></RoleRoute>} />
        <Route path="/admin/reports" element={<RoleRoute allowedRole="admin"><AdminReports /></RoleRoute>} />
        <Route path="/admin/settings" element={<RoleRoute allowedRole="admin"><SettingsPage role="admin" /></RoleRoute>} />

        <Route path="/dispatcher" element={<RoleRoute allowedRole="dispatcher"><DispatcherDashboard /></RoleRoute>} />
        <Route path="/dispatcher/assign" element={<RoleRoute allowedRole="dispatcher"><AssignIncidents /></RoleRoute>} />
        <Route path="/dispatcher/all" element={<RoleRoute allowedRole="dispatcher"><AllIncidents /></RoleRoute>} />
        <Route path="/dispatcher/incidents/:incidentId" element={<RoleRoute allowedRole="dispatcher"><IncidentDetailsPage role="dispatcher" /></RoleRoute>} />
        <Route path="/dispatcher/reports" element={<RoleRoute allowedRole="dispatcher"><DispatcherReports /></RoleRoute>} />

        <Route path="/paramedic" element={<RoleRoute allowedRole="paramedic"><ParamedicDashboard /></RoleRoute>} />
        <Route
          path="*"
          element={
            <CalmErrorScreen
              code="404"
              title="This page took a wrong turn"
              message="The page you are looking for is not available, or the link may have changed."
            />
          }
        />
      </Routes>
    </Suspense>
  );
}

function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#DEDED8] font-black text-[#3D4461] dark:bg-slate-950 dark:text-white">
      Loading Health LINK...
    </div>
  );
}

function RoleRoute({ allowedRole, children }) {
  const { authLoading, role, user } = useApp();

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!user) return <Navigate to="/" replace />;
  const nextRole = normalizeRole(role);
  if (nextRole !== allowedRole) return <Navigate to={nextRole ? `/${nextRole}` : "/"} replace />;
  return children;
}
