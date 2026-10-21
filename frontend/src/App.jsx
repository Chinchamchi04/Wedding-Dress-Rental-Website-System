import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/customer/HomePage';
import CollectionPage from './pages/customer/CollectionPage';
import ProfilePage from './pages/customer/ProfilePage';
import OrderHistoryPage from './pages/customer/OrderHistoryPage';
import OrderDetailPage from './pages/customer/OrderDetailPage';
import ChangePasswordPage from './pages/customer/ChangePasswordPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DressDetailPage from './pages/customer/DressDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import AppointmentPage from './pages/customer/AppointmentPage';
import GuestBookingPage from './pages/customer/GuestBookingPage';
import OrderRentalManagement from './pages/admin/OrderRentalManagement';
import InventoryManagement from './pages/admin/InventoryManagement';
import CustomerCareManagement from './pages/admin/CustomerCareManagement';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/collection" element={<CollectionPage />} />
        <Route path="/bo-suu-tap" element={<CollectionPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/dat-coc" element={<CheckoutPage />} />
        <Route path="/thanh-toan" element={<CheckoutPage />} />
        <Route path="/ky-hop-dong" element={<CheckoutPage />} />
        <Route path="/dat-lich" element={<AppointmentPage />} />
        <Route path="/appointment" element={<AppointmentPage />} />
        <Route path="/booking" element={<AppointmentPage />} />
        <Route path="/thue-nhanh" element={<GuestBookingPage />} />
        <Route path="/guest-booking" element={<GuestBookingPage />} />
        <Route path="/dresses/:id" element={<DressDetailPage />} />
        <Route path="/dress/:id" element={<DressDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/orders" element={<OrderHistoryPage />} />
        <Route path="/profile/orders/:orderId" element={<OrderDetailPage />} />
        <Route path="/profile/password" element={<ChangePasswordPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* Admin & Staff Management */}
        <Route path="/admin" element={<Navigate to="/admin/don-thue" replace />} />
        <Route path="/admin/don-thue" element={<OrderRentalManagement />} />
        <Route path="/admin/orders" element={<OrderRentalManagement />} />
        <Route path="/admin/kho-hang" element={<InventoryManagement />} />
        <Route path="/admin/inventory" element={<InventoryManagement />} />
        <Route path="/staff" element={<Navigate to="/staff/don-thue" replace />} />
        <Route path="/staff/don-thue" element={<OrderRentalManagement />} />
        <Route path="/staff/orders" element={<OrderRentalManagement />} />
        <Route path="/staff/kho-hang" element={<InventoryManagement />} />
        <Route path="/staff/inventory" element={<InventoryManagement />} />
        <Route path="/quan-ly-don-thue" element={<OrderRentalManagement />} />
        <Route path="/quan-ly-kho-hang" element={<InventoryManagement />} />
        <Route path="/admin/cham-soc-khach-hang" element={<CustomerCareManagement />} />
        <Route path="/admin/customer-care" element={<CustomerCareManagement />} />
        <Route path="/staff/cham-soc-khach-hang" element={<CustomerCareManagement />} />
        <Route path="/staff/customer-care" element={<CustomerCareManagement />} />
        <Route path="/cham-soc-khach-hang" element={<CustomerCareManagement />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

