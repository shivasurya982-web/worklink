import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Home } from 'lucide-react';
import FloatingInput from '../../components/common/FloatingInput';
import PremiumButton from '../../components/common/PremiumButton';
import GlassCard from '../../components/common/GlassCard';
import API from '../../services/api';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Identifier, 2: Verification, 3: Reset, 4: Success
  const [role, setRole] = useState('customer');
  const [identifier, setIdentifier] = useState('');
  const [hint, setHint] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCheckAccount = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return setError('Please enter your email or phone.');

    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/check-account', { identifier, role });
      if (res.success) setStep(2);
    } catch (err) {
      setError(err.message || 'Account not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyHint = async (e) => {
    e.preventDefault();
    if (!hint.trim()) return setError('Please enter your secret word.');

    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/verify-hint', { identifier, hint, role });
      if (res.success) setStep(3);
    } catch (err) {
      setError('Wrong word. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return setError('Password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/reset-password-hint', { identifier, hint, newPassword, role });
      if (res.success) setStep(4);
    } catch (err) {
      setError(err.message || 'Could not change password.');
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

      <div className="absolute top-0 right-0 w-[70%] h-[70%] bg-[#DBEAFE] rounded-full blur-[120px] pointer-events-none opacity-80" />
      <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-[#BFDBFE] rounded-full blur-[120px] pointer-events-none opacity-70" />

      <div className="max-w-md w-full relative z-10 my-auto">
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <img src="/logo.png" alt="Worklyn Logo" className="h-10 sm:h-12 w-auto object-contain mx-auto" />
          </Link>
          <p className="text-[11px] text-accent-main font-black uppercase tracking-[0.2em]">Forgot Password?</p>
        </div>

        <GlassCard goldBorder className="!bg-white/80 backdrop-blur-2xl p-6 sm:p-10 rounded-[2.5rem] shadow-sm border-white/60 relative">
          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-[11px] text-red-600 font-black text-center uppercase tracking-wider flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleCheckAccount} className="space-y-5">
              <div className="flex bg-blue-50/80 p-1.5 rounded-2xl border border-blue-100">
                <button type="button" onClick={() => setRole('customer')} className={`flex-1 py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${role === 'customer' ? 'bg-accent-main text-white shadow-xs' : 'text-text-muted'}`}>CUSTOMER</button>
                <button type="button" onClick={() => setRole('worker')} className={`flex-1 py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${role === 'worker' ? 'bg-accent-main text-white shadow-xs' : 'text-text-muted'}`}>WORKER</button>
              </div>
              <p className="text-xs text-text-secondary text-center leading-relaxed font-semibold uppercase tracking-wider px-2">Enter your email or phone to find your account.</p>
              <FloatingInput label="Email or Phone Number" icon={Mail} value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
              <PremiumButton type="submit" variant="gold" fullWidth loading={loading} icon={ArrowRight}>FIND ACCOUNT</PremiumButton>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyHint} className="space-y-6 animate-fade-in">
              <div className="text-center space-y-3">
                 <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto border border-blue-100 shadow-xs">
                    <ShieldCheck className="w-7 h-7 text-accent-main animate-pulse" />
                 </div>
                 <h3 className="font-sora font-black text-base sm:text-lg text-text-primary uppercase tracking-tight">Security Question</h3>
                 <p className="text-xs text-text-secondary font-semibold leading-relaxed uppercase tracking-wider">What is the secret word you set when you registered?</p>
              </div>
              <FloatingInput label="Enter secret word" icon={ShieldCheck} value={hint} onChange={(e) => setHint(e.target.value)} required />
              <div className="flex flex-col sm:flex-row gap-3">
                 <PremiumButton type="button" variant="outline" onClick={() => setStep(1)} icon={ArrowLeft} className="py-3 flex-1">Back</PremiumButton>
                 <PremiumButton type="submit" variant="gold" fullWidth loading={loading} className="py-3 flex-[2]">Verify Word</PremiumButton>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5 animate-fade-in">
              <div className="text-center">
                 <h3 className="font-sora font-black text-base sm:text-lg text-text-primary uppercase tracking-tight">Set New Password</h3>
                 <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Enter your new password below.</p>
              </div>
              <div className="space-y-4">
                <FloatingInput label="New Password" type="password" icon={Lock} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                <FloatingInput label="Confirm New Password" type="password" icon={Lock} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              <PremiumButton type="submit" variant="gold" fullWidth loading={loading} icon={CheckCircle2} className="py-3.5">CHANGE PASSWORD</PremiumButton>
            </form>
          )}

          {step === 4 && (
            <div className="text-center py-6 space-y-6 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                 <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="space-y-2">
                 <h3 className="font-sora font-black text-xl text-text-primary uppercase tracking-tight">SUCCESS!</h3>
                 <p className="text-xs text-text-secondary font-bold uppercase tracking-wider leading-relaxed px-2">Your password has been changed. You can now login with your new password.</p>
              </div>
              <PremiumButton variant="gold" fullWidth onClick={() => navigate('/login')} className="py-3.5">LOGIN NOW</PremiumButton>
            </div>
          )}

          <div className="mt-6 sm:mt-8 text-center">
            <Link to="/login" className="text-[10px] font-black text-accent-main hover:underline flex items-center justify-center gap-1.5 uppercase tracking-widest">
               <ArrowLeft className="w-4 h-4" /> BACK TO LOGIN
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default ForgotPassword;
