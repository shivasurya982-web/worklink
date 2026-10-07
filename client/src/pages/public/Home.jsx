import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  MessageSquare,
  Star,
  UserCheck,
  Search,
  CalendarCheck,
  Award,
  Users,
  Briefcase,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import HeroSection from '../../components/landing/HeroSection';
import StatsSection from '../../components/landing/StatsSection';
import FAQSection from '../../components/landing/FAQSection';

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

        {/* Seamless Service Experience */}
        <section className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
          <div className="container-responsive">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-xs font-bold text-orange-700 uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" /> Seamless Experience
              </span>
              <h2 className="text-2xl sm:text-4xl font-sora font-bold text-slate-900 uppercase tracking-tight">
                How Customers Benefit
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs hover:border-orange-200 transition-all flex flex-col items-start group">
                <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center mb-5 shadow-xs group-hover:bg-orange-600 group-hover:text-white transition-all">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="font-sora font-bold text-lg text-slate-900 mb-2 uppercase tracking-tight">
                  Connect & Arrange
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Connect with the worker and arrange your service easily.
                </p>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs hover:border-orange-200 transition-all flex flex-col items-start group">
                <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center mb-5 shadow-xs group-hover:bg-orange-600 group-hover:text-white transition-all">
                  <Star className="w-6 h-6" />
                </div>
                <h3 className="font-sora font-bold text-lg text-slate-900 mb-2 uppercase tracking-tight">
                  Rate & Review
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Share your experience and help others choose better workers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 🛠️ What Workers Can Do */}
        <section className="py-16 sm:py-24 bg-[#F8FAFC] border-b border-slate-200/80">
          <div className="container-responsive">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-xs font-bold text-orange-700 uppercase tracking-wider mb-3">
                🛠️ What Workers Can Do
              </span>
              <h2 className="text-2xl sm:text-4xl font-sora font-bold text-slate-900 tracking-tight uppercase">
                Empowering Local Professionals
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium uppercase tracking-wider mt-2">
                Everything you need to showcase your skills and get hired nearby.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  title: 'Create Your Profile',
                  desc: 'Show your skills, experience, services, and portfolio.',
                  icon: UserCheck,
                },
                {
                  title: 'Get Discovered',
                  desc: 'Let customers find you based on your profession and location.',
                  icon: Search,
                },
                {
                  title: 'Connect With Customers',
                  desc: 'Chat directly with customers and understand their requirements.',
                  icon: MessageSquare,
                },
                {
                  title: 'Manage Bookings',
                  desc: 'Receive and manage service requests in one place.',
                  icon: CalendarCheck,
                },
                {
                  title: 'Build Your Reputation',
                  desc: 'Collect ratings and reviews and grow your professional presence.',
                  icon: Award,
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs hover:border-orange-200 hover:shadow-md transition-all group flex flex-col"
                  >
                    <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center mb-5 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-sora font-bold text-base text-slate-900 mb-2 group-hover:text-orange-600 transition-colors uppercase tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ⭐ One Platform. Two Opportunities */}
        <section className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
          <div className="container-responsive">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-xs font-bold text-orange-700 uppercase tracking-wider mb-3">
                ⭐ One Platform. Two Opportunities.
              </span>
              <h2 className="text-2xl sm:text-4xl font-sora font-bold text-slate-900 tracking-tight uppercase">
                One Platform. Two Opportunities.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-white to-orange-50/50 p-8 sm:p-10 rounded-3xl border border-orange-200/80 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center mb-6 shadow-md">
                    <Users className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-extrabold text-orange-600 uppercase tracking-widest block mb-1">
                    For Customers
                  </span>
                  <h3 className="text-xl sm:text-2xl font-sora font-bold text-slate-900 mb-3 uppercase tracking-tight">
                    Find the right professional for your work.
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    Search, compare, and connect directly with verified local experts in seconds for any repair or maintenance task.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-orange-200/60 flex items-center justify-start gap-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-xs font-black text-orange-600 hover:text-orange-700 uppercase tracking-wider"
                  >
                    Login <ArrowRight className="w-4 h-4" />
                  </Link>
                  <span className="text-slate-300">|</span>
                  <Link
                    to="/register/customer"
                    className="inline-flex items-center gap-2 text-xs font-black text-orange-600 hover:text-orange-700 uppercase tracking-wider"
                  >
                    Register
                  </Link>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 sm:p-10 rounded-3xl border border-slate-700 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center mb-6 shadow-md">
                    <Briefcase className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-extrabold text-orange-400 uppercase tracking-widest block mb-1">
                    For Workers
                  </span>
                  <h3 className="text-xl sm:text-2xl font-sora font-bold text-white mb-3 uppercase tracking-tight">
                    Find more customers and grow your local business.
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                    Join a trusted local network, receive direct job requests, showcase your portfolio, and double your monthly earnings.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-700/80 flex items-center justify-start gap-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-xs font-black text-orange-400 hover:text-orange-300 uppercase tracking-wider"
                  >
                    Login <ArrowRight className="w-4 h-4" />
                  </Link>
                  <span className="text-slate-700">|</span>
                  <Link
                    to="/register/worker"
                    className="inline-flex items-center gap-2 text-xs font-black text-orange-400 hover:text-orange-300 uppercase tracking-wider"
                  >
                    Register
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
