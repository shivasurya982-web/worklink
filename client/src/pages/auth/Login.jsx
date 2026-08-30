import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight, Sparkles, User, Briefcase, ShieldCheck, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import FloatingInput from '../../components/common/FloatingInput';
import PremiumButton from '../../components/common/PremiumButton';
import GlassCard from '../../components/common/GlassCard';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // 'customer', 'worker'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { isAuthenticated, role: userRole, loginCustomer, loginWorker } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  // If already logged in, redirect
  useEffect(() => {
    if (isAuthenticated) {
      if (userRole === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (userRole === 'worker') navigate('/worker/dashboard', { replace: true });
      else navigate('/customer/dashboard', { replace: true });
    }
  }, [isAuthenticated, userRole, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      let res;
      // Admin login is automatically handled by the backend for both endpoints
      if (role === 'customer') {
        res = await loginCustomer({ email, password });
      } else {
        res = await loginWorker({ email, password });
      }

      if (res?.success) {
        showToast('Welcome Back!', 'Login successful.', 'success');
        // Redirect logic handled by useEffect above
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center p-6 relative overflow-hidden">
      {/* Home Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full border border-accent-gold/20 shadow-sm hover:shadow-md hover:bg-white transition-all text-text-primary text-xs font-bold"
      >
        <Home className="w-4 h-4 text-accent-gold" />
        <span>Back to Home</span>
      </Link>

      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-blue/5 rounded-full blur-3xl" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <span className="font-sora font-bold text-2xl text-text-primary">
              WorkLink
            </span>
          </Link>
          <p className="text-xs text-text-secondary font-medium uppercase tracking-[0.15em]">Access Your Account</p>
        </div>

        <GlassCard goldBorder className="bg-white/95 p-8 rounded-3xl shadow-2xl">
          {/* Role Switcher */}
          <div className="flex bg-gray-100 p-1 rounded-2xl mb-8">
            <button
              onClick={() => setRole('customer')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                role === 'customer'
                  ? 'bg-white text-accent-gold shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <User className="w-4 h-4" /> Customer
            </button>
            <button
              onClick={() => setRole('worker')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                role === 'worker'
                  ? 'bg-white text-accent-gold shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <Briefcase className="w-4 h-4" /> Professional
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-xs text-accent-red font-semibold animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FloatingInput
              id="email"
              type="email"
              label="Email Address"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FloatingInput
              id="password"
              type="password"
              label="Password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-[11px] font-bold text-accent-gold hover:underline transition-all uppercase tracking-wider"
              >
                Forgot Password?
              </Link>
            </div>

            <div className="pt-2">
              <PremiumButton type="submit" variant="gold" fullWidth loading={loading} size="lg" icon={LogIn}>
                Login as {role === 'customer' ? 'Customer' : 'Professional'}
              </PremiumButton>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-text-muted">
              Don't have an account?{' '}
              <Link
                to={role === 'customer' ? '/register/customer' : '/register/worker'}
                className="font-bold text-accent-gold hover:underline transition-all"
              >
                Sign Up Now
              </Link>
            </p>
          </div>
        </GlassCard>

        {/* Footer links removed per user request */}
      </div>
    </div>
  );
};

export default Login;
