import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// 404 Page
import NotFound from '../pages/public/NotFound';

// Public Pages
import Home from '../pages/public/Home';
import About from '../pages/public/About';
import Contact from '../pages/public/Contact';
import Services from '../pages/public/Services';
import SearchPage from '../pages/customer/SearchPage';
import CustomerSearch from '../pages/customer/CustomerSearch';
import WorkerProfilePage from '../pages/customer/WorkerProfilePage';

// Auth Pages
import Login from '../pages/auth/Login';
import RegisterCustomer from '../pages/auth/RegisterCustomer';
import RegisterWorker from '../pages/auth/RegisterWorker';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Dashboards & Sub-pages
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import CustomerBookings from '../pages/customer/CustomerBookings';
import CustomerFavorites from '../pages/customer/CustomerFavorites';
import CustomerMessages from '../pages/customer/CustomerMessages';
import CustomerProfile from '../pages/customer/CustomerProfile';
import CustomerComplaints from '../pages/customer/CustomerComplaints';

import WorkerDashboard from '../pages/worker/WorkerDashboard';
import WorkerBookings from '../pages/worker/WorkerBookings';
import AvailableJobs from '../pages/worker/AvailableJobs';
import WorkerPortfolio from '../pages/worker/WorkerPortfolio';
import WorkerMessages from '../pages/worker/WorkerMessages';
import WorkerProfile from '../pages/worker/WorkerProfile';
import WorkerComplaints from '../pages/worker/WorkerComplaints';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminWorkers from '../pages/admin/AdminWorkers';
import AdminCustomers from '../pages/admin/AdminCustomers';
import AdminCategories from '../pages/admin/AdminCategories';
import AdminSettings from '../pages/admin/AdminSettings';
import AdminComplaints from '../pages/admin/AdminComplaints';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-gold border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/workers/:id" element={<WorkerProfilePage />} />

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register/customer" element={<RegisterCustomer />} />
      <Route path="/register/worker" element={<RegisterWorker />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Customer Protected Routes */}
      <Route
        path="/customer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/search"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerSearch />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/bookings"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/favorites"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerFavorites />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/messages"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerMessages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/profile"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/complaints"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerComplaints />
          </ProtectedRoute>
        }
      />

      {/* Worker Protected Routes */}
      <Route
        path="/worker/dashboard"
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <WorkerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/available-jobs"
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <AvailableJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/bookings"
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <WorkerBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/portfolio"
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <WorkerPortfolio />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/messages"
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <WorkerMessages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/profile"
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <WorkerProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/complaints"
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <WorkerComplaints />
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/workers"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminWorkers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/customers"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminCustomers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminCategories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/complaints"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminComplaints />
          </ProtectedRoute>
        }
      />

      {/* Fallback Catch-All - 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
