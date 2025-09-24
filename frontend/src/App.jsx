import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import QRGenerator from './pages/QRGenerator';
import History from './pages/History';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
        
        <Navbar />
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route 
              path="/generate"
              element={
                <ProtectedRoute>
                  <QRGenerator />
                </ProtectedRoute>
              }
            />
            
            <Route 
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
};

const Home = () => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/generate" replace />;
  }
  
  return (
    <div className="container" style={{ paddingTop: '2rem', textAlign: 'center' }}>
      <div className="card">
        <h1 style={{ marginBottom: '1rem' }}>Welcome to QR Code Generator</h1>
        <p style={{ marginBottom: '2rem', fontSize: '1.1rem', color: '#4b5563' }}>
          Generate QR codes with authentication and history tracking. Please log in or sign up to get started.
        </p>
        <div>
          <Link to="/login" className="btn btn-primary" style={{ marginRight: '1rem' }}>Login</Link>
          <Link to="/signup" className="btn btn-secondary">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default App;
