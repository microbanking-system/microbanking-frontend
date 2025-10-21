import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import LoginRegister from './components/LoginRegister';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Set axios base URL from env with fallback for local dev
axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Add axios interceptor to include token in requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const updateAuthStatus = (status: boolean) => {
    setIsAuthenticated(status);
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <LoginRegister onLoginSuccess={() => updateAuthStatus(true)} />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard onLogout={() => updateAuthStatus(false)} />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;