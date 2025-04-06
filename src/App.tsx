import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import {
  ProtectedRoutes,
  PublicOnlyRoutes,
} from "./components/ProtectedRoutes";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";
import { Profile } from "./pages/Profile";
import Lobby from "./pages/Lobby";
import Room from "./pages/Room";
import { Toaster } from "sonner";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-light dark:bg-dark text-dark dark:text-light">
        <Toaster
          theme="system"
          position="bottom-right"
          toastOptions={{
            duration: 1000,
          }}
        />
        <Navigation />
        <Routes>
          {/* Public only routes - redirect to /lobby if authenticated */}
          <Route element={<PublicOnlyRoutes redirectTo="/lobby" />}>
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
          </Route>

          {/* Protected routes - redirect to /sign-in if not authenticated */}
          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<Lobby />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/room" element={<Room />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}
