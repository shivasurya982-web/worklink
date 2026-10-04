import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight, ShieldCheck, CheckCircle2, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import FloatingInput from '../../components/common/FloatingInput';
import PremiumButton from '../../components/common/PremiumButton';
import GlassCard from '../../components/common/GlassCard';

const RegisterCustomer = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    securityHint: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { isAuthenticated, role: userRole, registerCustomer } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (userRole === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (userRole === 'worker') navigate('/worker/dashboard', { replace: true });
      else navigate('/customer/dashboard', { replace: true });
    }
  }, [isAuthenticated, userRole, navigate]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.securityHint) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await registerCustomer(formData);
      if (res.success) {
        showToast('Success!', 'Account created successfully.', 'success');
        setIsSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-6">
         <GlassCard className="max-w-md w-full p-8 text-center space-y-5 bg-white border border-slate-200 shadow-md">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
               <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="space-y-1">
               <h2 className="font-sora font-bold text-xl text-slate-900 uppercase tracking-tight">WELCOME!</h2>
               <p className="text-xs text-slate-600 font-medium leading-relaxed">Your account is ready. You can now start booking services.</p>
            </div>
            <PremiumButton variant="gold" size="lg" fullWidth onClick={() => navigate('/customer/dashboard')}>GO TO DASHBOARD</PremiumButton>
         </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-4 sm:p-6 pt-20 relative overflow-hidden">
      <Link
        to="/"
        className="fixed top-4 left-4 sm:left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-xs hover:bg-slate-50 transition-all text-slate-800 text-xs font-bold uppercase tracking-wider"
      >
        <Home className="w-4 h-4 text-orange-600" />
        <span>Home</span>
      </Link>

      <div className="max-w-md w-full relative z-10 my-auto pb-10">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <img src="/logo.png" alt="Worklyn Logo" className="h-10 w-auto object-contain mx-auto" />
          </Link>
          <p className="text-xs text-orange-600 font-bold uppercase tracking-widest">Create Customer Account</p>
        </div>

        <GlassCard className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border-slate-200">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-bold text-center uppercase tracking-wider">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FloatingInput id="name" label="Full Name" icon={User} value={formData.name} onChange={handleChange} required />
            <FloatingInput id="email" type="email" label="Email Address" icon={Mail} value={formData.email} onChange={handleChange} required />
            <FloatingInput id="phone" type="tel" label="Phone Number" icon={Phone} value={formData.phone} onChange={handleChange} required />
            <FloatingInput id="password" type="password" label="Password" icon={Lock} value={formData.password} onChange={handleChange} required />

            <div className="pt-3 border-t border-slate-100">
               <label className="text-[10px] font-bold text-orange-600 uppercase tracking-widest ml-1 mb-1.5 block">Security Hint</label>
               <FloatingInput
                id="securityHint"
                type="text"
                label="Enter a secret word"
                icon={ShieldCheck}
                value={formData.securityHint}
                onChange={handleChange}
                required
               />
               <p className="text-[10px] text-slate-400 mt-1.5 px-1 leading-relaxed font-medium">Required to recover your account if you forget your password.</p>
            </div>

            <div className="pt-3">
              <PremiumButton type="submit" variant="gold" fullWidth loading={loading} size="lg" icon={ArrowRight}>
                CREATE ACCOUNT
              </PremiumButton>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-600 hover:underline font-bold">
                Login
              </Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default RegisterCustomer;
