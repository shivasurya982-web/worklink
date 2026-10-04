import { getImageUrl, handleImageError, DEFAULT_AVATAR, DEFAULT_COVER } from '../../utils/imageUtils';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import FloatingInput from '../../components/common/FloatingInput';
import PremiumButton from '../../components/common/PremiumButton';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { User, Phone, MapPin, Wrench, DollarSign, Camera, LogOut, Mail, Lock, ShieldCheck, Edit3, X, ChevronDown, Sparkles, Upload, AlertTriangle, CheckSquare } from 'lucide-react';
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
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-main border-t-transparent" /></div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">

          {/* Profile Details Card */}
          <GlassCard goldBorder className="!bg-white/80 backdrop-blur-2xl p-6 sm:p-8 rounded-[2.5rem] shadow-xs border border-white/60 relative">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 relative z-10">
              <h3 className="font-sora font-black text-lg text-text-primary flex items-center gap-2 uppercase tracking-tight">
                <User className="w-5 h-5 text-accent-main" /> MY INFO
              </h3>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className={`p-2.5 rounded-xl transition-all shadow-xs ${isEditingProfile ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-blue-50 text-accent-main border border-blue-100'}`}
              >
                {isEditingProfile ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
              </button>
            </div>

            {!isEditingProfile ? (
              <div className="space-y-8 animate-fade-in relative z-10">
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-2">
                  <div className="relative group shrink-0">
                     <img
                      src={getImageUrl(user?.avatar, DEFAULT_AVATAR(name || 'User'))} onError={(e) => handleImageError(e, DEFAULT_AVATAR(name || 'User'))}
                      className="w-28 h-28 rounded-2xl object-cover border-2 border-accent-main shadow-xs"
                      alt={name}
                     />
                  </div>
                  <div className="pb-1 text-center sm:text-left flex-1">
                     <h4 className="font-sora font-black text-2xl text-text-primary tracking-tight uppercase">{name || 'Your Name'}</h4>
                     <p className="text-xs font-bold text-accent-main uppercase tracking-wider mt-1">{profession || 'Profession'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                   <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/60">
                      <p className="text-[9px] font-black text-accent-main uppercase tracking-wider mb-1 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</p>
                      <p className="text-xs font-bold text-text-primary truncate">{email}</p>
                   </div>
                   <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/60">
                      <p className="text-[9px] font-black text-accent-main uppercase tracking-wider mb-1 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Pricing</p>
                      <p className="text-[10px] font-bold text-text-primary uppercase tracking-tight">Varies by work • {experience} YRS EXP</p>
                   </div>
                   <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/60">
                      <p className="text-[9px] font-black text-accent-main uppercase tracking-wider mb-1 flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5" /> Category</p>
                      <p className="text-xs font-bold text-text-primary uppercase truncate">
                        {category === 'other'
                          ? `${suggestedCategory}`
                          : categories.find(c => c._id === category || c.slug === category)?.name || 'None'}
                      </p>
                   </div>
                   <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/60 lg:col-span-2">
                      <p className="text-[9px] font-black text-accent-main uppercase tracking-wider mb-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> My Address</p>
                      <p className="text-xs font-bold text-text-primary uppercase tracking-tight truncate">{street}, {city}, {state} , PIN: {zip}</p>
                   </div>
                   <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/60">
                      <p className="text-[9px] font-black text-accent-main uppercase tracking-wider mb-1 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone</p>
                      <p className="text-xs font-bold text-text-primary truncate">{phone}</p>
                   </div>
                </div>

                {description && (
                  <div className="p-5 bg-orange-50/50 rounded-2xl border border-orange-100/60">
                     <p className="text-[10px] font-black text-accent-main uppercase tracking-wider mb-2 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> About Me</p>
                     <p className="text-xs text-text-secondary leading-relaxed font-semibold italic">"{description}"</p>
                  </div>
                )}

                <div className="p-5 bg-orange-50/50 rounded-2xl border border-orange-100/60">
                   <p className="text-[10px] font-black text-accent-main uppercase tracking-wider mb-3 flex items-center gap-1.5"><CheckSquare className="w-3.5 h-3.5" /> Verification Document</p>
                   {idPreview ? (
                      <div className="relative rounded-xl overflow-hidden border border-gray-200 max-w-xs shadow-xs">
                         <img src={getImageUrl(idPreview)} alt="Identity Proof" className="w-full h-40 object-cover" />
                      </div>
                   ) : (
                      <div className="p-6 border border-dashed border-gray-300 rounded-xl text-center">
                         <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-2 opacity-60" />
                         <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">No verification document uploaded yet.</p>
                      </div>
                   )}
                </div>

                <PremiumButton
                  variant="black"
                  fullWidth
                  onClick={() => setIsEditingProfile(true)}
                  className="py-3.5 font-black uppercase tracking-wider text-xs !rounded-full"
                >
                   <Edit3 className="w-4 h-4 mr-2" /> EDIT MY PROFILE
                </PremiumButton>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8 animate-slide-up relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                  <div className="flex flex-col items-center text-center gap-3">
                    <img src={avatarFile ? URL.createObjectURL(avatarFile) : getImageUrl(user?.avatar, DEFAULT_AVATAR(name || 'U'))} onError={(e) => handleImageError(e, DEFAULT_AVATAR(name || 'U'))} className="w-24 h-24 rounded-2xl object-cover border-2 border-accent-main shadow-xs" />
                    <input type="file" id="avatar-worker" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} className="hidden" />
                    <label htmlFor="avatar-worker" className="cursor-pointer px-4 py-2 bg-orange-50/80 text-accent-main rounded-xl text-[10px] font-bold border border-orange-100/80 hover:bg-orange-100 transition-all inline-flex items-center gap-2 uppercase tracking-wider shadow-xs"><Camera className="w-4 h-4" /> CHANGE PHOTO</label>
                  </div>
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-full h-24 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200"><img src={coverFile ? URL.createObjectURL(coverFile) : getImageUrl(user?.coverImage, DEFAULT_COVER)} onError={(e) => handleImageError(e, DEFAULT_COVER)} className="w-full h-full object-cover" /></div>
                    <input type="file" id="cover-worker" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} className="hidden" />
                    <label htmlFor="cover-worker" className="cursor-pointer px-4 py-2 bg-orange-50/80 text-accent-main rounded-xl text-[10px] font-bold border border-orange-100/80 hover:bg-orange-100 transition-all inline-flex items-center gap-2 uppercase tracking-wider shadow-xs"><Camera className="w-4 h-4" /> CHANGE COVER</label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-sora font-black text-xs text-text-primary uppercase tracking-wider border-l-4 border-accent-main pl-3 mb-6">Personal & Work Info</h4>
                  <FloatingInput id="email" label="Email Address" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <FloatingInput id="name" label="Full Name" icon={User} value={name} onChange={(e) => setName(e.target.value)} required />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FloatingInput id="profession" label="Profession (e.g. Electrician)" icon={Wrench} value={profession} onChange={(e) => setProfession(e.target.value)} required />
                    <div className="relative group">
                      <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-xs font-bold focus:outline-none focus:border-accent-main transition-all text-text-primary appearance-none uppercase tracking-wider"
                        required
                      >
                        <option value="" className="bg-white">Select Category</option>
                        {categories.map(c => <option key={c._id} value={c._id} className="bg-white">{c.name}</option>)}
                        <option value="other" className="bg-white font-black text-accent-main">+ OTHER</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {category === 'other' && (
                    <div className="animate-fade-in pt-1">
                       <FloatingInput
                        id="suggestedCategory"
                        label="Enter your service type"
                        icon={Sparkles}
                        value={suggestedCategory}
                        onChange={(e) => setSuggestedCategory(e.target.value)}
                        required
                       />
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                    <FloatingInput id="experience" type="number" label="Years of Experience" value={experience} onChange={(e) => setExperience(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-accent-main uppercase tracking-widest ml-1">About Me / Bio</label>
                    <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Write a few lines about your work and skills..." className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-xs font-bold focus:outline-none focus:border-accent-main text-text-primary shadow-xs uppercase tracking-wider" />
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-gray-100">
                  <h4 className="font-sora font-black text-xs text-text-primary uppercase tracking-wider border-l-4 border-accent-main pl-3 mb-6">Verification Document</h4>
                  <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${idFile ? 'border-accent-main bg-blue-50/50' : 'border-gray-200 hover:border-accent-main'}`}>
                    {idPreview ? (
                      <div className="space-y-3">
                         <img src={idFile ? URL.createObjectURL(idFile) : getImageUrl(idPreview)} alt="ID Preview" className="max-h-36 mx-auto rounded-xl shadow-xs border border-gray-200" />
                         <p className="text-[9px] font-black text-accent-main uppercase tracking-wider">Selected for upload</p>
                      </div>
                    ) : (
                      <div className="py-2">
                         <Upload className="w-6 h-6 text-accent-main mx-auto mb-2 opacity-50" />
                         <p className="text-xs font-black text-text-primary uppercase tracking-wider">Click to upload ID Proof</p>
                      </div>
                    )}
                    <input type="file" id="id-upload-profile" accept="image/*" onChange={handleIdFileChange} className="hidden" />
                    <label htmlFor="id-upload-profile" className="absolute inset-0 cursor-pointer" />
                  </div>
                  <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider text-center">Identity proof is required for admin approval. Upload Aadhaar Card or any Govt ID.</p>
                </div>

                <div className="space-y-4 pt-6 border-t border-gray-100">
                  <h4 className="font-sora font-black text-xs text-text-primary uppercase tracking-wider border-l-4 border-accent-main pl-3 mb-6">My Address</h4>
                  <FloatingInput id="street" label="Street Name" icon={MapPin} value={street} onChange={(e) => setStreet(e.target.value)} required />
                  <div className="grid grid-cols-2 gap-4">
                    <FloatingInput id="city" label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
                    <FloatingInput id="state" label="State" value={state} onChange={(e) => setState(e.target.value)} required />
                  </div>
                  <FloatingInput id="zip" label="Pin Code" value={zip} onChange={(e) => setZip(e.target.value)} required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                  <FloatingInput id="phone" label="Phone Number" icon={Phone} value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  <FloatingInput id="whatsapp" label="WhatsApp Number" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                   <PremiumButton type="button" variant="outline" fullWidth onClick={() => setIsEditingProfile(false)} className="py-3.5 !rounded-xl">CANCEL</PremiumButton>
                   <PremiumButton type="submit" variant="gold" size="lg" fullWidth loading={saving} className="py-3.5 !rounded-xl font-black">SAVE CHANGES</PremiumButton>
                </div>
              </form>
            )}
          </GlassCard>

          {/* Security Card */}
          <GlassCard className="!bg-white/80 backdrop-blur-2xl p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-white/60 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                   <Lock className="w-5 h-5 text-accent-main" />
                </div>
                <div>
                   <h3 className="font-sora font-black text-lg text-text-primary uppercase tracking-tight">Security</h3>
                   <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Change your password</p>
                </div>
              </div>
              {!isEditingPassword && (
                <button
                  onClick={() => setIsEditingPassword(true)}
                  className="px-4 py-2 rounded-xl bg-blue-50 border border-blue-100 text-[10px] font-black text-accent-main hover:bg-blue-100 transition-all uppercase tracking-wider shadow-xs"
                >
                  CHANGE
                </button>
              )}
            </div>

            {!isEditingPassword ? (
               <p className="text-xs font-semibold text-text-muted uppercase tracking-wider leading-relaxed border-l-2 border-gray-200 pl-4">It is a good idea to change your password every few months to keep your account safe.</p>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-6 animate-slide-up mt-6 relative z-10">
                <div className="space-y-4 pt-6 border-t border-gray-100">
                  <FloatingInput id="wCurrentPassword" label="Current Password" type="password" icon={Lock} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                  <FloatingInput id="wNewPassword" label="New Password" type="password" icon={Lock} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                  <FloatingInput id="wConfirmPassword" label="Confirm New Password" type="password" icon={Lock} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                   <PremiumButton type="button" variant="outline" fullWidth onClick={() => setIsEditingPassword(false)} className="py-3.5 !rounded-xl">CANCEL</PremiumButton>
                   <PremiumButton type="submit" variant="gold" fullWidth loading={pwLoading} icon={Lock} className="py-3.5 !rounded-xl font-black">
                      UPDATE PASSWORD
                   </PremiumButton>
                </div>
              </form>
            )}
          </GlassCard>

          <div className="lg:hidden px-2">
            <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-xs font-black text-red-600 bg-red-50 border border-red-200 shadow-xs uppercase tracking-wider">
              <LogOut className="w-5 h-5" /> LOGOUT
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default WorkerProfile;
