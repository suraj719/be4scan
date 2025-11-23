import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { fetchCurrentUser } from "./store/slices/authSlice";
import HomePage from "./pages/Homepage";
import Login from "./pages/Login";
import Register from "./pages/Register";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { user, token, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Fetch user if token exists but user is not loaded
    if (token && !user && !loading) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token, user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { user, token, loading } = useAppSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (user && token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Fetch current user on app mount if token exists
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token]);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
