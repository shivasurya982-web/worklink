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

  // If already logged in, redirect
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
        showToast('Account Created!', 'Welcome to Worklyn.', 'success');
        setIsSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center p-6">
         <GlassCard goldBorder className="max-w-md w-full p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
               <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="font-sora font-bold text-2xl text-text-primary">Registration Successful!</h2>
            <p className="text-sm text-text-secondary">Your Worklyn account has been created. You can now start booking services.</p>
            <PremiumButton variant="gold" fullWidth onClick={() => navigate('/customer/dashboard')}>Go to Dashboard</PremiumButton>
         </GlassCard>
      </div>
    );
  }

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
              Worklyn
            </span>
          </Link>
          <p className="text-xs text-text-secondary font-medium uppercase tracking-[0.15em]">Customer Registration</p>
        </div>

        <GlassCard goldBorder className="bg-white/95 p-8 rounded-3xl shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-xs text-accent-red font-semibold animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FloatingInput id="name" label="Full Name" icon={User} value={formData.name} onChange={handleChange} required />
            <FloatingInput id="email" type="email" label="Email Address" icon={Mail} value={formData.email} onChange={handleChange} required />
            <FloatingInput id="phone" type="tel" label="Phone Number" icon={Phone} value={formData.phone} onChange={handleChange} required />
            <FloatingInput id="password" type="password" label="Create Password" icon={Lock} value={formData.password} onChange={handleChange} required />

            <div className="pt-2">
               <label className="text-[10px] font-bold text-accent-gold uppercase tracking-wider ml-1 mb-1 block">Account Recovery Hint</label>
               <FloatingInput
                id="securityHint"
                type="text"
                label="Enter a word to remember"
                icon={ShieldCheck}
                value={formData.securityHint}
                onChange={handleChange}
                required
               />
               <p className="text-[9px] text-text-muted mt-1 px-1 leading-relaxed italic">Used to verify your identity if you ever lose access to your account.</p>
            </div>

            <div className="pt-4">
              <PremiumButton type="submit" variant="gold" fullWidth loading={loading} size="lg" icon={ArrowRight}>
                Create Free Account
              </PremiumButton>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-text-muted">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-accent-gold hover:underline transition-all">
                Sign In
              </Link>
            </p>
          </div>
        </GlassCard>

        {/* Footer links removed */}
      </div>
    </div>
  );
};

export default RegisterCustomer;
