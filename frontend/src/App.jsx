import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { hasRole, ROLES } from './utils/rbac';
import Login from './pages/Login';
import Layout from './components/Layout';
import Offers from './pages/Offers';
import Requests from './pages/Requests';
import Matches from './pages/Matches';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import Users from './pages/Users';
import AuditLogs from './pages/AuditLogs';
import Reports from './pages/Reports';
import Teams from './pages/Teams';
import Chat from './pages/Chat';
import NotAuthorized from './pages/NotAuthorized';
import NotFound from './pages/NotFound';

// Protected Route Wrapper (auth only)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-slate-400 text-sm">
        جار التحميل...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  return children;
};

// Role-based guard for individual pages
const RoleGuard = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;
  if (!hasRole(user, allowedRoles)) {
    return <Navigate to="/not-authorized" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/not-authorized" element={<NotAuthorized />} />

          <Route
            element={(
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            )}
          >
            <Route
              path="/"
              element={(
                <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.BROKER]}>
                  <Dashboard />
                </RoleGuard>
              )}
            />
            <Route
              path="/offers"
              element={(
                <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.BROKER]}>
                  <Offers />
                </RoleGuard>
              )}
            />
            <Route
              path="/requests"
              element={(
                <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.BROKER]}>
                  <Requests />
                </RoleGuard>
              )}
            />
            <Route
              path="/matches"
              element={(
                <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.BROKER]}>
                  <Matches />
                </RoleGuard>
              )}
            />
            <Route
              path="/notifications"
              element={(
                <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.BROKER]}>
                  <Notifications />
                </RoleGuard>
              )}
            />
            <Route
              path="/users"
              element={(
                <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                  <Users />
                </RoleGuard>
              )}
            />
            <Route
              path="/audit-logs"
              element={(
                <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
                  <AuditLogs />
                </RoleGuard>
              )}
            />
            <Route
              path="/reports"
              element={(
                <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
                  <Reports />
                </RoleGuard>
              )}
            />
            <Route
              path="/teams"
              element={(
                <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
                  <Teams />
                </RoleGuard>
              )}
            />
            <Route
              path="/chat"
              element={(
                <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.BROKER]}>
                  <Chat />
                </RoleGuard>
              )}
            />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
