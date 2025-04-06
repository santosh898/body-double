import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Link } from "react-router-dom";

export function Navigation() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  return (
    <header className="sticky top-0 z-10 bg-light dark:bg-dark p-4 border-b-2 border-slate-200 dark:border-slate-800">
      <nav className="flex justify-between items-center max-w-6xl mx-auto">
        <Link
          to={isAuthenticated ? "/lobby" : "/"}
          className="text-xl font-bold"
        >
          Body Double
        </Link>
        <div className="flex gap-4 items-center">
          {isAuthenticated ? (
            <>
              <Link
                to="/lobby"
                className="text-dark dark:text-light hover:underline"
              >
                Lobby
              </Link>
              <Link
                to="/profile"
                className="text-dark dark:text-light hover:underline"
              >
                Profile
              </Link>
              <button
                className="bg-slate-200 dark:bg-slate-800 text-dark dark:text-light rounded-md px-3 py-1"
                onClick={() => void signOut()}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/sign-in"
                className="text-dark dark:text-light hover:underline"
              >
                Sign in
              </Link>
              <Link
                to="/sign-up"
                className="bg-dark dark:bg-light text-light dark:text-dark rounded-md px-3 py-1"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
