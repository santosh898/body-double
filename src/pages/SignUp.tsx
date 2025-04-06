import { useState } from "react";
import { AuthForm } from "../components/AuthForm";

export function SignUp() {
  const [mode, setMode] = useState<"signIn" | "signUp">("signUp");

  return (
    <div className="container mx-auto px-4 py-8">
      <AuthForm
        mode={mode}
        onToggleMode={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
      />
    </div>
  );
}
