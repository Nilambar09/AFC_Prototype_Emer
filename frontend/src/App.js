import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import Dashboard from './pages/Dashboard';
import PitchDeckPage from './pages/PitchDeckPage';
import DataRoomPage from './pages/DataRoomPage';
import HistoryPage from './pages/HistoryPage';
import './App.css';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route wrapper (redirects to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } 
      />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/pitch-deck" 
        element={
          <ProtectedRoute>
            <PitchDeckPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/pitch-deck/:deckId" 
        element={
          <ProtectedRoute>
            <PitchDeckPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/data-room" 
        element={
          <ProtectedRoute>
            <DataRoomPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/history" 
        element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="dark">
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
