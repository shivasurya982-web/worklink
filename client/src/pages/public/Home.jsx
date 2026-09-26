import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import HeroSection from '../../components/landing/HeroSection';
import StatsSection from '../../components/landing/StatsSection';

const Home = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-main border-t-transparent" />
      </div>
    );
  }

  // Logged-in users are redirected to their dedicated dashboard
  if (isAuthenticated) {
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'worker') return <Navigate to="/worker/dashboard" replace />;
    return <Navigate to="/customer/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
