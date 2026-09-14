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
      <div className="min-h-screen bg-background-primary flex items-center justify-center p-6">
         <GlassCard goldBorder className="max-w-md w-full p-10 text-center space-y-8 !bg-background-card border-border-primary/30">
            <div className="w-24 h-24 bg-emerald-950/30 rounded-[2rem] flex items-center justify-center mx-auto mb-2 border border-emerald-500/30 shadow-2xl">
               <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            </div>
            <div className="space-y-2">
               <h2 className="font-sora font-black text-2xl text-white uppercase tracking-tighter">WELCOME!</h2>
               <p className="text-sm text-text-secondary font-bold opacity-80">Your account is ready. You can now start booking services.</p>
            </div>
            <PremiumButton variant="gold" size="lg" fullWidth onClick={() => navigate('/customer/dashboard')}>GO TO DASHBOARD</PremiumButton>
         </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <Link
        to="/"
        className="fixed top-6 left-6 z-20 flex items-center gap-2 px-5 py-2.5 bg-background-dark/80 backdrop-blur-md rounded-full border border-accent-main/30 shadow-2xl hover:shadow-accent-main/10 transition-all text-text-primary text-[11px] font-black uppercase tracking-widest"
      >
        <Home className="w-4 h-4 text-accent-bright" />
        <span>Home</span>
      </Link>

      <div className="max-w-md w-full relative z-10 py-12">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="Worklyn Logo" className="h-12 w-auto object-contain mx-auto" />
          </Link>
          <p className="text-[11px] text-accent-light font-black uppercase tracking-[0.3em] opacity-90">Create Customer Account</p>
        </div>

        <GlassCard goldBorder className="!bg-background-card p-8 sm:p-10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.7)] border-border-primary/30">
          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-red-950/20 border border-red-500/30 text-[11px] text-red-400 font-black animate-shake text-center uppercase tracking-wider">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <FloatingInput id="name" label="Full Name" icon={User} value={formData.name} onChange={handleChange} required className="!bg-background-cardSecondary border-border-primary/20" />
            <FloatingInput id="email" type="email" label="Email Address" icon={Mail} value={formData.email} onChange={handleChange} required className="!bg-background-cardSecondary border-border-primary/20" />
            <FloatingInput id="phone" type="tel" label="Phone Number" icon={Phone} value={formData.phone} onChange={handleChange} required className="!bg-background-cardSecondary border-border-primary/20" />
            <FloatingInput id="password" type="password" label="Password" icon={Lock} value={formData.password} onChange={handleChange} required className="!bg-background-cardSecondary border-border-primary/20" />

            <div className="pt-4 border-t border-white/5">
               <label className="text-[10px] font-black text-accent-light uppercase tracking-[0.3em] ml-2 mb-3 block">Security Hint</label>
               <FloatingInput
                id="securityHint"
                type="text"
                label="Enter a secret word"
                icon={ShieldCheck}
                value={formData.securityHint}
                onChange={handleChange}
                required
                className="!bg-background-cardSecondary border-border-primary/20"
               />
               <p className="text-[9px] text-text-muted mt-3 px-2 leading-relaxed italic uppercase font-black tracking-widest opacity-60">REQUIRED TO RECOVER YOUR ACCOUNT IF YOU FORGET YOUR PASSWORD.</p>
            </div>

            <div className="pt-6">
              <PremiumButton type="submit" variant="gold" fullWidth loading={loading} size="lg" icon={ArrowRight} className="py-5 shadow-orange">
                CREATE ACCOUNT
              </PremiumButton>
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-xs text-text-muted font-bold uppercase tracking-widest">
              Already have an account?{' '}
              <Link to="/login" className="text-accent-bright hover:underline transition-all">
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
