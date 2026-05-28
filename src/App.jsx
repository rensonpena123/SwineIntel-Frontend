import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  // If no token exists, cleanly redirect back to the root login view
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Core Root Path: Displays your custom centered-pig login form */}
        <Route path="/" element={<Login />} />

        {/* Secure Dashboard Path: Locked down by our ProtectedRoute shield */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Fallback Guard: Automatically flushes invalid URLs back to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;