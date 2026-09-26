import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, User, Briefcase, Home } from 'lucide-react';
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
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4 sm:p-6 pt-24 sm:pt-28 relative overflow-hidden">
      {/* Home Button */}
      <Link
        to="/"
        className="fixed top-4 sm:top-6 left-4 sm:left-6 z-20 flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-white/90 backdrop-blur-xl rounded-full border border-white/60 shadow-sm hover:shadow-md transition-all text-text-primary text-[10px] sm:text-[11px] font-black uppercase tracking-widest"
      >
        <Home className="w-4 h-4 text-accent-main" />
        <span>Home</span>
      </Link>

      <div className="absolute top-0 right-0 w-[70%] h-[70%] bg-[#DBEAFE] rounded-full blur-[120px] pointer-events-none opacity-80" />
      <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-[#BFDBFE] rounded-full blur-[120px] pointer-events-none opacity-70" />

      <div className="max-w-md w-full relative z-10 my-auto">
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <img src="/logo.png" alt="Worklyn Logo" className="h-10 sm:h-12 w-auto object-contain mx-auto" />
          </Link>
          <p className="text-[11px] text-accent-main font-black uppercase tracking-[0.2em]">Login to your account</p>
        </div>

        <GlassCard goldBorder className="!bg-white/80 backdrop-blur-2xl p-6 sm:p-10 rounded-[2.5rem] shadow-sm border-white/60 relative">
          {/* Role Switcher */}
          <div className="flex bg-blue-50/80 p-1.5 rounded-2xl mb-6 sm:mb-8 border border-blue-100">
            <button
              onClick={() => setRole('customer')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                role === 'customer'
                  ? 'bg-accent-main text-white shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <User className="w-4 h-4" /> Customer
            </button>
            <button
              onClick={() => setRole('worker')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                role === 'worker'
                  ? 'bg-accent-main text-white shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <Briefcase className="w-4 h-4" /> Worker
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-[11px] text-red-600 font-black text-center uppercase tracking-wider">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
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

            <div className="flex justify-end pr-1">
              <Link
                to="/forgot-password"
                className="text-[10px] font-black text-accent-main hover:underline uppercase tracking-wider"
              >
                Forgot Password?
              </Link>
            </div>

            <div className="pt-2">
              <PremiumButton type="submit" variant="gold" fullWidth loading={loading} size="lg" icon={LogIn}>
                Login
              </PremiumButton>
            </div>
          </form>

          <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-text-muted font-bold">
              New here?{' '}
              <Link
                to={role === 'customer' ? '/register/customer' : '/register/worker'}
                className="text-accent-main hover:underline font-extrabold"
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
