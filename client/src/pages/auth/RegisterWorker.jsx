import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Wrench, MapPin, Upload, CheckCircle2, ArrowRight, ShieldCheck, Home } from 'lucide-react';
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
    description: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    registerHint: '',
    securityHint: '',
  });

  const [idFile, setIdFile] = useState(null);
  const [idPreview, setIdPreview] = useState('');

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdFile(file);
      setIdPreview(URL.createObjectURL(file));
    }
  };

  const handleNextStep1 = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.password.trim()) {
      setError('Please fill in all details (Name, Email, Phone, Password).');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleNextStep2 = (e) => {
    e.preventDefault();
    if (!formData.profession.trim()) {
      setError('Please enter what kind of work you do.');
      return;
    }
    setError('');
    setStep(3);
  };

  const handleNextStep3 = (e) => {
    e.preventDefault();
    if (!formData.street.trim() || !formData.city.trim() || !formData.state.trim()) {
      setError('Please fill in your address (Street, City, State).');
      return;
    }
    setError('');
    setStep(4);
  };

  const handleNextStep4 = (e) => {
    e.preventDefault();
    if (!idFile) {
      setError('Please upload an Identity Proof (e.g. Aadhaar Card).');
      return;
    }
    setError('');
    setStep(5);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hintVal = formData.registerHint || formData.securityHint;
    if (!hintVal || !hintVal.trim()) {
      setError('Please set a recovery word.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const data = new FormData();

      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('password', formData.password);
      data.append('profession', formData.profession);
      data.append('category', formData.category);
      data.append('experience', formData.experience);
      data.append('description', formData.description);
      data.append('street', formData.street);
      data.append('city', formData.city);
      data.append('state', formData.state);
      data.append('zip', formData.zip);
      data.append('securityHint', hintVal.trim());

      if (idFile) {
        data.append('identityProof', idFile);
      }

      const res = await registerWorker(data);
      if (res.success) {
        showToast('Application Sent', 'Your account is being reviewed.', 'success');
        setStep(6);
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4 sm:p-6 pt-24 sm:pt-28 relative overflow-hidden">
      {/* Home Button */}
      <Link
        to="/"
        className="fixed top-4 sm:top-6 left-4 sm:left-6 z-20 flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-white/90 backdrop-blur-xl rounded-full border border-white/75 shadow-sm hover:shadow-md transition-all text-text-primary text-[10px] sm:text-[11px] font-black uppercase tracking-widest"
      >
        <Home className="w-4 h-4 text-accent-main" />
        <span>Home</span>
      </Link>

      <div className="max-w-xl w-full relative z-10 my-auto pb-10">
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <img src="/logo.png" alt="Worklyn Logo" className="h-10 sm:h-12 w-auto object-contain mx-auto" />
          </Link>
          <p className="text-xs text-text-secondary font-bold uppercase tracking-widest">Worker Registration</p>
        </div>

        <GlassCard orangeBorder className="!bg-white/80 backdrop-blur-3xl p-6 sm:p-8 rounded-[2.5rem] shadow-md border-white/80">
          {step <= 5 && (
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              {['Info', 'Skills', 'Place', 'Verify', 'Secret'].map((sName, idx) => (
                <div key={sName} className="flex items-center gap-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${step === idx + 1 ? 'bg-gradient-to-b from-[#2C2C2E] to-[#1C1C1E] text-white shadow-xs' : step > idx + 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-text-muted'}`}>
                    {step > idx + 1 ? '✓' : idx + 1}
                  </div>
                  <span className={`text-[9px] font-bold uppercase hidden sm:inline ${step === idx + 1 ? 'text-accent-main' : 'text-text-muted'}`}>{sName}</span>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-600 font-bold text-center uppercase">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-4">
              <FloatingInput id="name" label="Full Name" icon={User} value={formData.name} onChange={handleChange} required />
              <FloatingInput id="email" type="email" label="Email Address" icon={Mail} value={formData.email} onChange={handleChange} required />
              <FloatingInput id="phone" type="tel" label="Phone Number" icon={Phone} value={formData.phone} onChange={handleChange} required />
              <FloatingInput id="password" type="password" label="Password" icon={Lock} value={formData.password} onChange={handleChange} required />
              <PremiumButton type="submit" variant="black" fullWidth icon={ArrowRight} className="py-3.5">
                CONTINUE
              </PremiumButton>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleNextStep2} className="space-y-4">
              <FloatingInput id="profession" label="Profession (e.g. Electrician, Plumber)" icon={Wrench} value={formData.profession} onChange={handleChange} required />
              <div>
                <label className="text-[10px] font-black text-accent-main uppercase tracking-widest ml-1 mb-1 block">Category</label>
                <select id="category" value={formData.category} onChange={handleChange} className="w-full bg-white/60 border border-white/75 rounded-2xl p-3.5 text-xs font-bold text-text-primary focus:outline-none focus:border-accent-main shadow-xs">
                  <option value="">-- Select Main Category --</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <FloatingInput id="experience" type="number" label="Years of Experience" value={formData.experience} onChange={handleChange} required />
              <div className="flex gap-3 pt-2">
                <PremiumButton type="button" variant="outline" onClick={() => setStep(1)} className="py-3 flex-1">BACK</PremiumButton>
                <PremiumButton type="submit" variant="black" icon={ArrowRight} className="py-3 flex-[2]">CONTINUE</PremiumButton>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleNextStep3} className="space-y-4">
              <FloatingInput id="street" label="Street / Area" icon={MapPin} value={formData.street} onChange={handleChange} required />
              <FloatingInput id="city" label="City" value={formData.city} onChange={handleChange} required />
              <div className="grid grid-cols-2 gap-3">
                <FloatingInput id="state" label="State" value={formData.state} onChange={handleChange} required />
                <FloatingInput id="zip" label="Pincode" value={formData.zip} onChange={handleChange} required />
              </div>
              <div className="flex gap-3 pt-2">
                <PremiumButton type="button" variant="outline" onClick={() => setStep(2)} className="py-3 flex-1">BACK</PremiumButton>
                <PremiumButton type="submit" variant="black" icon={ArrowRight} className="py-3 flex-[2]">CONTINUE</PremiumButton>
              </div>
            </form>
          )}

          {step === 4 && (
            <form onSubmit={handleNextStep4} className="space-y-4">
              <div className="text-center mb-2">
                <h4 className="font-sora font-black text-sm uppercase text-text-primary">Identity Document</h4>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Aadhaar, PAN, or Govt ID</p>
              </div>
              <div className="relative border-2 border-dashed border-orange-200/80 rounded-[2rem] p-6 text-center bg-orange-50/30">
                <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                {idPreview ? (
                  <img src={idPreview} alt="Preview" className="max-h-40 mx-auto rounded-xl object-contain shadow-xs" />
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-accent-main mx-auto mb-2" />
                    <p className="text-xs font-bold text-text-primary uppercase">Click to upload ID image</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <PremiumButton type="button" variant="outline" onClick={() => setStep(3)} className="py-3 flex-1">BACK</PremiumButton>
                <PremiumButton type="submit" variant="black" icon={ArrowRight} className="py-3 flex-[2]">CONTINUE</PremiumButton>
              </div>
            </form>
          )}

          {step === 5 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center mb-2">
                <h4 className="font-sora font-black text-sm uppercase text-text-primary">Set Recovery Word</h4>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Required for account recovery</p>
              </div>
              <FloatingInput id="registerHint" label="Enter a secret word" icon={ShieldCheck} value={formData.registerHint} onChange={handleChange} required />
              <div className="flex gap-3 pt-2">
                <PremiumButton type="button" variant="outline" onClick={() => setStep(4)} className="py-3 flex-1">BACK</PremiumButton>
                <PremiumButton type="submit" variant="black" loading={loading} icon={CheckCircle2} className="py-3 flex-[2]">SUBMIT APPLICATION</PremiumButton>
              </div>
            </form>
          )}

          {step === 6 && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-sora font-black text-xl text-text-primary uppercase">APPLICATION RECEIVED!</h3>
                <p className="text-xs text-text-secondary font-bold uppercase tracking-wider leading-relaxed">Your worker profile has been submitted for review. Admin will approve your account shortly.</p>
              </div>
              <PremiumButton variant="black" fullWidth onClick={() => navigate('/login')} className="py-3.5">GO TO LOGIN</PremiumButton>
            </div>
          )}

          <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-text-muted font-bold uppercase tracking-widest">
              Already registered? <Link to="/login" className="text-accent-main hover:underline">Sign In</Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default RegisterWorker;
