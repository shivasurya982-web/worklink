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
    <div className="min-h-screen bg-background-primary flex items-center justify-center p-6 relative overflow-hidden">
      {/* Home Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-5 py-2.5 bg-background-dark/80 backdrop-blur-md rounded-full border border-accent-main/30 shadow-2xl hover:shadow-accent-main/20 hover:bg-background-dark transition-all text-text-primary text-[11px] font-black uppercase tracking-widest"
      >
        <Home className="w-4 h-4 text-accent-bright" />
        <span>Home</span>
      </Link>

      <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-accent-main/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-accent-orange/15 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="Worklyn Logo" className="h-12 w-auto object-contain mx-auto" />
          </Link>
          <p className="text-[11px] text-accent-light font-black uppercase tracking-[0.3em] opacity-90">Forgot Password?</p>
        </div>

        <GlassCard goldBorder className="!bg-background-card p-8 sm:p-10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.7)] border-border-primary/50 relative">
          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-red-950/20 border border-red-500/30 text-[11px] text-red-400 font-black animate-shake text-center uppercase tracking-wider flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleCheckAccount} className="space-y-8">
              <div className="flex bg-background-dark/50 p-1.5 rounded-2xl border border-white/5">
                <button type="button" onClick={() => setRole('customer')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === 'customer' ? 'bg-accent-orange text-white shadow-xl' : 'text-text-muted'}`}>CUSTOMER</button>
                <button type="button" onClick={() => setRole('worker')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === 'worker' ? 'bg-accent-orange text-white shadow-xl' : 'text-text-muted'}`}>WORKER</button>
              </div>
              <p className="text-xs text-text-muted text-center leading-relaxed font-bold uppercase tracking-widest opacity-80 px-2">Enter your email or phone to find your account.</p>
              <FloatingInput label="Email or Phone Number" icon={Mail} value={identifier} onChange={(e) => setIdentifier(e.target.value)} required className="!bg-background-cardSecondary border-border-primary/20" />
              <PremiumButton type="submit" variant="gold" fullWidth loading={loading} icon={ArrowRight} className="shadow-orange">FIND ACCOUNT</PremiumButton>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyHint} className="space-y-10 animate-fade-in">
              <div className="text-center space-y-4">
                 <div className="w-20 h-20 bg-background-dark rounded-3xl flex items-center justify-center mx-auto border border-white/5 shadow-2xl">
                    <ShieldCheck className="w-10 h-10 text-accent-bright animate-pulse" />
                 </div>
                 <h3 className="font-sora font-black text-xl text-white uppercase tracking-tighter">Security Question</h3>
                 <p className="text-xs text-text-muted font-bold leading-relaxed uppercase tracking-widest opacity-80">What is the secret word you set when you registered?</p>
              </div>
              <FloatingInput label="Enter secret word" icon={ShieldCheck} value={hint} onChange={(e) => setHint(e.target.value)} required className="!bg-background-cardSecondary border-border-primary/20" />
              <div className="flex flex-col sm:flex-row gap-4">
                 <PremiumButton type="button" variant="outline" onClick={() => setStep(1)} icon={ArrowLeft} className="py-4 !rounded-2xl flex-1">Back</PremiumButton>
                 <PremiumButton type="submit" variant="gold" fullWidth loading={loading} className="py-4 !rounded-2xl flex-[2] shadow-orange">Verify Word</PremiumButton>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-8 animate-fade-in">
              <div className="text-center">
                 <h3 className="font-sora font-black text-xl text-white uppercase tracking-tighter">Set New Password</h3>
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mt-2">Enter your new password below.</p>
              </div>
              <div className="space-y-5">
                <FloatingInput label="New Password" type="password" icon={Lock} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="!bg-background-cardSecondary border-border-primary/20" />
                <FloatingInput label="Confirm New Password" type="password" icon={Lock} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="!bg-background-cardSecondary border-border-primary/20" />
              </div>
              <PremiumButton type="submit" variant="gold" fullWidth loading={loading} icon={CheckCircle2} className="shadow-orange py-4.5">CHANGE PASSWORD</PremiumButton>
            </form>
          )}

          {step === 4 && (
            <div className="text-center py-10 space-y-10 animate-fade-in">
              <div className="w-24 h-24 bg-emerald-950/20 rounded-[2rem] flex items-center justify-center mx-auto border-4 border-emerald-500/30 shadow-2xl">
                 <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              </div>
              <div className="space-y-4">
                 <h3 className="font-sora font-black text-2xl text-white uppercase tracking-tighter">SUCCESS!</h3>
                 <p className="text-xs text-text-muted font-bold uppercase tracking-widest leading-relaxed opacity-80 px-6">Your password has been changed. You can now login with your new password.</p>
              </div>
              <PremiumButton variant="gold" fullWidth onClick={() => navigate('/login')} className="py-5 shadow-orange">LOGIN NOW</PremiumButton>
            </div>
          )}

          <div className="mt-12 text-center">
            <Link to="/login" className="text-[10px] font-black text-accent-light hover:text-accent-bright transition-all flex items-center justify-center gap-2 uppercase tracking-[0.3em]">
               <ArrowLeft className="w-4 h-4" /> BACK TO LOGIN
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default ForgotPassword;
