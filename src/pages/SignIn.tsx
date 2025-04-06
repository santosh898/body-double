import { useState } from "react";
import { AuthForm } from "../components/AuthForm";

export function SignIn() {
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");

  return (
    <div className="min-h-screen hero bg-base-200 px-4">
      <div className="hero-content w-full max-w-3xl p-0">
        <AuthForm
          mode={mode}
          onToggleMode={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
        />
      </div>
    </div>
  );
}
