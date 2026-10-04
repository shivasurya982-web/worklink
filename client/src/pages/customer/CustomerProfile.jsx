import { getImageUrl, handleImageError, DEFAULT_AVATAR } from '../../utils/imageUtils';
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
      <div className="max-w-2xl mx-auto space-y-6 pb-20">

        {/* Profile Card */}
        <GlassCard goldBorder className="!bg-white/80 backdrop-blur-2xl p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-white/60 relative">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 relative z-10">
            <h3 className="font-sora font-black text-lg text-text-primary flex items-center gap-2 uppercase tracking-tight">
              <User className="w-5 h-5 text-accent-main" /> My Information
            </h3>
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className={`p-2.5 rounded-xl transition-all shadow-xs ${isEditingProfile ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-blue-50 text-accent-main border border-blue-100'}`}
            >
              {isEditingProfile ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            </button>
          </div>

          {!isEditingProfile ? (
            <div className="space-y-8 animate-fade-in relative z-10">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="relative">
                   <img
                    src={getImageUrl(avatarPreview, DEFAULT_AVATAR(name || 'User'))} onError={(e) => handleImageError(e, DEFAULT_AVATAR(name || 'User'))}
                    alt="Avatar"
                    className="w-24 h-28 rounded-2xl object-cover border-2 border-accent-main shadow-xs"
                   />
                </div>
                <div className="text-center sm:text-left">
                   <h4 className="font-sora font-black text-2xl text-text-primary tracking-tight uppercase">{name}</h4>
                   <p className="text-xs font-bold text-accent-main uppercase tracking-wider mt-1">{email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/60">
                    <p className="text-[9px] font-black text-accent-main uppercase tracking-widest mb-1">Phone</p>
                    <p className="text-xs font-bold text-text-primary uppercase">{phone || 'Not set'}</p>
                 </div>
                 <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/60">
                    <p className="text-[9px] font-black text-accent-main uppercase tracking-widest mb-1">Secret Word</p>
                    <p className="text-xs font-bold text-text-primary uppercase italic">"{securityHint || 'None'}"</p>
                 </div>
                 <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/60 sm:col-span-2">
                    <p className="text-[9px] font-black text-accent-main uppercase tracking-widest mb-1">Address</p>
                    <p className="text-xs font-bold text-text-primary uppercase leading-relaxed tracking-tight">
                      {street ? `${street}, ${city}, ${state} , PIN: ${zip}` : 'Address not set'}
                    </p>
                 </div>
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
            <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up relative z-10">
              <div className="flex flex-col items-center gap-4 pb-4">
                <div className="relative">
                  <img
                    src={getImageUrl(avatarPreview, DEFAULT_AVATAR(name || 'User'))} onError={(e) => handleImageError(e, DEFAULT_AVATAR(name || 'User'))}
                    alt="Avatar"
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-accent-main shadow-xs"
                  />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <input type="file" id="avatar-input" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  <label htmlFor="avatar-input" className="cursor-pointer px-4 py-2 bg-orange-50/80 text-accent-main rounded-xl text-[10px] font-bold border border-orange-100/80 hover:bg-orange-100 transition-all inline-flex items-center gap-2 uppercase tracking-wider shadow-xs">
                    <Camera className="w-4 h-4" /> Change Photo
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-sora font-black text-xs text-text-primary uppercase tracking-wider border-l-4 border-accent-main pl-3 mb-4">Personal Info</h4>
                <FloatingInput id="email" label="Email Address" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} required />
                <FloatingInput id="name" label="Full Name" icon={User} value={name} onChange={(e) => setName(e.target.value)} required />
                <FloatingInput id="phone" label="Phone Number" icon={Phone} value={phone} onChange={(e) => setPhone(e.target.value)} required />

                <div className="pt-2">
                  <label className="text-[10px] font-black text-accent-main uppercase tracking-widest ml-1 mb-2 block">Recovery Word</label>
                  <FloatingInput id="securityHint" icon={ShieldCheck} value={securityHint} onChange={(e) => setSecurityHint(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-100">
                <h4 className="font-sora font-black text-xs text-text-primary uppercase tracking-wider border-l-4 border-accent-main pl-3 mb-4">My Address</h4>
                <FloatingInput id="street" label="Street Name" icon={MapPin} value={street} onChange={(e) => setStreet(e.target.value)} required />
                <div className="grid grid-cols-2 gap-4">
                  <FloatingInput id="city" label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
                  <FloatingInput id="state" label="State" value={state} onChange={(e) => setState(e.target.value)} required />
                </div>
                <FloatingInput id="zip" label="Pin Code" value={zip} onChange={(e) => setZip(e.target.value)} required />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                 <PremiumButton type="button" variant="outline" fullWidth onClick={() => setIsEditingProfile(false)} className="py-3.5 !rounded-xl">Cancel</PremiumButton>
                 <PremiumButton type="submit" variant="gold" fullWidth loading={loading} className="py-3.5 !rounded-xl font-black">SAVE CHANGES</PremiumButton>
              </div>
            </form>
          )}
        </GlassCard>

        {/* Change Password Card */}
        <GlassCard className="!bg-white/80 backdrop-blur-2xl p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-white/60 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                 <Lock className="w-5 h-5 text-accent-main" />
              </div>
              <h3 className="font-sora font-black text-lg text-text-primary uppercase tracking-tight">Security</h3>
            </div>
            {!isEditingPassword && (
              <button
                onClick={() => setIsEditingPassword(true)}
                className="px-4 py-2 rounded-xl border border-blue-200 text-[10px] font-black text-accent-main hover:bg-blue-50 transition-all uppercase tracking-wider shadow-xs"
              >
                Change
              </button>
            )}
          </div>

          {!isEditingPassword ? (
             <p className="text-xs font-semibold text-text-muted uppercase tracking-wider leading-relaxed">Protect your account by using a strong password. It's good to change it every few months.</p>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-6 animate-slide-up mt-6 relative z-10">
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <FloatingInput id="currentPassword" label="Current Password" type="password" icon={Lock} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                <FloatingInput id="newPassword" label="New Password" type="password" icon={Lock} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                <FloatingInput id="confirmPassword" label="Confirm New Password" type="password" icon={Lock} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                 <PremiumButton type="button" variant="outline" fullWidth onClick={() => setIsEditingPassword(false)} className="py-3.5 !rounded-xl">Cancel</PremiumButton>
                 <PremiumButton type="submit" variant="gold" fullWidth loading={pwLoading} icon={Lock} className="py-3.5 !rounded-xl font-black">
                    UPDATE PASSWORD
                 </PremiumButton>
              </div>
            </form>
          )}
        </GlassCard>

        <div className="lg:hidden px-2 pt-4">
          <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-xs font-black text-red-600 bg-red-50 border border-red-200 shadow-xs uppercase tracking-wider">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerProfile;
