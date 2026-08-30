import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Sparkles, Search } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background-primary flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="text-center max-w-lg mx-auto">
          {/* Animated 404 */}
          <div className="relative mb-8">
            <div className="text-[10rem] font-sora font-extrabold leading-none select-none">
              <span className="gold-gradient-text">4</span>
              <span className="relative inline-block animate-float">
                <span className="blue-gradient-text">0</span>
              </span>
              <span className="gold-gradient-text">4</span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-40 h-40 bg-accent-gold/10 rounded-full blur-3xl" />
              <div className="w-32 h-32 bg-accent-blue/10 rounded-full blur-3xl ml-8" />
            </div>
          </div>

          {/* Glass Card */}
          <div className="glass-card p-8 rounded-3xl border border-accent-gold/20 shadow-xl">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-50 flex items-center justify-center overflow-hidden">
          </div>
            <h1 className="text-2xl font-sora font-bold text-text-primary mb-3">
              Page Not Found
            </h1>
            <p className="text-sm text-text-secondary font-jakarta leading-relaxed mb-8">
              The page you're looking for doesn't exist or has been moved.
              Let's get you back to finding trusted local service workers!
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 text-sm font-semibold text-text-secondary hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
              <Link
                to="/"
                className="flex items-center justify-center gap-2 btn-primary px-5 py-2.5 rounded-full text-sm font-semibold"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
              <Link
                to="/search"
                className="flex items-center justify-center gap-2 btn-ai px-5 py-2.5 rounded-full text-sm font-semibold"
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
