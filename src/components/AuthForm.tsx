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
    <div className="card bg-base-100 shadow-xl w-full">
      <div className="card-body gap-6">
        <h2 className="card-title justify-center text-2xl">
          {mode === "signIn" ? "Sign In" : "Sign Up"}
        </h2>
        <form
          className="form-control flex flex-col gap-4"
          onSubmit={(e) => void handleSubmit(e)}
        >
          <div className="form-control mx-24">
            <input
              className="input input-bordered w-full"
              type="email"
              name="email"
              placeholder="Email"
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-control mx-24">
            <input
              className="input input-bordered w-full"
              type="password"
              name="password"
              placeholder="Password"
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-control mt-2 self-center">
            <button
              className="btn btn-primary w-full"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <span className="loading loading-spinner loading-sm"></span>
                  <span className="ml-2">
                    {mode === "signIn"
                      ? "Signing in..."
                      : "Creating account..."}
                  </span>
                </div>
              ) : mode === "signIn" ? (
                "Sign In"
              ) : (
                "Sign Up"
              )}
            </button>
          </div>
          <div className="text-center">
            <span className="text-sm opacity-70">
              {mode === "signIn"
                ? "Don't have an account?"
                : "Already have an account?"}
            </span>
            <button
              type="button"
              className="btn btn-link btn-sm"
              onClick={onToggleMode}
            >
              {mode === "signIn" ? "Sign up" : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
