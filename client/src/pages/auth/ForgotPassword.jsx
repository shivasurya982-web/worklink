import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
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
    if (!hint.trim()) return setError('Please enter your recovery hint.');

    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/verify-hint', { identifier, hint, role });
      if (res.success) setStep(3);
    } catch (err) {
      setError('Incorrect recovery hint. Please try again.');
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
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center p-6 relative overflow-hidden">
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <span className="font-sora font-bold text-2xl text-text-primary">Worklyn</span>
          </Link>
          <p className="text-xs text-text-secondary uppercase tracking-widest font-bold">Password Recovery</p>
        </div>

        <GlassCard goldBorder className="bg-white/95 p-8 rounded-3xl shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-[11px] text-accent-red font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleCheckAccount} className="space-y-6">
              <div className="flex bg-gray-100 p-1 rounded-2xl">
                <button type="button" onClick={() => setRole('customer')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold transition-all ${role === 'customer' ? 'bg-white text-accent-gold shadow-sm' : 'text-text-muted'}`}>CUSTOMER</button>
                <button type="button" onClick={() => setRole('worker')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold transition-all ${role === 'worker' ? 'bg-white text-accent-gold shadow-sm' : 'text-text-muted'}`}>WORKER</button>
              </div>
              <p className="text-xs text-text-muted text-center leading-relaxed italic">Enter your registered email or phone number to find your account.</p>
              <FloatingInput label="Email or Phone" icon={Mail} value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
              <PremiumButton type="submit" variant="gold" fullWidth loading={loading} icon={ArrowRight}>Find My Account</PremiumButton>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyHint} className="space-y-6">
              <div className="text-center space-y-2">
                 <ShieldCheck className="w-12 h-12 text-accent-gold mx-auto opacity-20" />
                 <h3 className="font-sora font-bold text-text-primary">Verification Required</h3>
                 <p className="text-xs text-text-muted leading-relaxed italic">Please enter the security recovery hint you set during registration.</p>
              </div>
              <FloatingInput label="Enter Recovery Hint" icon={ShieldCheck} value={hint} onChange={(e) => setHint(e.target.value)} required />
              <div className="flex gap-3">
                 <PremiumButton type="button" variant="outline" onClick={() => setStep(1)} icon={ArrowLeft} />
                 <PremiumButton type="submit" variant="gold" fullWidth loading={loading}>Verify Hint</PremiumButton>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <h3 className="font-sora font-bold text-text-primary text-center">Set New Password</h3>
              <FloatingInput label="New Password" type="password" icon={Lock} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              <FloatingInput label="Confirm Password" type="password" icon={Lock} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              <PremiumButton type="submit" variant="gold" fullWidth loading={loading} icon={CheckCircle2}>Update Password</PremiumButton>
            </form>
          )}

          {step === 4 && (
            <div className="text-center py-6 space-y-6">
              <CheckCircle2 className="w-16 h-16 text-accent-green mx-auto" />
              <div className="space-y-2">
                 <h3 className="font-sora font-bold text-xl text-text-primary">Password Reset!</h3>
                 <p className="text-sm text-text-muted">Success! Your password has been changed. You can now login with your new credentials.</p>
              </div>
              <PremiumButton variant="gold" fullWidth onClick={() => navigate('/login')}>Return to Login</PremiumButton>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link to="/login" className="text-[11px] font-bold text-text-muted hover:text-accent-gold transition-colors flex items-center justify-center gap-1">
               <ArrowLeft className="w-3 h-3" /> BACK TO SIGN IN
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default ForgotPassword;
