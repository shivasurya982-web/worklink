import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="text-center max-w-lg mx-auto">
          {/* 404 */}
          <div className="relative mb-6">
            <div className="text-[9rem] font-sora font-extrabold leading-none select-none text-accent-main">
              404
            </div>
          </div>

          {/* Glass Card */}
          <div className="glass-card p-8 rounded-3xl border border-white/60 shadow-sm !bg-white/80">
            <h1 className="text-2xl font-sora font-black text-text-primary mb-2">
              Page Not Found
            </h1>
            <p className="text-sm text-text-secondary font-medium leading-relaxed mb-6">
              The page you're looking for doesn't exist or has been moved.
              Let's get you back to finding trusted local service workers!
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 text-xs font-bold text-text-secondary hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
              <Link
                to="/"
                className="flex items-center justify-center gap-2 bg-gradient-to-b from-[#2C2C2E] to-[#1C1C1E] text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider hover:from-[#3A3A3C] hover:to-[#2C2C2E] transition-all shadow-md"
              >
                <Home className="w-4 h-4 text-accent-main" />
                Back to Home
              </Link>
              <Link
                to="/search"
                className="flex items-center justify-center gap-2 bg-orange-50/80 text-accent-main border border-orange-200/80 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider hover:bg-orange-100 transition-all"
              >
                <Search className="w-4 h-4" />
                Find a Worker
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
