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
        const imgRes = await API.post('/upload/image', imgData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
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
        showToast('Profile Updated', 'Profile updated successfully.', 'success');
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
    <DashboardLayout title="Account Settings" subtitle="Manage your profile and security">
      <div className="max-w-2xl mx-auto space-y-6 pb-20">

        {/* Profile Card */}
        <GlassCard goldBorder className="bg-white p-5 sm:p-8 rounded-3xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <h3 className="font-sora font-bold text-lg text-text-primary flex items-center gap-2">
              <User className="w-5 h-5 text-accent-gold" /> Personal Information
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
              <div className="flex flex-col items-center sm:items-start gap-4 mb-6">
                <img
                  src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=D4AF37&color=fff`}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-accent-gold/20 shadow-md"
                />
                <div>
                   <h4 className="font-sora font-bold text-xl text-text-primary">{name}</h4>
                   <p className="text-sm text-text-muted">{email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-[10px] font-bold text-accent-gold uppercase tracking-wider mb-1">Phone Number</p>
                    <p className="text-sm font-semibold text-text-primary">{phone || 'Not set'}</p>
                 </div>
                 <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-[10px] font-bold text-accent-gold uppercase tracking-wider mb-1">Recovery Hint</p>
                    <p className="text-sm font-semibold text-text-primary">{securityHint || 'Not set'}</p>
                 </div>
                 <div className="p-4 bg-gray-50 rounded-2xl sm:col-span-2">
                    <p className="text-[10px] font-bold text-accent-gold uppercase tracking-wider mb-1">Service Address</p>
                    <p className="text-sm font-semibold text-text-primary">
                      {street ? `${street}, ${city}, ${state} - ${zip}` : 'No address provided'}
                    </p>
                 </div>
              </div>

              <button
                onClick={() => setIsEditingProfile(true)}
                className="w-full py-3.5 rounded-2xl border-2 border-dashed border-accent-gold/30 text-accent-gold font-bold text-xs hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
              >
                 <Edit3 className="w-4 h-4" /> Edit Profile Details
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
              {/* Avatar upload */}
              <div className="flex flex-col items-center gap-4 pb-6">
                <div className="relative">
                  <img
                    src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=D4AF37&color=fff`}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-accent-gold/40 shadow-md"
                  />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <input type="file" id="avatar-input" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  <label htmlFor="avatar-input" className="cursor-pointer px-4 py-2 bg-amber-50 text-accent-gold rounded-full text-[10px] font-bold border border-accent-gold/20 hover:bg-amber-100 transition-colors inline-flex items-center gap-2">
                    <Camera className="w-3.5 h-3.5" /> Change Profile Photo
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-sora font-semibold text-sm text-text-primary border-l-4 border-accent-gold pl-3">Personal Details</h4>
                <FloatingInput id="email" label="Email Address (Login ID)" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} required />
                <FloatingInput id="name" label="Full Name" icon={User} value={name} onChange={(e) => setName(e.target.value)} required />
                <FloatingInput id="phone" label="Phone Number" icon={Phone} value={phone} onChange={(e) => setPhone(e.target.value)} required />

                <div className="pt-2">
                  <label className="text-[10px] font-bold text-accent-gold uppercase tracking-wider ml-1 mb-1 block">Security Recovery Hint</label>
                  <FloatingInput id="securityHint" icon={ShieldCheck} value={securityHint} onChange={(e) => setSecurityHint(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="font-sora font-semibold text-sm text-text-primary border-l-4 border-accent-gold pl-3">Service Location</h4>
                <FloatingInput id="street" label="Street Address" icon={MapPin} value={street} onChange={(e) => setStreet(e.target.value)} required />
                <div className="grid grid-cols-2 gap-4">
                  <FloatingInput id="city" label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
                  <FloatingInput id="state" label="State" value={state} onChange={(e) => setState(e.target.value)} required />
                </div>
                <FloatingInput id="zip" label="PIN Code" value={zip} onChange={(e) => setZip(e.target.value)} required />
              </div>

              <div className="flex gap-3">
                 <PremiumButton type="button" variant="outline" fullWidth onClick={() => setIsEditingProfile(false)}>Cancel</PremiumButton>
                 <PremiumButton type="submit" variant="gold" fullWidth loading={loading}>Save Profile Updates</PremiumButton>
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
             <p className="text-xs text-text-muted">It's a good idea to use a strong password that you don't use elsewhere.</p>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-5 animate-slide-up mt-4">
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <FloatingInput id="currentPassword" label="Current Password" type="password" icon={Lock} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                <FloatingInput id="newPassword" label="New Password" type="password" icon={Lock} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                <FloatingInput id="confirmPassword" label="Confirm New Password" type="password" icon={Lock} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
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
          <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-accent-red bg-red-50 border border-red-100">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerProfile;
