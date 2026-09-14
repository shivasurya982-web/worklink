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
      if (role === 'customer') {
        res = await loginCustomer({ email, password });
      } else {
        res = await loginWorker({ email, password });
      }

      if (res?.success) {
        showToast('Welcome Back!', 'Login successful.', 'success');
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
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-5 py-2.5 bg-background-dark/80 backdrop-blur-md rounded-full border border-accent-main/30 shadow-2xl hover:shadow-accent-main/20 hover:bg-background-dark transition-all text-text-primary text-[11px] font-black uppercase tracking-widest"
      >
        <Home className="w-4 h-4 text-accent-bright" />
        <span>Home</span>
      </Link>

      <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-accent-main/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-accent-orange/15 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="Worklyn Logo" className="h-12 w-auto object-contain mx-auto" />
          </Link>
          <p className="text-[11px] text-accent-light font-black uppercase tracking-[0.3em] opacity-90">Login to your account</p>
        </div>

        <GlassCard goldBorder className="!bg-background-card p-8 sm:p-10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.7)] border-border-primary/50 relative">
          {/* Role Switcher */}
          <div className="flex bg-background-dark/50 p-1.5 rounded-2xl mb-10 border border-white/5">
            <button
              onClick={() => setRole('customer')}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                role === 'customer'
                  ? 'bg-accent-orange text-white shadow-xl'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <User className="w-4 h-4" /> Customer
            </button>
            <button
              onClick={() => setRole('worker')}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                role === 'worker'
                  ? 'bg-accent-orange text-white shadow-xl'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <Briefcase className="w-4 h-4" /> Worker
            </button>
          </div>

          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-red-900/20 border border-red-500/30 text-[11px] text-red-400 font-black animate-shake text-center uppercase tracking-wider">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <FloatingInput
              id="email"
              type="email"
              label="Email Address"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="!bg-background-cardSecondary border-border-primary/20"
            />
            <FloatingInput
              id="password"
              type="password"
              label="Password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="!bg-background-cardSecondary border-border-primary/20"
            />

            <div className="flex justify-end pr-2">
              <Link
                to="/forgot-password"
                className="text-[10px] font-black text-accent-light hover:text-accent-bright transition-all uppercase tracking-[0.2em]"
              >
                Forgot Password?
              </Link>
            </div>

            <div className="pt-4">
              <PremiumButton type="submit" variant="gold" fullWidth loading={loading} size="lg" icon={LogIn} className="shadow-[0_15px_40px_rgba(244,81,11,0.4)]">
                Login
              </PremiumButton>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-xs text-text-muted font-bold">
              New here?{' '}
              <Link
                to={role === 'customer' ? '/register/customer' : '/register/worker'}
                className="text-accent-bright hover:text-accent-light transition-all underline decoration-2 underline-offset-4"
              >
                Create an account
              </Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Login;
