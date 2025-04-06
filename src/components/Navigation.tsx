import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Link } from "react-router-dom";

export function Navigation() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  return (
    <div className="navbar bg-base-100 sticky top-0 z-10 border-b">
      <div className="navbar-start">
        <Link
          to={isAuthenticated ? "/lobby" : "/"}
          className="btn btn-ghost text-xl"
        >
          Body Double
        </Link>
      </div>
      <div className="navbar-end">
        {isAuthenticated ? (
          <>
            <Link to="/lobby" className="btn btn-ghost">
              Lobby
            </Link>
            <Link to="/profile" className="btn btn-ghost">
              Profile
            </Link>
            <button
              className="btn btn-outline ml-2"
              onClick={() => void signOut()}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/sign-in" className="btn btn-ghost">
              Sign in
            </Link>
            <Link to="/sign-up" className="btn btn-primary ml-2">
              Sign up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
