import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

interface AuthFormProps {
  mode: "signIn" | "signUp";
  onToggleMode: () => void;
}

export function AuthForm({ mode, onToggleMode }: AuthFormProps) {
  const { signIn } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    formData.set("flow", mode);

    try {
      await signIn("password", formData);
      toast.success(
        mode === "signIn"
          ? "Signed in successfully!"
          : "Account created successfully!",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Authentication failed",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-96 mx-auto">
      <h2 className="text-2xl font-bold text-center">
        {mode === "signIn" ? "Sign In" : "Sign Up"}
      </h2>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => void handleSubmit(e)}
      >
        <input
          className="bg-light dark:bg-dark text-dark dark:text-light rounded-md p-2 border-2 border-slate-200 dark:border-slate-800"
          type="email"
          name="email"
          placeholder="Email"
          required
          disabled={isLoading}
        />
        <input
          className="bg-light dark:bg-dark text-dark dark:text-light rounded-md p-2 border-2 border-slate-200 dark:border-slate-800"
          type="password"
          name="password"
          placeholder="Password"
          required
          disabled={isLoading}
        />
        <button
          className="bg-dark dark:bg-light text-light dark:text-dark rounded-md p-2 font-medium disabled:opacity-50"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
              <span className="ml-2">
                {mode === "signIn" ? "Signing in..." : "Creating account..."}
              </span>
            </div>
          ) : mode === "signIn" ? (
            "Sign In"
          ) : (
            "Sign Up"
          )}
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
      </form>
    </div>
  );
}
