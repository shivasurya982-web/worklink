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
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-4 sm:p-6 pt-20 relative overflow-hidden">
      {/* Home Button */}
      <Link
        to="/"
        className="fixed top-4 left-4 sm:left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-xs hover:bg-slate-50 transition-all text-slate-800 text-xs font-bold uppercase tracking-wider"
      >
        <Home className="w-4 h-4 text-orange-600" />
        <span>Home</span>
      </Link>

      <div className="max-w-md w-full relative z-10 my-auto">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <img src="/logo.png" alt="Worklyn Logo" className="h-10 w-auto object-contain mx-auto" />
          </Link>
          <p className="text-xs text-orange-600 font-bold uppercase tracking-widest">Forgot Password?</p>
        </div>

        <GlassCard className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border-slate-200 relative">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-bold text-center uppercase tracking-wider flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleCheckAccount} className="space-y-4">
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button type="button" onClick={() => setRole('customer')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${role === 'customer' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600'}`}>CUSTOMER</button>
                <button type="button" onClick={() => setRole('worker')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${role === 'worker' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600'}`}>WORKER</button>
              </div>
              <p className="text-xs text-slate-500 text-center leading-relaxed font-semibold uppercase tracking-wider px-2">Enter your email or phone to find your account.</p>
              <FloatingInput label="Email or Phone Number" icon={Mail} value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
              <PremiumButton type="submit" variant="gold" fullWidth loading={loading} icon={ArrowRight}>FIND ACCOUNT</PremiumButton>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyHint} className="space-y-5 animate-fade-in">
              <div className="text-center space-y-2">
                 <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mx-auto border border-orange-100 shadow-xs">
                    <ShieldCheck className="w-6 h-6 text-orange-600" />
                 </div>
                 <h3 className="font-sora font-bold text-base text-slate-900 uppercase tracking-tight">Security Question</h3>
                 <p className="text-xs text-slate-500 font-medium leading-relaxed uppercase tracking-wider">What is the secret word you set when you registered?</p>
              </div>
              <FloatingInput label="Enter secret word" icon={ShieldCheck} value={hint} onChange={(e) => setHint(e.target.value)} required />
              <div className="flex gap-3">
                 <PremiumButton type="button" variant="outline" onClick={() => setStep(1)} icon={ArrowLeft} className="py-2.5 flex-1">Back</PremiumButton>
                 <PremiumButton type="submit" variant="gold" fullWidth loading={loading} className="py-2.5 flex-[2]">Verify Word</PremiumButton>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4 animate-fade-in">
              <div className="text-center">
                 <h3 className="font-sora font-bold text-base text-slate-900 uppercase tracking-tight">Set New Password</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Enter your new password below.</p>
              </div>
              <div className="space-y-3">
                <FloatingInput label="New Password" type="password" icon={Lock} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                <FloatingInput label="Confirm New Password" type="password" icon={Lock} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              <PremiumButton type="submit" variant="gold" fullWidth loading={loading} icon={CheckCircle2} className="py-3">CHANGE PASSWORD</PremiumButton>
            </form>
          )}

          {step === 4 && (
            <div className="text-center py-4 space-y-5 animate-fade-in">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                 <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <div className="space-y-1">
                 <h3 className="font-sora font-bold text-lg text-slate-900 uppercase tracking-tight">SUCCESS!</h3>
                 <p className="text-xs text-slate-600 font-medium uppercase tracking-wider leading-relaxed px-2">Your password has been changed. You can now login with your new password.</p>
              </div>
              <PremiumButton variant="gold" fullWidth onClick={() => navigate('/login')} className="py-3">LOGIN NOW</PremiumButton>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-xs font-bold text-orange-600 hover:underline flex items-center justify-center gap-1.5 uppercase tracking-wider">
               <ArrowLeft className="w-4 h-4" /> BACK TO LOGIN
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default ForgotPassword;
