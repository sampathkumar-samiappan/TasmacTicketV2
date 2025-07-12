import { Navigate, useLocation } from "react-router-dom";
import { roleAccessMap } from "./roleAccess";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const userData = JSON.parse(localStorage.getItem("userData"));

  if (!userData) {
    return <Navigate to="/" replace />;
  }

  const { user_type } = userData;
  const allowedPaths = roleAccessMap[user_type] || [];

  if (!allowedPaths.includes(location.pathname)) {
    // Redirect unauthorized access to a fallback page (e.g. 403)
    return <Navigate to="/403" replace />;

  }

  return children;
};

export default ProtectedRoute;
