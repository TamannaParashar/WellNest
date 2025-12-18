import { useUser } from "@clerk/clerk-react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn } = useUser();
  const location = useLocation();
  if (!isLoaded) return null;
  if (!isSignedIn) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return children;
}
