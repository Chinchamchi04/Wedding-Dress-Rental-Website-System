import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/customer/HomePage';
import ProfilePage from './pages/customer/ProfilePage';
import OrderHistoryPage from './pages/customer/OrderHistoryPage';
import OrderDetailPage from './pages/customer/OrderDetailPage';
import ChangePasswordPage from './pages/customer/ChangePasswordPage';
import CollectionPage from './pages/customer/CollectionPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DressDetailPage from './pages/customer/DressDetailPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dresses/:id" element={<DressDetailPage />} />
        <Route path="/dress/:id" element={<DressDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/orders" element={<OrderHistoryPage />} />
        <Route path="/profile/orders/:orderId" element={<OrderDetailPage />} />
        <Route path="/profile/password" element={<ChangePasswordPage />} />
        <Route path="/collection" element={<CollectionPage />} />
        <Route path="/bo-suu-tap" element={<CollectionPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
