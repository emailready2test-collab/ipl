import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import TeamLogin from './pages/TeamLogin';
import TeamDashboard from './pages/TeamDashboard';
import ViewerBoard from './pages/ViewerBoard';
import BuzzerPage from './pages/BuzzerPage';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function TeamRoute({ children }) {
  const { isTeamAuthenticated } = useAuth();
  return isTeamAuthenticated() ? children : <Navigate to="/team-login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Central Entry Hub */}
        <Route path="/" element={<LandingPage />} />

        {/* Core Admin Flows */}
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <AdminDashboard />
          </PrivateRoute>
        } />

        {/* Core Team Flows */}
        <Route path="/team-login" element={<TeamLogin />} />
        <Route path="/team-dashboard" element={
          <TeamRoute>
            <TeamDashboard />
          </TeamRoute>
        } />

        {/* Public Board */}
        <Route path="/viewer" element={<ViewerBoard />} />

        {/* Buzzer System (Public — Team uses on phones) */}
        <Route path="/buzzer" element={<BuzzerPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
