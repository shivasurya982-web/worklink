import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Wrench, MapPin, Upload, Sparkles, CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import FloatingInput from '../../components/common/FloatingInput';
import PremiumButton from '../../components/common/PremiumButton';
import GlassCard from '../../components/common/GlassCard';
import API from '../../services/api';

const RegisterWorker = () => {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    password: '',
    profession: '',
    category: '',
    experience: '3',
    hourlyRate: '350',
    description: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    registerHint: '',
    securityHint: '',
  });

  const { isAuthenticated, role: userRole, registerWorker } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (userRole === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (userRole === 'worker') navigate('/worker/dashboard', { replace: true });
      else navigate('/customer/dashboard', { replace: true });
    }
  }, [isAuthenticated, userRole, navigate]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await API.get('/categories');
        if (res.success) setCategories(res.data);
      } catch (err) {}
    };
    fetchCats();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNextStep1 = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.password.trim()) {
      setError('Please fill in all personal details (Name, Email, Phone, Password).');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleNextStep2 = (e) => {
    e.preventDefault();
    if (!formData.profession.trim()) {
      setError('Please enter your profession title.');
      return;
    }
    setError('');
    setStep(3);
  };

  const handleNextStep3 = (e) => {
    e.preventDefault();
    if (!formData.street.trim() || !formData.city.trim() || !formData.state.trim()) {
      setError('Please fill in your address details (Street, City, State).');
      return;
    }
    setError('');
    setStep(4);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hintVal = formData.registerHint || formData.securityHint;
    if (!hintVal || !hintVal.trim()) {
      setError('Please set a Register Hint for account recovery.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const payload = { ...formData, registerHint: hintVal.trim(), securityHint: hintVal.trim() };
      const res = await registerWorker(payload);
      if (res.success) {
        showToast('Application Submitted!', 'Your professional application is under review.', 'success');
        setStep(5);
      }
    } catch (err) {
      setError(err.message || 'Professional registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center p-6 relative overflow-hidden">
      {/* Home Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-background-cardSecondary/80 backdrop-blur-md rounded-full border border-accent-gold/20 shadow-lg hover:shadow-accent-gold/10 hover:bg-background-cardSecondary transition-all text-text-primary text-xs font-bold"
      >
        <Home className="w-4 h-4 text-accent-goldLight" />
        <span>Back to Home</span>
      </Link>

      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-accent-burnt/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-orange/5 rounded-full blur-[100px]" />

      <div className="max-w-xl w-full relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <span className="font-sora font-bold text-3xl text-text-primary">
              WorkLink
            </span>
          </Link>
          <p className="text-xs text-text-secondary font-medium uppercase tracking-[0.2em] opacity-80">Professional Registration</p>
        </div>

        <GlassCard goldBorder className="!bg-background-card/95 p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-border-primary/30">
          {step <= 4 && (
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border-primary/10">
              {['Personal', 'Skills', 'Address', 'Recovery'].map((sName, idx) => (
                <div key={sName} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${step === idx + 1 ? 'bg-accent-gold text-text-primary shadow-lg' : step > idx + 1 ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30' : 'bg-background-secondary text-text-muted'}`}>
                    {step > idx + 1 ? '✓' : idx + 1}
                  </div>
                  <span className={`text-[9px] font-bold uppercase hidden xs:inline ${step === idx + 1 ? 'text-accent-goldLight' : 'text-text-muted'}`}>{sName}</span>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-900/20 border border-red-500/20 text-xs text-red-400 font-semibold animate-shake text-center">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-4">
              <FloatingInput id="name" label="Full Name" icon={User} value={formData.name} onChange={handleChange} required className="!bg-background-cardSecondary/50 border-border-primary/20" />
              <FloatingInput id="email" type="email" label="Email Address" icon={Mail} value={formData.email} onChange={handleChange} required className="!bg-background-cardSecondary/50 border-border-primary/20" />
              <FloatingInput id="phone" type="tel" label="Phone Number" icon={Phone} value={formData.phone} onChange={handleChange} required className="!bg-background-cardSecondary/50 border-border-primary/20" />
              <FloatingInput id="password" type="password" label="Create Password" icon={Lock} value={formData.password} onChange={handleChange} required className="!bg-background-cardSecondary/50 border-border-primary/20" />
              <PremiumButton type="submit" variant="gold" fullWidth icon={ArrowRight}>Next: Profession</PremiumButton>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleNextStep2} className="space-y-4">
              <FloatingInput id="profession" label="Profession Title" icon={Wrench} value={formData.profession} onChange={handleChange} required className="!bg-background-cardSecondary/50 border-border-primary/20" />
              <select id="category" value={formData.category} onChange={handleChange} className="w-full bg-background-cardSecondary/50 border border-border-primary/20 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-accent-gold text-text-primary">
                <option value="" className="bg-background-card">Select Category (Optional)</option>
                {categories.map(c => <option key={c._id} value={c._id} className="bg-background-card">{c.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <FloatingInput id="experience" type="number" label="Experience (Years)" value={formData.experience} onChange={handleChange} required className="!bg-background-cardSecondary/50 border-border-primary/20" />
                <FloatingInput id="hourlyRate" type="number" label="Hourly Rate (₹)" value={formData.hourlyRate} onChange={handleChange} required className="!bg-background-cardSecondary/50 border-border-primary/20" />
              </div>
              <div className="flex gap-3">
                <PremiumButton type="button" onClick={() => { setError(''); setStep(1); }} variant="outline" className="flex-1">Back</PremiumButton>
                <PremiumButton type="submit" variant="gold" className="flex-[2]">Next: Address</PremiumButton>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleNextStep3} className="space-y-4">
              <FloatingInput id="street" label="Street Address" icon={MapPin} value={formData.street} onChange={handleChange} required className="!bg-background-cardSecondary/50 border-border-primary/20" />
              <div className="grid grid-cols-2 gap-4">
                <FloatingInput id="city" label="City" value={formData.city} onChange={handleChange} required className="!bg-background-cardSecondary/50 border-border-primary/20" />
                <FloatingInput id="state" label="State" value={formData.state} onChange={handleChange} required className="!bg-background-cardSecondary/50 border-border-primary/20" />
              </div>
              <div className="flex gap-3">
                <PremiumButton type="button" onClick={() => { setError(''); setStep(2); }} variant="outline" className="flex-1">Back</PremiumButton>
                <PremiumButton type="submit" variant="gold" className="flex-[2]">Next: Recovery Hint</PremiumButton>
              </div>
            </form>
          )}

          {step === 4 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center">
                <h3 className="font-sora font-bold text-text-primary mb-2">Account Recovery Hint</h3>
                <p className="text-[11px] text-text-secondary leading-relaxed opacity-80">Set a recovery word to verify your identity if you ever lose your password.</p>
              </div>

              <div className="pt-2">
                <FloatingInput
                  id="registerHint"
                  type="text"
                  label="Enter your recovery word"
                  icon={ShieldCheck}
                  value={formData.registerHint}
                  onChange={handleChange}
                  required
                  className="!bg-background-cardSecondary/50 border-border-primary/20"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <PremiumButton type="button" onClick={() => { setError(''); setStep(3); }} variant="outline" className="flex-1">Back</PremiumButton>
                <PremiumButton type="submit" variant="gold" className="flex-[2]" loading={loading}>Submit Application</PremiumButton>
              </div>
            </form>
          )}

          {step === 5 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                 <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="font-sora font-bold text-2xl text-text-primary mb-3">Application Received!</h3>
              <p className="text-xs text-text-muted mb-8 leading-relaxed max-w-[280px] mx-auto">Our admin team is reviewing your profile. You'll be notified via email once approved.</p>
              <Link to="/login"><PremiumButton variant="gold" size="lg" fullWidth>Back to Login</PremiumButton></Link>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border-primary/10 text-center text-xs text-text-secondary">
            Already registered? <Link to="/login" className="font-bold text-accent-goldLight hover:underline">Sign In</Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default RegisterWorker;
