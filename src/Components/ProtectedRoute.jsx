import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
    children,
    allowedRole,
    userRole,
}) {
    if (userRole !== allowedRole) {
        return <Navigate to="/" />;
    }

    return children;
}