import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import FloatingInput from '../../components/common/FloatingInput';
import PremiumButton from '../../components/common/PremiumButton';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { User, Phone, MapPin, Wrench, DollarSign, Camera, LogOut, Mail, Lock, ShieldCheck, Edit3, X, Briefcase, ChevronDown, Sparkles, Upload, AlertTriangle, CheckSquare } from 'lucide-react';
import API from '../../services/api';

const WorkerProfile = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Profile fields state
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
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [idFile, setIdFile] = useState(null);
  const [idPreview, setIdPreview] = useState('');

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
    setLoading(true);
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
        setStreet(w.address?.street || '');
        setCity(w.address?.city || '');
        setState(w.address?.state || '');
        setZip(w.address?.zip || '');
        setIdPreview(w.identityProof || '');
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Could not load your profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleIdFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdFile(file);
      setIdPreview(URL.createObjectURL(file));
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
      formData.append('address', JSON.stringify({ street, city, state, zip }));
      if (avatarFile) formData.append('avatar', avatarFile);
      if (coverFile) formData.append('coverImage', coverFile);
      if (idFile) formData.append('identityProof', idFile);

      const res = await API.put('/workers/profile', formData);
      if (res.success) {
        updateUserProfile(res.data.worker);
        showToast('Success', 'Your profile has been updated.', 'success');
        setIsEditingProfile(false);
        setIdFile(null);
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
      showToast('Error', 'New passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Error', 'Password must be at least 6 characters.', 'error');
      return;
    }
    setPwLoading(true);
    try {
      const res = await API.put('/auth/change-password', { currentPassword, newPassword });
      if (res.success) {
        showToast('Success', 'Password changed successfully. Please login again.', 'success');
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      showToast('Error', err.message || 'Change failed', 'error');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <DashboardLayout title="My Profile" subtitle="Manage your personal info and work details">
      {loading ? (
        <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-12 w-12 border-2 border-accent-bright border-t-transparent shadow-orange" /></div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-10 pb-24">

          {/* Profile Details Card */}
          <GlassCard goldBorder className="!bg-background-card p-6 sm:p-12 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent-orange/5 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-12 pb-6 border-b border-white/5 relative z-10">
              <h3 className="font-sora font-black text-xl sm:text-2xl text-white flex items-center gap-4 uppercase tracking-tighter">
                <User className="w-7 h-7 text-accent-bright" /> MY INFO
              </h3>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className={`p-3.5 rounded-2xl transition-all shadow-xl ${isEditingProfile ? 'bg-red-950/20 text-red-400 border border-red-500/20' : 'bg-background-widget text-accent-bright border border-white/5'}`}
              >
                {isEditingProfile ? <X className="w-6 h-6" /> : <Edit3 className="w-6 h-6" />}
              </button>
            </div>

            {!isEditingProfile ? (
              <div className="space-y-12 animate-fade-in relative z-10">
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-8 mb-4">
                  <div className="relative group shrink-0">
                     <img
                      src={getImageUrl(user?.avatar, DEFAULT_AVATAR(name || 'User'))} onError={(e) => handleImageError(e, DEFAULT_AVATAR(name || 'User'))}
                      className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] object-cover border-4 border-accent-main shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-all duration-700"
                      alt={name}
                     />
                     <div className="absolute inset-0 bg-accent-orange/10 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="pb-2 text-center sm:text-left flex-1">
                     <h4 className="font-sora font-black text-3xl md:text-5xl text-white tracking-tighter uppercase">{name || 'Your Name'}</h4>
                     <p className="text-sm md:text-lg font-black text-accent-bright uppercase tracking-[0.2em] mt-3 opacity-90">{profession || 'Profession'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                   <div className="p-6 bg-background-dark/50 rounded-[2rem] border border-white/5 shadow-inner group hover:border-accent-orange/30 transition-all">
                      <p className="text-[10px] font-black text-accent-bright uppercase tracking-widest mb-3 flex items-center gap-2"><Mail className="w-4 h-4" /> Email</p>
                      <p className="text-sm font-bold text-white truncate">{email}</p>
                   </div>
                   <div className="p-6 bg-background-dark/50 rounded-[2rem] border border-white/5 shadow-inner group hover:border-accent-orange/30 transition-all">
                      <p className="text-[10px] font-black text-accent-bright uppercase tracking-widest mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Pricing</p>
                      <p className="text-[10px] font-bold text-white uppercase tracking-tight">Price varies by work • {experience} YEARS EXP</p>
                   </div>
                   <div className="p-6 bg-background-dark/50 rounded-[2rem] border border-white/5 shadow-inner group hover:border-accent-orange/30 transition-all">
                      <p className="text-[10px] font-black text-accent-bright uppercase tracking-widest mb-3 flex items-center gap-2"><Wrench className="w-4 h-4" /> Category</p>
                      <p className="text-sm font-bold text-white uppercase truncate">
                        {category === 'other'
                          ? `${suggestedCategory}`
                          : categories.find(c => c._id === category || c.slug === category)?.name || 'None'}
                      </p>
                   </div>
                   <div className="p-6 bg-background-dark/50 rounded-[2rem] border border-white/5 shadow-inner group hover:border-accent-orange/30 transition-all lg:col-span-2">
                      <p className="text-[10px] font-black text-accent-bright uppercase tracking-widest mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" /> My Address</p>
                      <p className="text-sm font-bold text-white uppercase tracking-tighter truncate">{street}, {city}, {state} , PIN: {zip}</p>
                   </div>
                   <div className="p-6 bg-background-dark/50 rounded-[2rem] border border-white/5 shadow-inner group hover:border-accent-orange/30 transition-all">
                      <p className="text-[10px] font-black text-accent-bright uppercase tracking-widest mb-3 flex items-center gap-2"><Phone className="w-4 h-4" /> Phone</p>
                      <p className="text-sm font-bold text-white truncate">{phone}</p>
                   </div>
                </div>

                {description && (
                  <div className="p-8 bg-accent-orange/5 rounded-[2.5rem] border border-accent-orange/20 shadow-inner">
                     <p className="text-[10px] font-black text-accent-bright uppercase tracking-widest mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4" /> About Me</p>
                     <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-bold italic opacity-90">"{description}"</p>
                  </div>
                )}

                <div className="p-8 bg-background-dark/50 rounded-[2.5rem] border border-white/5 shadow-inner">
                   <p className="text-[10px] font-black text-accent-bright uppercase tracking-widest mb-4 flex items-center gap-2"><CheckSquare className="w-4 h-4" /> Verification Document</p>
                   {idPreview ? (
                      <div className="relative group rounded-[2rem] overflow-hidden border-2 border-border-primary/30 max-w-sm">
                         <img src={getImageUrl(idPreview)} alt="Identity Proof" className="w-full h-48 object-cover transition-transform group-hover:scale-105" />
                         <div className="absolute inset-0 bg-accent-orange/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                   ) : (
                      <div className="p-10 border-2 border-dashed border-white/10 rounded-[2rem] text-center">
                         <AlertTriangle className="w-8 h-8 text-accent-orange mx-auto mb-3 opacity-40" />
                         <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">No verification document uploaded yet.</p>
                      </div>
                   )}
                </div>

                <PremiumButton
                  variant="outline"
                  fullWidth
                  onClick={() => setIsEditingProfile(true)}
                  className="py-5 font-black uppercase tracking-widest text-xs !rounded-2xl border-2"
                >
                   <Edit3 className="w-5 h-5 mr-3" /> EDIT MY PROFILE
                </PremiumButton>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-12 animate-slide-up relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pb-10 border-b border-white/5">
                  <div className="flex flex-col items-center text-center gap-5">
                    <img src={avatarFile ? URL.createObjectURL(avatarFile) : getImageUrl(user?.avatar, DEFAULT_AVATAR(name || 'U'))} onError={(e) => handleImageError(e, DEFAULT_AVATAR(name || 'U'))} className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-accent-main shadow-2xl" />
                    <input type="file" id="avatar-worker" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} className="hidden" />
                    <label htmlFor="avatar-worker" className="cursor-pointer px-6 py-3 bg-background-widget text-accent-bright rounded-2xl text-[10px] font-black border border-white/5 hover:bg-accent-orange hover:text-white transition-all inline-flex items-center gap-3 uppercase tracking-widest shadow-xl"><Camera className="w-5 h-5" /> CHANGE PHOTO</label>
                  </div>
                  <div className="flex flex-col items-center text-center gap-5">
                    <div className="w-full h-32 bg-background-dark rounded-[2.5rem] overflow-hidden border-2 border-white/5 shadow-inner"><img src={coverFile ? URL.createObjectURL(coverFile) : getImageUrl(user?.coverImage, DEFAULT_COVER)} onError={(e) => handleImageError(e, DEFAULT_COVER)} className="w-full h-full object-cover" /></div>
                    <input type="file" id="cover-worker" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} className="hidden" />
                    <label htmlFor="cover-worker" className="cursor-pointer px-6 py-3 bg-background-widget text-accent-bright rounded-2xl text-[10px] font-black border border-white/5 hover:bg-accent-orange hover:text-white transition-all inline-flex items-center gap-3 uppercase tracking-widest shadow-xl"><Camera className="w-5 h-5" /> CHANGE COVER</label>
                  </div>
                </div>

                <div className="space-y-8">
                  <h4 className="font-sora font-black text-sm text-white uppercase tracking-widest border-l-4 border-accent-bright pl-5 mb-10">Personal & Work Info</h4>
                  <FloatingInput id="email" label="Email Address" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} required className="!bg-background-dark/50" />
                  <FloatingInput id="name" label="Full Name" icon={User} value={name} onChange={(e) => setName(e.target.value)} required className="!bg-background-dark/50" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FloatingInput id="profession" label="Profession (e.g. Electrician)" icon={Wrench} value={profession} onChange={(e) => setProfession(e.target.value)} required className="!bg-background-dark/50" />
                    <div className="relative group">
                      <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-background-dark/50 border border-border-primary/40 rounded-2xl px-5 py-4 text-xs font-black focus:outline-none focus:border-accent-main transition-all text-white appearance-none uppercase tracking-widest"
                        required
                      >
                        <option value="" className="bg-background-card">Select Category</option>
                        {categories.map(c => <option key={c._id} value={c._id} className="bg-background-card">{c.name}</option>)}
                        <option value="other" className="bg-background-card font-black text-accent-bright">+ OTHER</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted group-focus-within:text-accent-bright transition-colors">
                        <ChevronDown className="w-5 h-5" />
                      </div>
                      <label className="absolute -top-3 left-4 bg-background-cardSecondary px-2 py-0.5 text-[10px] font-black text-accent-light rounded-lg">CATEGORY</label>
                    </div>
                  </div>

                  {category === 'other' && (
                    <div className="animate-fade-in pt-2">
                       <FloatingInput
                        id="suggestedCategory"
                        label="Enter your service type"
                        icon={Sparkles}
                        value={suggestedCategory}
                        onChange={(e) => setSuggestedCategory(e.target.value)}
                        required
                        className="!bg-background-dark/50"
                       />
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-6">
                    <FloatingInput id="experience" type="number" label="Years of Experience" value={experience} onChange={(e) => setExperience(e.target.value)} required className="!bg-background-dark/50" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-accent-light uppercase tracking-widest ml-1">About Me / Bio</label>
                    <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Write a few lines about your work and skills..." className="w-full bg-background-dark/50 border border-border-primary/40 rounded-[2rem] p-6 text-sm font-bold focus:outline-none focus:border-accent-main text-white shadow-inner uppercase tracking-wider" />
                  </div>
                </div>

                <div className="space-y-8 pt-10 border-t border-white/5">
                  <h4 className="font-sora font-black text-sm text-white uppercase tracking-widest border-l-4 border-accent-bright pl-5 mb-10">Verification Document</h4>
                  <div className={`relative border-2 border-dashed rounded-[2rem] p-8 text-center transition-all ${idFile ? 'border-accent-bright bg-accent-orange/5' : 'border-white/10 hover:border-accent-orange/40'}`}>
                    {idPreview ? (
                      <div className="space-y-4">
                         <img src={idFile ? URL.createObjectURL(idFile) : getImageUrl(idPreview)} alt="ID Preview" className="max-h-40 mx-auto rounded-xl shadow-2xl border border-white/10" />
                         <p className="text-[9px] font-black text-accent-bright uppercase tracking-widest">Selected for upload</p>
                      </div>
                    ) : (
                      <div className="py-4">
                         <Upload className="w-8 h-8 text-accent-bright mx-auto mb-3 opacity-40" />
                         <p className="text-xs font-black text-white uppercase tracking-widest">Click to upload ID Proof</p>
                      </div>
                    )}
                    <input type="file" id="id-upload-profile" accept="image/*" onChange={handleIdFileChange} className="hidden" />
                    <label htmlFor="id-upload-profile" className="absolute inset-0 cursor-pointer" />
                  </div>
                  <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest text-center">Identity proof is required for admin approval. Upload Aadhaar Card or any Govt ID.</p>
                </div>

                <div className="space-y-8 pt-10 border-t border-white/5">
                  <h4 className="font-sora font-black text-sm text-white uppercase tracking-widest border-l-4 border-accent-bright pl-5 mb-10">My Address</h4>
                  <FloatingInput id="street" label="Street Name" icon={MapPin} value={street} onChange={(e) => setStreet(e.target.value)} required className="!bg-background-dark/50" />
                  <div className="grid grid-cols-2 gap-6">
                    <FloatingInput id="city" label="City" value={city} onChange={(e) => setCity(e.target.value)} required className="!bg-background-dark/50" />
                    <FloatingInput id="state" label="State" value={state} onChange={(e) => setState(e.target.value)} required className="!bg-background-dark/50" />
                  </div>
                  <FloatingInput id="zip" label="Pin Code" value={zip} onChange={(e) => setZip(e.target.value)} required className="!bg-background-dark/50" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-10 border-t border-white/5">
                  <FloatingInput id="phone" label="Phone Number" icon={Phone} value={phone} onChange={(e) => setPhone(e.target.value)} required className="!bg-background-dark/50" />
                  <FloatingInput id="whatsapp" label="WhatsApp Number" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="!bg-background-dark/50" />
                </div>

                <div className="flex flex-col sm:flex-row gap-5 pt-10">
                   <PremiumButton type="button" variant="outline" fullWidth onClick={() => setIsEditingProfile(false)} className="py-5 !rounded-2xl">CANCEL</PremiumButton>
                   <PremiumButton type="submit" variant="gold" size="lg" fullWidth loading={saving} className="py-5 !rounded-2xl shadow-orange font-black">SAVE CHANGES</PremiumButton>
                </div>
              </form>
            )}
          </GlassCard>

          {/* Security Card */}
          <GlassCard className="!bg-background-cardSecondary p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl border border-border-primary/20 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-orange/5 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-background-dark flex items-center justify-center border border-white/5 shadow-2xl">
                   <Lock className="w-7 h-7 text-accent-bright" />
                </div>
                <div>
                   <h3 className="font-sora font-black text-xl sm:text-2xl text-white uppercase tracking-tighter">Security</h3>
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Change your password</p>
                </div>
              </div>
              {!isEditingPassword && (
                <button
                  onClick={() => setIsEditingPassword(true)}
                  className="px-6 py-3 rounded-2xl bg-background-widget border border-accent-orange/30 text-[10px] font-black text-accent-bright hover:bg-accent-orange hover:text-white transition-all uppercase tracking-widest shadow-xl"
                >
                  CHANGE
                </button>
              )}
            </div>

            {!isEditingPassword ? (
               <p className="text-xs font-bold text-text-muted uppercase tracking-widest leading-relaxed opacity-70 border-l-2 border-white/10 pl-6">It is a good idea to change your password every few months to keep your account safe.</p>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-8 animate-slide-up mt-10 relative z-10">
                <div className="space-y-6 pt-10 border-t border-white/5">
                  <FloatingInput id="wCurrentPassword" label="Current Password" type="password" icon={Lock} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="!bg-background-card" />
                  <FloatingInput id="wNewPassword" label="New Password" type="password" icon={Lock} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="!bg-background-card" />
                  <FloatingInput id="wConfirmPassword" label="Confirm New Password" type="password" icon={Lock} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="!bg-background-card" />
                </div>

                <div className="flex flex-col sm:flex-row gap-5 pt-4">
                   <PremiumButton type="button" variant="outline" fullWidth onClick={() => setIsEditingPassword(false)} className="py-5 !rounded-2xl">CANCEL</PremiumButton>
                   <PremiumButton type="submit" variant="gold" fullWidth loading={pwLoading} icon={Lock} className="py-5 !rounded-2xl shadow-orange font-black">
                      UPDATE PASSWORD
                   </PremiumButton>
                </div>
              </form>
            )}
          </GlassCard>

          <div className="lg:hidden px-4">
            <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center justify-center gap-4 py-6 rounded-[2.5rem] text-xs font-black text-red-400 bg-red-950/20 border-2 border-red-500/20 shadow-2xl uppercase tracking-[0.3em] hover:bg-red-900/40 transition-all">
              <LogOut className="w-7 h-7" /> LOGOUT
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default WorkerProfile;
