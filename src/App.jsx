import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MainLayout from './components/MainLayout';
import Inventory from './pages/Inventory';
import Pens from './pages/Pen';
import Pigs from './pages/Pig';
import UserManagement from './pages/UserManagement';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Login Route */}
        <Route path="/" element={<Login />} />

        {/* Protected Application Routes Wrapped Inside MainLayout Frame */}
        <Route 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* All pages placed inside here will automatically display the Sidebar! */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Placeholders for future paths */}
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/pens" element={<Pens />} />
          <Route path="/health" element={<Pigs />} />
          <Route path="/users" element={<UserManagement/>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;