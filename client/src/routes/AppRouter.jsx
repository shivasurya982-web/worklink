import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Direct import for instant home paint
import Home from '../pages/public/Home';
import NotFound from '../pages/public/NotFound';

// Lazy-loaded routes for fast initial bundle and instant response
const SearchPage = lazy(() => import('../pages/customer/SearchPage'));
const CustomerSearch = lazy(() => import('../pages/customer/CustomerSearch'));
const WorkerProfilePage = lazy(() => import('../pages/customer/WorkerProfilePage'));

// Auth Pages
const Login = lazy(() => import('../pages/auth/Login'));
const RegisterCustomer = lazy(() => import('../pages/auth/RegisterCustomer'));
const RegisterWorker = lazy(() => import('../pages/auth/RegisterWorker'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));

// Customer Pages
const CustomerDashboard = lazy(() => import('../pages/customer/CustomerDashboard'));
const CustomerBookings = lazy(() => import('../pages/customer/CustomerBookings'));
const CustomerFavorites = lazy(() => import('../pages/customer/CustomerFavorites'));
const CustomerMessages = lazy(() => import('../pages/customer/CustomerMessages'));
const CustomerProfile = lazy(() => import('../pages/customer/CustomerProfile'));
const CustomerComplaints = lazy(() => import('../pages/customer/CustomerComplaints'));

// Worker Pages
const WorkerDashboard = lazy(() => import('../pages/worker/WorkerDashboard'));
const WorkerBookings = lazy(() => import('../pages/worker/WorkerBookings'));
const AvailableJobs = lazy(() => import('../pages/worker/AvailableJobs'));
const WorkerPortfolio = lazy(() => import('../pages/worker/WorkerPortfolio'));
const WorkerMessages = lazy(() => import('../pages/worker/WorkerMessages'));
const WorkerProfile = lazy(() => import('../pages/worker/WorkerProfile'));
const WorkerComplaints = lazy(() => import('../pages/worker/WorkerComplaints'));

// Admin Pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminWorkers = lazy(() => import('../pages/admin/AdminWorkers'));
const AdminCustomers = lazy(() => import('../pages/admin/AdminCustomers'));
const AdminCategories = lazy(() => import('../pages/admin/AdminCategories'));
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'));
const AdminComplaints = lazy(() => import('../pages/admin/AdminComplaints'));

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-transparent">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-main border-t-transparent" />
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
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
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
};

export default AppRouter;
