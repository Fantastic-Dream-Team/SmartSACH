import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { DashboardPage } from "../pages/DashboardPage";
import { LoginPage } from "../pages/LoginPage";
import { PlaceholderPrivatePage } from "../pages/PlaceholderPrivatePage";
import { PublicHomePage } from "../pages/PublicHomePage";
import { RegisterBridgePage } from "../pages/RegisterBridgePage";

function ProtectedRoute({ children }) {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <section className="loading-screen">
        <p>Cargando sesion...</p>
      </section>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function GuestRoute({ children }) {
  const { isAuthenticated, isBootstrapping } = useAuth();
  if (isBootstrapping) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

export function AppRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <GuestRoute>
            <Navigate to="/login" replace />
          </GuestRoute>
        }
      />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route path="/public-home" element={<PublicHomePage />} />
      <Route path="/registro" element={<RegisterBridgePage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <PlaceholderPrivatePage title="Perfil" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pagos"
        element={
          <ProtectedRoute>
            <PlaceholderPrivatePage title="Pagos" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nosotros"
        element={
          <ProtectedRoute>
            <PlaceholderPrivatePage title="Nosotros" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ayuda"
        element={
          <ProtectedRoute>
            <PlaceholderPrivatePage title="Ayuda" />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
