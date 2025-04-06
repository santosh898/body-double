import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

interface AuthFormProps {
  mode: "signIn" | "signUp";
  onToggleMode: () => void;
}

export function AuthForm({ mode, onToggleMode }: AuthFormProps) {
  const { signIn } = useAuthActions();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8 w-96 mx-auto">
      <h2 className="text-2xl font-bold text-center">
        {mode === "signIn" ? "Sign In" : "Sign Up"}
      </h2>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("flow", mode);
          void signIn("password", formData).catch((error) => {
            setError(error.message);
          });
        }}
      >
        <input
          className="bg-light dark:bg-dark text-dark dark:text-light rounded-md p-2 border-2 border-slate-200 dark:border-slate-800"
          type="email"
          name="email"
          placeholder="Email"
          required
        />
        <input
          className="bg-light dark:bg-dark text-dark dark:text-light rounded-md p-2 border-2 border-slate-200 dark:border-slate-800"
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        <button
          className="bg-dark dark:bg-light text-light dark:text-dark rounded-md p-2 font-medium"
          type="submit"
        >
          {mode === "signIn" ? "Sign In" : "Sign Up"}
        </button>
        <div className="flex flex-row gap-2 justify-center text-sm">
          <span>
            {mode === "signIn"
              ? "Don't have an account?"
              : "Already have an account?"}
          </span>
          <button
            type="button"
            className="text-dark dark:text-light underline hover:no-underline"
            onClick={onToggleMode}
          >
            {mode === "signIn" ? "Sign up" : "Sign in"}
          </button>
        </div>
        {error && (
          <div className="bg-red-500/20 border-2 border-red-500/50 rounded-md p-2">
            <p className="text-dark dark:text-light font-mono text-xs">
              Error: {error}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
