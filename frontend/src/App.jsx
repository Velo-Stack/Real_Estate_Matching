import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>جار التحميل...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return children;
};

// Placeholder for Dashboard
const Dashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: '2rem' }}>
      <h1>مرحباً، {user?.name}</h1>
      <p>أنت مسجل كـ: {user?.role}</p>
      <button onClick={logout} className="btn-primary" style={{ marginTop: '1rem', width: 'auto' }}>
        تسجيل خروج
      </button>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
