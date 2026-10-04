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
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-4 sm:p-6 pt-20 relative overflow-hidden">
      {/* Home Button */}
      <Link
        to="/"
        className="fixed top-4 left-4 sm:left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-xs hover:bg-slate-50 transition-all text-slate-800 text-xs font-bold uppercase tracking-wider"
      >
        <Home className="w-4 h-4 text-indigo-600" />
        <span>Home</span>
      </Link>

      <div className="max-w-md w-full relative z-10 my-auto">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <img src="/logo.png" alt="Worklyn Logo" className="h-10 w-auto object-contain mx-auto" />
          </Link>
          <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest">Login to your account</p>
        </div>

        <GlassCard className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border-slate-200 relative">
          {/* Role Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6 border border-slate-200">
            <button
              onClick={() => setRole('customer')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                role === 'customer'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" /> Customer
            </button>
            <button
              onClick={() => setRole('worker')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                role === 'worker'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4" /> Worker
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-bold text-center uppercase tracking-wider">
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

            <div className="flex justify-end pr-1">
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-indigo-600 hover:underline uppercase tracking-wider"
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

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 font-medium">
              New here?{' '}
              <Link
                to={role === 'customer' ? '/register/customer' : '/register/worker'}
                className="text-indigo-600 hover:underline font-bold"
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
