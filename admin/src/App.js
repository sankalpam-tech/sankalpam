import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DbDetails from './pages/DbDetails';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#c41e3a' }}>Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<div className="content-area"><h2 style={{ color: '#1c140d' }}>Products Management</h2><p>Coming Soon</p></div>} />
            <Route path="pujas" element={<DbDetails/>} />
            <Route path="bookings" element={<div className="content-area"><h2 style={{ color: '#1c140d' }}>Bookings Management</h2><p>Coming Soon</p></div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
//test
export default App;
