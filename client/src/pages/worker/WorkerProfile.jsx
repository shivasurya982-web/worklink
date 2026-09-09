import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import FloatingInput from '../../components/common/FloatingInput';
import PremiumButton from '../../components/common/PremiumButton';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { User, Phone, MapPin, Wrench, DollarSign, Camera, LogOut, Mail, Lock, ShieldCheck, Edit3, X, Briefcase, ChevronDown, Sparkles } from 'lucide-react';
import API from '../../services/api';

const WorkerProfile = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [securityHint, setSecurityHint] = useState('');
  const [profession, setProfession] = useState('');
  const [category, setCategory] = useState('');
  const [suggestedCategory, setSuggestedCategory] = useState('');
  const [experience, setExperience] = useState('');
  const [description, setDescription] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    fetchProfileDetails();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/categories');
      if (res.success) {
        setCategories(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchProfileDetails = async () => {
    try {
      const res = await API.get('/workers/profile');
      if (res.success && res.data.worker) {
        const w = res.data.worker;
        setName(w.name || '');
        setEmail(w.email || '');
        setPhone(w.phone || '');
        setWhatsapp(w.whatsapp || '');
        setSecurityHint(w.securityHint || '');
        setProfession(w.profession || '');
        setCategory(w.category?._id || w.category || (w.suggestedCategory ? 'other' : ''));
        setSuggestedCategory(w.suggestedCategory || '');
        setExperience(w.experience?.toString() || '0');
        setDescription(w.description || '');
        setHourlyRate(w.pricing?.hourly?.toString() || '0');
        setStreet(w.address?.street || '');
        setCity(w.address?.city || '');
        setState(w.address?.state || '');
        setZip(w.address?.zip || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('whatsapp', whatsapp);
      formData.append('securityHint', securityHint);
      formData.append('profession', profession);
      formData.append('category', category);
      formData.append('suggestedCategory', suggestedCategory);
      formData.append('experience', experience);
      formData.append('description', description);
      formData.append('pricing', JSON.stringify({ hourly: parseInt(hourlyRate), minimum: 200, currency: '₹' }));
      formData.append('address', JSON.stringify({ street, city, state, zip }));
      if (avatarFile) formData.append('avatar', avatarFile);
      if (coverFile) formData.append('coverImage', coverFile);

      const res = await API.put('/workers/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.success) {
        updateUserProfile(res.data.worker);
        showToast('Profile Synced', 'Node parameters updated.', 'success');
        setIsEditingProfile(false);
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Mismatch', 'Security keys do not match.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Too Short', 'Key must be at least 6 characters.', 'error');
      return;
    }
    setPwLoading(true);
    try {
      const res = await API.put('/auth/change-password', { currentPassword, newPassword });
      if (res.success) {
        showToast('Key Rotated', 'Success! Resetting terminal...', 'success');
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      showToast('Error', err.message || 'Rotation failed', 'error');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <DashboardLayout title="Professional Config" subtitle="Manage node parameters and security protocols">
      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-2 border-accent-bright border-t-transparent shadow-orange" /></div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-8 pb-24">

          {/* Professional Profile Card */}
          <GlassCard goldBorder className="!bg-background-card p-6 sm:p-10 rounded-[2.5rem] shadow-2xl overflow-hidden border-border-primary/40 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-orange/5 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-10 pb-5 border-b border-white/5 relative z-10">
              <h3 className="font-sora font-black text-xl text-white flex items-center gap-3 uppercase tracking-tighter">
                <Briefcase className="w-6 h-6 text-accent-bright" /> NODE IDENTITY
              </h3>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className={`p-3 rounded-2xl transition-all shadow-xl ${isEditingProfile ? 'bg-red-950/20 text-red-400 border border-red-500/20' : 'bg-background-widget text-accent-bright border border-white/5'}`}
              >
                {isEditingProfile ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
              </button>
            </div>

            {!isEditingProfile ? (
              <div className="space-y-10 animate-fade-in relative z-10">
                <div className="flex flex-col items-center sm:items-start gap-6 mb-4">
                   <div className="flex gap-6 items-end flex-wrap justify-center sm:justify-start">
                      <div className="relative group">
                         <img
                          src={avatarFile ? URL.createObjectURL(avatarFile) : user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F4510B&color=fff`}
                          className="w-28 h-28 rounded-[2rem] object-cover border-4 border-accent-main shadow-2xl group-hover:scale-105 transition-all duration-500"
                         />
                         <div className="absolute inset-0 bg-accent-orange/10 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="pb-2 text-center sm:text-left">
                         <h4 className="font-sora font-black text-3xl text-white tracking-tighter uppercase">{name}</h4>
                         <p className="text-sm font-black text-accent-bright uppercase tracking-widest mt-2">{profession}</p>
                      </div>
                   </div>
                   {user?.coverImage && (
                     <div className="w-full h-32 rounded-[2rem] overflow-hidden border-2 border-white/5 shadow-inner group">
                        <img src={user.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" />
                     </div>
                   )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                   <div className="p-5 bg-background-dark/50 rounded-[2rem] border border-white/5 shadow-inner">
                      <p className="text-[9px] font-black text-accent-bright uppercase tracking-widest mb-2">Primary Identifier</p>
                      <p className="text-sm font-bold text-white truncate">{email}</p>
                   </div>
                   <div className="p-5 bg-background-dark/50 rounded-[2rem] border border-white/5 shadow-inner">
                      <p className="text-[9px] font-black text-accent-bright uppercase tracking-widest mb-2">Market Rates</p>
                      <p className="text-sm font-bold text-white uppercase">₹{hourlyRate}/HR • {experience} CYCLES</p>
                   </div>
                   <div className="p-5 bg-background-dark/50 rounded-[2rem] border border-white/5 shadow-inner">
                      <p className="text-[9px] font-black text-accent-bright uppercase tracking-widest mb-2">Service Domain</p>
                      <p className="text-sm font-bold text-white uppercase">
                        {category === 'other'
                          ? `Custom: ${suggestedCategory}`
                          : categories.find(c => c._id === category || c.slug === category)?.name || 'UNASSIGNED'}
                      </p>
                   </div>
                   <div className="p-5 bg-background-dark/50 rounded-[2rem] border border-white/5 shadow-inner">
                      <p className="text-[9px] font-black text-accent-bright uppercase tracking-widest mb-2">Comms Frequency</p>
                      <p className="text-sm font-bold text-white uppercase">{phone} {whatsapp && `• WA: ${whatsapp}`}</p>
                   </div>
                   <div className="p-5 bg-background-dark/50 rounded-[2rem] border border-white/5 shadow-inner">
                      <p className="text-[9px] font-black text-accent-bright uppercase tracking-widest mb-2">Security Hint</p>
                      <p className="text-sm font-bold text-white uppercase italic">"{securityHint || 'NULL'}"</p>
                   </div>
                   <div className="p-5 bg-background-dark/50 rounded-[2rem] border border-white/5 shadow-inner sm:col-span-2">
                      <p className="text-[9px] font-black text-accent-bright uppercase tracking-widest mb-2">Operational Base</p>
                      <p className="text-sm font-bold text-white uppercase tracking-tighter">{street}, {city}, {state} - {zip}</p>
                   </div>
                   {description && (
                     <div className="p-6 bg-accent-orange/5 rounded-[2rem] sm:col-span-2 border border-accent-orange/20 shadow-inner">
                        <p className="text-[9px] font-black text-accent-bright uppercase tracking-widest mb-3">Professional Brief</p>
                        <p className="text-sm text-text-secondary leading-relaxed font-bold italic opacity-90">"{description}"</p>
                     </div>
                   )}
                </div>

                <PremiumButton
                  variant="outline"
                  fullWidth
                  onClick={() => setIsEditingProfile(true)}
                  className="py-5 font-black uppercase tracking-widest text-[11px] !rounded-2xl"
                >
                   <Edit3 className="w-4 h-4 mr-2" /> Modify Node Dataset
                </PremiumButton>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-10 animate-slide-up relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pb-8 border-b border-white/5">
                  <div className="flex flex-col items-center text-center gap-4">
                    <img src={avatarFile ? URL.createObjectURL(avatarFile) : user?.avatar || 'https://placehold.co/100'} className="w-28 h-28 rounded-[2rem] object-cover border-4 border-accent-main shadow-2xl" />
                    <input type="file" id="avatar-worker" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} className="hidden" />
                    <label htmlFor="avatar-worker" className="cursor-pointer px-5 py-2.5 bg-background-widget text-accent-bright rounded-2xl text-[10px] font-black border border-white/5 hover:bg-background-secondary transition-all inline-flex items-center gap-2 uppercase tracking-widest shadow-xl"><Camera className="w-4 h-4" /> Avatar Node</label>
                  </div>
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-full h-28 bg-background-dark rounded-[2rem] overflow-hidden border-2 border-white/5 shadow-inner"><img src={coverFile ? URL.createObjectURL(coverFile) : user?.coverImage || 'https://placehold.co/300x120'} className="w-full h-full object-cover" /></div>
                    <input type="file" id="cover-worker" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} className="hidden" />
                    <label htmlFor="cover-worker" className="cursor-pointer px-5 py-2.5 bg-background-widget text-accent-bright rounded-2xl text-[10px] font-black border border-white/5 hover:bg-background-secondary transition-all inline-flex items-center gap-2 uppercase tracking-widest shadow-xl"><Camera className="w-4 h-4" /> Cover Module</label>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="font-sora font-black text-sm text-white uppercase tracking-widest border-l-4 border-accent-bright pl-4 mb-8">Service Parameters</h4>
                  <FloatingInput id="email" label="Identifier (Email)" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} required className="!bg-background-dark/50 border-border-primary/30" />
                  <FloatingInput id="name" label="Full Designation" icon={User} value={name} onChange={(e) => setName(e.target.value)} required className="!bg-background-dark/50 border-border-primary/30" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FloatingInput id="profession" label="Core Profession" icon={Wrench} value={profession} onChange={(e) => setProfession(e.target.value)} required className="!bg-background-dark/50 border-border-primary/30" />
                    <div className="relative group">
                      <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-background-dark/50 border-2 border-border-primary/30 rounded-2xl px-5 py-4.5 text-sm font-bold focus:outline-none focus:border-accent-main transition-all text-white appearance-none uppercase tracking-widest"
                        required
                      >
                        <option value="" className="bg-background-card">Select Domain</option>
                        {categories.map(c => <option key={c._id} value={c._id} className="bg-background-card">{c.name}</option>)}
                        <option value="other" className="bg-background-card font-black text-accent-bright">+ CUSTOM NODE</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted group-focus-within:text-accent-bright transition-colors">
                        <ChevronDown className="w-5 h-5" />
                      </div>
                      <label className="absolute -top-3 left-4 bg-background-cardSecondary px-2 py-0.5 text-[10px] font-black text-accent-light rounded-lg">SEGMENT</label>
                    </div>
                  </div>

                  {category === 'other' && (
                    <div className="animate-fade-in pt-2">
                       <FloatingInput
                        id="suggestedCategory"
                        label="Define New Domain Segment"
                        icon={Sparkles}
                        value={suggestedCategory}
                        onChange={(e) => setSuggestedCategory(e.target.value)}
                        required
                        className="!bg-background-dark/50 border-border-primary/30"
                       />
                    </div>
                  )}

                  <div className="pt-4">
                    <label className="text-[10px] font-black text-accent-bright uppercase tracking-[0.3em] ml-2 mb-3 block">Security Token</label>
                    <FloatingInput id="securityHint" icon={ShieldCheck} value={securityHint} onChange={(e) => setSecurityHint(e.target.value)} required className="!bg-background-dark/50 border-border-primary/30" />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <FloatingInput id="experience" type="number" label="Cycles (Yrs)" value={experience} onChange={(e) => setExperience(e.target.value)} required className="!bg-background-dark/50 border-border-primary/30" />
                    <FloatingInput id="hourlyRate" type="number" label="Rate (₹/Hr)" icon={DollarSign} value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} required className="!bg-background-dark/50 border-border-primary/30" />
                  </div>
                  <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="PROFESSIONAL BRIEF / BIO..." className="w-full bg-background-dark/50 border-2 border-border-primary/30 rounded-[2rem] p-6 text-sm font-bold focus:outline-none focus:border-accent-main text-white shadow-inner uppercase tracking-wider" />
                </div>

                <div className="space-y-6 pt-8 border-t border-white/5">
                  <h4 className="font-sora font-black text-sm text-white uppercase tracking-widest border-l-4 border-accent-bright pl-4 mb-8">Spatial Metadata</h4>
                  <FloatingInput id="street" label="Street Node" icon={MapPin} value={street} onChange={(e) => setStreet(e.target.value)} required className="!bg-background-dark/50 border-border-primary/30" />
                  <div className="grid grid-cols-2 gap-5">
                    <FloatingInput id="city" label="City" value={city} onChange={(e) => setCity(e.target.value)} required className="!bg-background-dark/50 border-border-primary/30" />
                    <FloatingInput id="state" label="Region" value={state} onChange={(e) => setState(e.target.value)} required className="!bg-background-dark/50 border-border-primary/30" />
                  </div>
                  <FloatingInput id="zip" label="Postal Index" value={zip} onChange={(e) => setZip(e.target.value)} required className="!bg-background-dark/50 border-border-primary/30" />
                </div>

                <div className="grid grid-cols-2 gap-5 pt-8 border-t border-white/5">
                  <FloatingInput id="phone" label="Primary Comms" icon={Phone} value={phone} onChange={(e) => setPhone(e.target.value)} required className="!bg-background-dark/50 border-border-primary/30" />
                  <FloatingInput id="whatsapp" label="Encrypted Comms" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="!bg-background-dark/50 border-border-primary/30" />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-8">
                   <PremiumButton type="button" variant="outline" fullWidth onClick={() => setIsEditingProfile(false)} className="py-4 !rounded-2xl">Abort</PremiumButton>
                   <PremiumButton type="submit" variant="gold" size="lg" fullWidth loading={saving} className="py-4 !rounded-2xl shadow-orange">Sync Parameters</PremiumButton>
                </div>
              </form>
            )}
          </GlassCard>

          {/* Change Password Card */}
          <GlassCard className="!bg-background-cardSecondary p-6 sm:p-10 rounded-[2.5rem] shadow-2xl border border-border-primary/20 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent-orange/5 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-background-dark flex items-center justify-center border border-white/5 shadow-xl">
                   <Lock className="w-6 h-6 text-accent-bright" />
                </div>
                <h3 className="font-sora font-black text-xl text-white uppercase tracking-tighter">Security Protocols</h3>
              </div>
              {!isEditingPassword && (
                <button
                  onClick={() => setIsEditingPassword(true)}
                  className="px-5 py-2.5 rounded-xl border border-accent-orange/30 text-[10px] font-black text-accent-bright hover:bg-accent-orange/10 transition-all uppercase tracking-widest shadow-lg"
                >
                  Rotate Keys
                </button>
              )}
            </div>

            {!isEditingPassword ? (
               <p className="text-xs font-bold text-text-muted uppercase tracking-widest leading-relaxed opacity-70">ROTATE SYSTEM ACCESS KEYS PERIODICALLY TO ENSURE CRYPTOGRAPHIC INTEGRITY OF YOUR PROFESSIONAL TERMINAL.</p>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-8 animate-slide-up mt-8 relative z-10">
                <div className="space-y-6 pt-6 border-t border-white/5">
                  <FloatingInput id="wCurrentPassword" label="Current Key" type="password" icon={Lock} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="!bg-background-card border-border-primary/20" />
                  <FloatingInput id="wNewPassword" label="New Key" type="password" icon={Lock} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="!bg-background-card border-border-primary/20" />
                  <FloatingInput id="wConfirmPassword" label="Verify New Key" type="password" icon={Lock} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="!bg-background-card border-border-primary/20" />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                   <PremiumButton type="button" variant="outline" fullWidth onClick={() => setIsEditingPassword(false)} className="py-4 !rounded-2xl">Abort</PremiumButton>
                   <PremiumButton type="submit" variant="gold" fullWidth loading={pwLoading} icon={Lock} className="py-4 !rounded-2xl shadow-orange">
                      Execute Rotation
                   </PremiumButton>
                </div>
              </form>
            )}
          </GlassCard>

          <div className="lg:hidden px-4 pt-6">
            <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] text-xs font-black text-red-400 bg-red-950/20 border-2 border-red-500/20 shadow-2xl uppercase tracking-widest">
              <LogOut className="w-6 h-6" /> Terminate Session
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default WorkerProfile;
