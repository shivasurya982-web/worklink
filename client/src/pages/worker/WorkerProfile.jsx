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
        showToast('Profile Updated', 'Details updated successfully.', 'success');
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
      showToast('Mismatch', 'Passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Too Short', 'Password must be at least 6 characters.', 'error');
      return;
    }
    setPwLoading(true);
    try {
      const res = await API.put('/auth/change-password', { currentPassword, newPassword });
      if (res.success) {
        showToast('Password Changed', 'Success! Please login again.', 'success');
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      showToast('Error', err.message || 'Failed to change password', 'error');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <DashboardLayout title="Professional Settings" subtitle="Manage your business profile and account security">
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-gold border-t-transparent" /></div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-6 pb-20">

          {/* Professional Profile Card */}
          <GlassCard goldBorder className="bg-white p-5 sm:p-8 rounded-3xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h3 className="font-sora font-bold text-lg text-text-primary flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-accent-gold" /> Business Profile
              </h3>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className={`p-2 rounded-full transition-all ${isEditingProfile ? 'bg-red-50 text-accent-red' : 'bg-amber-50 text-accent-gold'}`}
              >
                {isEditingProfile ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
              </button>
            </div>

            {!isEditingProfile ? (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col items-center sm:items-start gap-5 mb-4">
                   <div className="flex gap-4 items-end">
                      <img
                        src={avatarFile ? URL.createObjectURL(avatarFile) : user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=D4AF37&color=fff`}
                        className="w-24 h-24 rounded-full object-cover border-4 border-accent-gold/20 shadow-md"
                      />
                      <div className="pb-2">
                         <h4 className="font-sora font-bold text-xl text-text-primary">{name}</h4>
                         <p className="text-sm font-semibold text-accent-gold uppercase tracking-wider">{profession}</p>
                      </div>
                   </div>
                   {user?.coverImage && (
                     <div className="w-full h-24 rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
                        <img src={user.coverImage} className="w-full h-full object-cover" />
                     </div>
                   )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-accent-gold uppercase tracking-wider mb-1">Email / Login ID</p>
                      <p className="text-sm font-semibold text-text-primary">{email}</p>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-accent-gold uppercase tracking-wider mb-1">Rates</p>
                      <p className="text-sm font-semibold text-text-primary">₹{hourlyRate}/hr • {experience} yrs exp</p>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-accent-gold uppercase tracking-wider mb-1">Service Category</p>
                      <p className="text-sm font-semibold text-text-primary">
                        {category === 'other'
                          ? `Suggested: ${suggestedCategory}`
                          : categories.find(c => c._id === category || c.slug === category)?.name || 'Not set'}
                      </p>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-accent-gold uppercase tracking-wider mb-1">Contact Numbers</p>
                      <p className="text-sm font-semibold text-text-primary">{phone} {whatsapp && `• WA: ${whatsapp}`}</p>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-accent-gold uppercase tracking-wider mb-1">Recovery Hint</p>
                      <p className="text-sm font-semibold text-text-primary">{securityHint || 'Not set'}</p>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-2xl sm:col-span-2">
                      <p className="text-[10px] font-bold text-accent-gold uppercase tracking-wider mb-1">Location</p>
                      <p className="text-sm font-semibold text-text-primary">{street}, {city}, {state} - {zip}</p>
                   </div>
                   {description && (
                     <div className="p-4 bg-amber-50/30 rounded-2xl sm:col-span-2 border border-amber-100/50">
                        <p className="text-[10px] font-bold text-accent-gold uppercase tracking-wider mb-1">Professional Bio</p>
                        <p className="text-xs text-text-secondary leading-relaxed italic">"{description}"</p>
                     </div>
                   )}
                </div>

                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="w-full py-3.5 rounded-2xl border-2 border-dashed border-accent-gold/30 text-accent-gold font-bold text-xs hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
                >
                   <Edit3 className="w-4 h-4" /> Edit Professional Details
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pb-6 border-b border-gray-100">
                  <div className="flex flex-col items-center text-center gap-3">
                    <img src={avatarFile ? URL.createObjectURL(avatarFile) : user?.avatar || 'https://via.placeholder.com/80'} className="w-24 h-24 rounded-full object-cover border-4 border-accent-gold/40 shadow-md" />
                    <input type="file" id="avatar-worker" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} className="hidden" />
                    <label htmlFor="avatar-worker" className="cursor-pointer px-4 py-2 bg-amber-50 text-accent-gold rounded-full text-[10px] font-bold border border-accent-gold/20 inline-flex items-center gap-2"><Camera className="w-3 h-3" /> Profile Photo</label>
                  </div>
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-full h-24 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 shadow-inner"><img src={coverFile ? URL.createObjectURL(coverFile) : user?.coverImage || 'https://via.placeholder.com/200x80'} className="w-full h-full object-cover" /></div>
                    <input type="file" id="cover-worker" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} className="hidden" />
                    <label htmlFor="cover-worker" className="cursor-pointer px-4 py-2 bg-blue-50 text-accent-blue rounded-full text-[10px] font-bold border border-blue-100 inline-flex items-center gap-2"><Camera className="w-3 h-3" /> Cover Banner</label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-sora font-semibold text-sm text-text-primary border-l-4 border-accent-gold pl-3">Business Details</h4>
                  <FloatingInput id="email" label="Email Address (Login ID)" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <FloatingInput id="name" label="Full Name" icon={User} value={name} onChange={(e) => setName(e.target.value)} required />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FloatingInput id="profession" label="Profession Title" icon={Wrench} value={profession} onChange={(e) => setProfession(e.target.value)} required />
                    <div className="relative">
                      <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 transition-all font-medium appearance-none"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        <option value="other" className="font-bold text-accent-blue">+ Other (Type below)</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                      <label className="absolute -top-2.5 left-4 bg-white px-1.5 text-[10px] font-bold text-accent-gold rounded">Category</label>
                    </div>
                  </div>

                  {category === 'other' && (
                    <div className="animate-fade-in">
                       <FloatingInput
                        id="suggestedCategory"
                        label="Type Your Custom Category"
                        icon={Sparkles}
                        value={suggestedCategory}
                        onChange={(e) => setSuggestedCategory(e.target.value)}
                        required
                       />
                       <p className="text-[9px] text-text-muted mt-1 px-1">Note: Custom categories will be reviewed by admin for official approval.</p>
                    </div>
                  )}

                  <div className="pt-2">
                    <label className="text-[10px] font-bold text-accent-gold uppercase tracking-wider ml-1 mb-1 block">Security Recovery Hint</label>
                    <FloatingInput id="securityHint" icon={ShieldCheck} value={securityHint} onChange={(e) => setSecurityHint(e.target.value)} required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FloatingInput id="experience" type="number" label="Experience" value={experience} onChange={(e) => setExperience(e.target.value)} required />
                    <FloatingInput id="hourlyRate" type="number" label="Hourly Rate (₹)" icon={DollarSign} value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} required />
                  </div>
                  <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Bio..." className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-accent-gold" />
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h4 className="font-sora font-semibold text-sm text-text-primary border-l-4 border-accent-gold pl-3">Service Location</h4>
                  <FloatingInput id="street" label="Street" icon={MapPin} value={street} onChange={(e) => setStreet(e.target.value)} required />
                  <div className="grid grid-cols-2 gap-4">
                    <FloatingInput id="city" label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
                    <FloatingInput id="state" label="State" value={state} onChange={(e) => setState(e.target.value)} required />
                  </div>
                  <FloatingInput id="zip" label="PIN Code" value={zip} onChange={(e) => setZip(e.target.value)} required />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <FloatingInput id="phone" label="Phone" icon={Phone} value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  <FloatingInput id="whatsapp" label="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
                </div>

                <div className="flex gap-3 pt-4">
                   <PremiumButton type="button" variant="outline" fullWidth onClick={() => setIsEditingProfile(false)}>Cancel</PremiumButton>
                   <PremiumButton type="submit" variant="gold" size="lg" fullWidth loading={saving}>Save Changes</PremiumButton>
                </div>
              </form>
            )}
          </GlassCard>

          {/* Change Password Card */}
          <GlassCard className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-accent-gold" />
                <h3 className="font-sora font-bold text-lg text-text-primary">Password & Security</h3>
              </div>
              {!isEditingPassword && (
                <PremiumButton variant="outline" size="sm" onClick={() => setIsEditingPassword(true)}>
                  Change Password
                </PremiumButton>
              )}
            </div>

            {!isEditingPassword ? (
               <p className="text-xs text-text-muted">Ensure your account is secure by using a strong, unique password.</p>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-5 animate-slide-up mt-4">
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <FloatingInput id="wCurrentPassword" label="Current Password" type="password" icon={Lock} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                  <FloatingInput id="wNewPassword" label="New Password" type="password" icon={Lock} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                  <FloatingInput id="wConfirmPassword" label="Confirm New Password" type="password" icon={Lock} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>

                <div className="flex gap-3">
                   <PremiumButton type="button" variant="outline" fullWidth onClick={() => setIsEditingPassword(false)}>Cancel</PremiumButton>
                   <PremiumButton type="submit" variant="gold" fullWidth loading={pwLoading} icon={Lock}>
                      Update & Re-login
                   </PremiumButton>
                </div>
              </form>
            )}
          </GlassCard>

          <div className="lg:hidden px-4 pt-4">
            <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-accent-red bg-red-50 border border-red-100 shadow-sm"><LogOut className="w-5 h-5" /> Sign Out</button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default WorkerProfile;
