import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useConvexAuth } from "convex/react";
import { LoadingSpinner } from "./LoadingSpinner";

export function ProtectedRoutes() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/sign-in" state={{ from: location }} replace />
  );
}

export function PublicOnlyRoutes() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return !isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/profile" state={{ from: location }} replace />
  );
}
