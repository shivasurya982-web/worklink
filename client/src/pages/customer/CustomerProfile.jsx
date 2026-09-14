import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import FloatingInput from '../../components/common/FloatingInput';
import PremiumButton from '../../components/common/PremiumButton';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { User, Phone, MapPin, Camera, LogOut, Mail, Lock, ShieldCheck, Edit3, X } from 'lucide-react';
import API from '../../services/api';

const CustomerProfile = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [securityHint, setSecurityHint] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setSecurityHint(user.securityHint || '');
      setStreet(user.address?.street || '');
      setCity(user.address?.city || '');
      setState(user.address?.state || '');
      setZip(user.address?.zip || '');
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let uploadedAvatarUrl = user?.avatar || '';

      if (avatarFile) {
        const imgData = new FormData();
        imgData.append('image', avatarFile);
        const imgRes = await API.post('/upload/image', imgData);
        if (imgRes.success && imgRes.data?.url) {
          uploadedAvatarUrl = imgRes.data.url;
        }
      }

      const payload = {
        name,
        email,
        phone,
        securityHint,
        address: { street, city, state, zip },
        avatar: uploadedAvatarUrl,
      };

      const res = await API.put('/customers/profile', payload);

      if (res.success && res.data?.customer) {
        updateUserProfile(res.data.customer);
        showToast('Profile Updated', 'Your details have been saved.', 'success');
        setAvatarFile(null);
        setIsEditingProfile(false);
      }
    } catch (err) {
      showToast('Error', err.message || 'Update failed', 'error');
    } finally {
      setLoading(false);
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
        showToast('Success', 'Password updated. Please login again.', 'success');
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
    <DashboardLayout title="My Account" subtitle="Manage your profile and security">
      <div className="max-w-2xl mx-auto space-y-8 pb-24">

        {/* Profile Card */}
        <GlassCard goldBorder className="!bg-background-card p-6 sm:p-10 rounded-[2.5rem] shadow-2xl overflow-hidden border-border-primary/40 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-orange/5 blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-10 pb-5 border-b border-white/5 relative z-10">
            <h3 className="font-sora font-black text-xl text-white flex items-center gap-3 uppercase tracking-tighter">
              <User className="w-6 h-6 text-accent-bright" /> My Information
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
              <div className="flex flex-col items-center sm:items-start gap-6">
                <div className="relative group">
                   <img
                    src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=F4510B&color=fff`}
                    alt="Avatar"
                    className="w-28 h-28 rounded-[2rem] object-cover border-4 border-accent-main shadow-2xl group-hover:scale-105 transition-all duration-500"
                   />
                   <div className="absolute inset-0 bg-accent-orange/10 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                   <h4 className="font-sora font-black text-3xl text-white tracking-tighter uppercase">{name}</h4>
                   <p className="text-sm font-bold text-accent-light uppercase tracking-[0.2em] mt-2 opacity-80">{email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                 <div className="p-5 bg-background-dark/50 rounded-[2rem] border border-white/5 shadow-inner">
                    <p className="text-[9px] font-black text-accent-bright uppercase tracking-[0.3em] mb-2">Phone</p>
                    <p className="text-sm font-bold text-white uppercase">{phone || 'Not set'}</p>
                 </div>
                 <div className="p-5 bg-background-dark/50 rounded-[2rem] border border-white/5 shadow-inner">
                    <p className="text-[9px] font-black text-accent-bright uppercase tracking-[0.3em] mb-2">Secret Word</p>
                    <p className="text-sm font-bold text-white uppercase italic">"{securityHint || 'None'}"</p>
                 </div>
                 <div className="p-6 bg-background-dark/50 rounded-[2rem] border border-white/5 shadow-inner sm:col-span-2">
                    <p className="text-[9px] font-black text-accent-bright uppercase tracking-[0.3em] mb-3">Address</p>
                    <p className="text-sm font-bold text-white uppercase leading-relaxed tracking-tight">
                      {street ? `${street}, ${city}, ${state} , PIN: ${zip}` : 'Address not set'}
                    </p>
                 </div>
              </div>

              <PremiumButton
                variant="outline"
                fullWidth
                onClick={() => setIsEditingProfile(true)}
                className="py-5 font-black uppercase tracking-widest text-[11px] !rounded-2xl"
              >
                 <Edit3 className="w-4 h-4 mr-2" /> EDIT MY PROFILE
              </PremiumButton>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-10 animate-slide-up relative z-10">
              <div className="flex flex-col items-center gap-6 pb-6">
                <div className="relative">
                  <img
                    src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=F4510B&color=fff`}
                    alt="Avatar"
                    className="w-28 h-28 rounded-[2rem] object-cover border-4 border-accent-main shadow-2xl"
                  />
                </div>
                <div className="flex flex-col items-center gap-3">
                  <input type="file" id="avatar-input" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  <label htmlFor="avatar-input" className="cursor-pointer px-6 py-3 bg-background-widget text-accent-bright rounded-2xl text-[10px] font-black border border-white/5 hover:bg-background-secondary transition-all inline-flex items-center gap-2.5 uppercase tracking-widest shadow-xl">
                    <Camera className="w-4 h-4" /> Change Photo
                  </label>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="font-sora font-black text-sm text-white uppercase tracking-widest border-l-4 border-accent-bright pl-4 mb-8">Personal Info</h4>
                <FloatingInput id="email" label="Email Address" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} required className="!bg-background-dark/50 border-border-primary/30" />
                <FloatingInput id="name" label="Full Name" icon={User} value={name} onChange={(e) => setName(e.target.value)} required className="!bg-background-dark/50 border-border-primary/30" />
                <FloatingInput id="phone" label="Phone Number" icon={Phone} value={phone} onChange={(e) => setPhone(e.target.value)} required className="!bg-background-dark/50 border-border-primary/30" />

                <div className="pt-4">
                  <label className="text-[10px] font-black text-accent-bright uppercase tracking-[0.3em] ml-2 mb-3 block">Recovery Word</label>
                  <FloatingInput id="securityHint" icon={ShieldCheck} value={securityHint} onChange={(e) => setSecurityHint(e.target.value)} required className="!bg-background-dark/50 border-border-primary/30" />
                </div>
              </div>

              <div className="space-y-6 pt-8 border-t border-white/5">
                <h4 className="font-sora font-black text-sm text-white uppercase tracking-widest border-l-4 border-accent-bright pl-4 mb-8">My Address</h4>
                <FloatingInput id="street" label="Street Name" icon={MapPin} value={street} onChange={(e) => setStreet(e.target.value)} required className="!bg-background-dark/50 border-border-primary/30" />
                <div className="grid grid-cols-2 gap-5">
                  <FloatingInput id="city" label="City" value={city} onChange={(e) => setCity(e.target.value)} required className="!bg-background-dark/50 border-border-primary/30" />
                  <FloatingInput id="state" label="State" value={state} onChange={(e) => setState(e.target.value)} required className="!bg-background-dark/50 border-border-primary/30" />
                </div>
                <FloatingInput id="zip" label="Pin Code" value={zip} onChange={(e) => setZip(e.target.value)} required className="!bg-background-dark/50 border-border-primary/30" />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                 <PremiumButton type="button" variant="outline" fullWidth onClick={() => setIsEditingProfile(false)} className="py-4 !rounded-2xl">Cancel</PremiumButton>
                 <PremiumButton type="submit" variant="gold" fullWidth loading={loading} className="py-4 !rounded-2xl shadow-orange font-black">SAVE CHANGES</PremiumButton>
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
              <h3 className="font-sora font-black text-xl text-white uppercase tracking-tighter">Security</h3>
            </div>
            {!isEditingPassword && (
              <button
                onClick={() => setIsEditingPassword(true)}
                className="px-5 py-2.5 rounded-xl border border-accent-orange/30 text-[10px] font-black text-accent-bright hover:bg-accent-orange/10 transition-all uppercase tracking-widest shadow-lg"
              >
                Change
              </button>
            )}
          </div>

          {!isEditingPassword ? (
             <p className="text-xs font-bold text-text-muted uppercase tracking-widest leading-relaxed opacity-70">Protect your account by using a strong password. It's good to change it every few months.</p>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-8 animate-slide-up mt-8 relative z-10">
              <div className="space-y-6 pt-6 border-t border-white/5">
                <FloatingInput id="currentPassword" label="Current Password" type="password" icon={Lock} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="!bg-background-card border-border-primary/20" />
                <FloatingInput id="newPassword" label="New Password" type="password" icon={Lock} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="!bg-background-card border-border-primary/20" />
                <FloatingInput id="confirmPassword" label="Confirm New Password" type="password" icon={Lock} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="!bg-background-card border-border-primary/20" />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                 <PremiumButton type="button" variant="outline" fullWidth onClick={() => setIsEditingPassword(false)} className="py-4 !rounded-2xl">Cancel</PremiumButton>
                 <PremiumButton type="submit" variant="gold" fullWidth loading={pwLoading} icon={Lock} className="py-4 !rounded-2xl shadow-orange font-black">
                    UPDATE PASSWORD
                 </PremiumButton>
              </div>
            </form>
          )}
        </GlassCard>

        <div className="lg:hidden px-4 pt-6">
          <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] text-xs font-black text-red-400 bg-red-950/20 border-2 border-red-500/20 shadow-2xl uppercase tracking-widest">
            <LogOut className="w-6 h-6" /> Logout
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerProfile;
