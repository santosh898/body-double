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

interface PublicOnlyRoutesProps {
  redirectTo?: string;
}

export function PublicOnlyRoutes({
  redirectTo = "/profile",
}: PublicOnlyRoutesProps) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return !isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to={redirectTo} state={{ from: location }} replace />
  );
}
