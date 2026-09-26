import { getImageUrl } from '../../utils/imageUtils';
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
        className="fixed top-4 sm:top-6 left-4 sm:left-6 z-20 flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-white/90 backdrop-blur-xl rounded-full border border-white/60 shadow-sm hover:shadow-md transition-all text-text-primary text-[10px] sm:text-[11px] font-black uppercase tracking-widest"
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

        <GlassCard goldBorder className="!bg-white/80 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl shadow-sm border-white/60">
          {step <= 5 && (
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              {['Info', 'Skills', 'Place', 'Verify', 'Secret'].map((sName, idx) => (
                <div key={sName} className="flex items-center gap-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${step === idx + 1 ? 'bg-accent-main text-white shadow-xs' : step > idx + 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-text-muted'}`}>
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
              <FloatingInput id="password" type="password" label="Create Password" icon={Lock} value={formData.password} onChange={handleChange} required />
              <PremiumButton type="submit" variant="gold" fullWidth icon={ArrowRight}>Next: Your Work</PremiumButton>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleNextStep2} className="space-y-4">
              <FloatingInput id="profession" label="Profession (e.g. Electrician)" icon={Wrench} value={formData.profession} onChange={handleChange} required />
              <select id="category" value={formData.category} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-accent-main text-text-primary">
                <option value="" className="bg-white">Select Category (Optional)</option>
                {categories.map(c => <option key={c._id} value={c._id} className="bg-white">{c.name}</option>)}
              </select>
              <div className="grid grid-cols-1 gap-4">
                <FloatingInput id="experience" type="number" label="Experience (Years)" value={formData.experience} onChange={handleChange} required />
              </div>
              <div className="flex gap-3">
                <PremiumButton type="button" onClick={() => { setError(''); setStep(1); }} variant="outline" className="flex-1">Back</PremiumButton>
                <PremiumButton type="submit" variant="gold" className="flex-[2]">Next: Address</PremiumButton>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleNextStep3} className="space-y-4">
              <FloatingInput id="street" label="Street Name" icon={MapPin} value={formData.street} onChange={handleChange} required />
              <div className="grid grid-cols-2 gap-4">
                <FloatingInput id="city" label="City" value={formData.city} onChange={handleChange} required />
                <FloatingInput id="state" label="State" value={formData.state} onChange={handleChange} required />
              </div>
              <FloatingInput id="zip" label="Pin Code" value={formData.zip} onChange={handleChange} required />
              <div className="flex gap-3">
                <PremiumButton type="button" onClick={() => { setError(''); setStep(2); }} variant="outline" className="flex-1">Back</PremiumButton>
                <PremiumButton type="submit" variant="gold" className="flex-[2]">Next: Verification</PremiumButton>
              </div>
            </form>
          )}

          {step === 4 && (
            <form onSubmit={handleNextStep4} className="space-y-6">
              <div className="text-center">
                <h3 className="font-sora font-black text-text-primary mb-1 uppercase tracking-tight">Identity Verification</h3>
                <p className="text-[11px] text-text-secondary leading-relaxed font-semibold uppercase tracking-wider mb-4">Upload a photo of your ID Card (e.g. Aadhaar, PAN) or a photo of you working at a job site.</p>
              </div>

              <div className="space-y-4">
                <div className={`relative border-2 border-dashed rounded-[2rem] p-6 text-center transition-all ${idFile ? 'border-accent-main bg-blue-50/50' : 'border-gray-200 hover:border-accent-main'}`}>
                  {idPreview ? (
                    <div className="space-y-3">
                       <img src={getImageUrl(idPreview)} alt="ID Preview" className="max-h-40 mx-auto rounded-xl shadow-xs border border-gray-200" />
                       <button type="button" onClick={() => { setIdFile(null); setIdPreview(''); }} className="text-[10px] font-black text-red-500 uppercase tracking-wider hover:underline">Remove & Reselect</button>
                    </div>
                  ) : (
                    <label htmlFor="id-upload" className="cursor-pointer space-y-3 block">
                       <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto border border-blue-100 shadow-xs">
                          <Upload className="w-7 h-7 text-accent-main" />
                       </div>
                       <div>
                          <p className="text-xs font-black text-text-primary uppercase tracking-wider">Select ID Image</p>
                          <p className="text-[9px] text-text-muted mt-0.5 uppercase font-bold">JPG, PNG allowed (Max 5MB)</p>
                       </div>
                       <input type="file" id="id-upload" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <PremiumButton type="button" onClick={() => { setError(''); setStep(3); }} variant="outline" className="flex-1">Back</PremiumButton>
                <PremiumButton type="submit" variant="gold" className="flex-[2]">Next: Security</PremiumButton>
              </div>
            </form>
          )}

          {step === 5 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center">
                <h3 className="font-sora font-black text-text-primary mb-1 uppercase tracking-tight">Recover Your Account</h3>
                <p className="text-[11px] text-text-secondary leading-relaxed font-semibold uppercase tracking-wider">Set a secret word to get back into your account if you forget your password.</p>
              </div>

              <div className="pt-2">
                <FloatingInput
                  id="registerHint"
                  type="text"
                  label="Enter your secret word"
                  icon={ShieldCheck}
                  value={formData.registerHint}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <PremiumButton type="button" onClick={() => { setError(''); setStep(4); }} variant="outline" className="flex-1">Back</PremiumButton>
                <PremiumButton type="submit" variant="gold" className="flex-[2]" loading={loading}>Submit Application</PremiumButton>
              </div>
            </form>
          )}

          {step === 6 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                 <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-sora font-black text-xl text-text-primary mb-2 uppercase tracking-tight">WE RECEIVED YOUR APPLICATION!</h3>
              <p className="text-xs font-semibold text-text-muted mb-6 leading-relaxed max-w-[280px] mx-auto uppercase tracking-wider">Our team is reviewing your profile and identity proof. You'll get an email once your account is approved.</p>
              <Link to="/login"><PremiumButton variant="gold" size="lg" fullWidth>BACK TO LOGIN</PremiumButton></Link>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-text-muted font-bold uppercase tracking-widest">
            Already registered? <Link to="/login" className="text-accent-main hover:underline">Sign In</Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default RegisterWorker;
