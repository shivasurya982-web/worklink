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
      <div className="min-h-screen bg-transparent flex items-center justify-center p-6">
         <GlassCard orangeBorder className="max-w-md w-full p-8 sm:p-10 text-center space-y-6 !bg-white/80 border border-white/80">
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-2 border border-emerald-200 shadow-sm">
               <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <div className="space-y-1">
               <h2 className="font-sora font-black text-2xl text-text-primary uppercase tracking-tight">WELCOME!</h2>
               <p className="text-sm text-text-secondary font-bold">Your account is ready. You can now start booking services.</p>
            </div>
            <PremiumButton variant="black" size="lg" fullWidth onClick={() => navigate('/customer/dashboard')}>GO TO DASHBOARD</PremiumButton>
         </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4 sm:p-6 pt-24 sm:pt-28 relative overflow-hidden">
      <Link
        to="/"
        className="fixed top-4 sm:top-6 left-4 sm:left-6 z-20 flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-white/90 backdrop-blur-xl rounded-full border border-white/75 shadow-sm hover:shadow-md transition-all text-text-primary text-[10px] sm:text-[11px] font-black uppercase tracking-widest"
      >
        <Home className="w-4 h-4 text-accent-main" />
        <span>Home</span>
      </Link>

      <div className="max-w-md w-full relative z-10 my-auto pb-10">
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <img src="/logo.png" alt="Worklyn Logo" className="h-10 sm:h-12 w-auto object-contain mx-auto" />
          </Link>
          <p className="text-[11px] text-accent-main font-black uppercase tracking-[0.2em]">Create Customer Account</p>
        </div>

        <GlassCard orangeBorder className="!bg-white/80 backdrop-blur-3xl p-6 sm:p-10 rounded-[2.5rem] shadow-md border-white/80">
          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-[11px] text-red-600 font-black text-center uppercase tracking-wider">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FloatingInput id="name" label="Full Name" icon={User} value={formData.name} onChange={handleChange} required />
            <FloatingInput id="email" type="email" label="Email Address" icon={Mail} value={formData.email} onChange={handleChange} required />
            <FloatingInput id="phone" type="tel" label="Phone Number" icon={Phone} value={formData.phone} onChange={handleChange} required />
            <FloatingInput id="password" type="password" label="Password" icon={Lock} value={formData.password} onChange={handleChange} required />

            <div className="pt-4 border-t border-gray-100">
               <label className="text-[10px] font-black text-accent-main uppercase tracking-widest ml-1 mb-2 block">Security Hint</label>
               <FloatingInput
                id="securityHint"
                type="text"
                label="Enter a secret word"
                icon={ShieldCheck}
                value={formData.securityHint}
                onChange={handleChange}
                required
               />
               <p className="text-[9px] text-text-muted mt-2 px-1 leading-relaxed font-bold uppercase tracking-wider">Required to recover your account if you forget your password.</p>
            </div>

            <div className="pt-4">
              <PremiumButton type="submit" variant="black" fullWidth loading={loading} size="lg" icon={ArrowRight} className="py-4">
                CREATE ACCOUNT
              </PremiumButton>
            </div>
          </form>

          <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-text-muted font-bold uppercase tracking-widest">
              Already have an account?{' '}
              <Link to="/login" className="text-accent-main hover:underline font-extrabold">
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
