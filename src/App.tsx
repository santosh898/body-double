import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import {
  ProtectedRoutes,
  PublicOnlyRoutes,
} from "./components/ProtectedRoutes";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";
import { Profile } from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-light dark:bg-dark text-dark dark:text-light">
        <Navigation />
        <Routes>
          {/* Public only routes - redirect to /profile if authenticated */}
          <Route element={<PublicOnlyRoutes />}>
            <Route path="/" element={<SignIn />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
          </Route>

          {/* Protected routes - redirect to /sign-in if not authenticated */}
          <Route element={<ProtectedRoutes />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}
