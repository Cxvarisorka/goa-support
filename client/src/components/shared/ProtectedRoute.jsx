import { Navigate } from "react-router";

const ProtectedRoute = ({ children, canAccses, navigateTo }) => {

  return canAccses ? children : <Navigate to={navigateTo} />;
};

export default ProtectedRoute;
