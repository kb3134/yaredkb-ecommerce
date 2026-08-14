import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Shield, 
  KeyRound, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  HelpCircle,
  Building2,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { AdminUser } from '../../types';
import { apiFetch } from '../../lib/api';

interface AdminLoginViewProps {
  onLoginSuccess: (user: AdminUser, token?: string) => void;
  onBackToStore: () => void;
  logoUrl?: string;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onLoginSuccess,
  onBackToStore,
  logoUrl,
}) => {
  const [viewMode, setViewMode] = useState<'login' | 'forgot' | 'reset-success'>('login');
  
  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot Password state
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1); // 1 = identifier, 2 = answer & new pass
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState('');

  const parseJsonResponse = async (res: Response) => {
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      const text = await res.text();
      throw new Error(text ? text.slice(0, 150) : `Server error (status ${res.status})`);
    }
    return res.json();
  };

  // Quick fill helper for demo login
  const handleQuickFillDemo = () => {
    setUsername('admin');
    setPassword('admin123');
    setLoginError('');
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!username.trim()) {
      setLoginError('Please enter your username or email address.');
      return;
    }
    if (!password) {
      setLoginError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await apiFetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });

      const data = await parseJsonResponse(res);

      if (!res.ok) {
        setLoginError(data.error || 'Invalid credentials or account inactive.');
        setIsSubmitting(false);
        return;
      }

      // Success
      setIsSubmitting(false);
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      console.error('Login request failed:', err);
      setLoginError(err.message || 'Unable to connect to server. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Handle Initiate Forgot Password
  const handleInitiateForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!forgotIdentifier.trim()) {
      setForgotError('Please enter your username or email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await apiFetch('/api/admin/forgot-password/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: forgotIdentifier.trim() })
      });

      const data = await parseJsonResponse(res);

      if (!res.ok || !data.success) {
        setForgotError(data.error || 'No matching active admin account found.');
        setIsSubmitting(false);
        return;
      }

      setSecurityQuestion(data.securityQuestion || 'What is your security verification answer?');
      setForgotStep(2);
      setIsSubmitting(false);
    } catch (err: any) {
      console.error('Initiate forgot password error:', err);
      setForgotError(err.message || 'Server communication error. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Handle Reset Password Submit
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!securityAnswer.trim()) {
      setForgotError('Please provide your security answer or master key.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotError('New passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await apiFetch('/api/admin/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: forgotIdentifier.trim(),
          securityAnswer: securityAnswer.trim(),
          newPassword
        })
      });

      const data = await parseJsonResponse(res);

      if (!res.ok || !data.success) {
        setForgotError(data.error || 'Incorrect security verification answer.');
        setIsSubmitting(false);
        return;
      }

      // Pre-fill username and password for smooth sign-in
      if (forgotIdentifier.trim()) {
        setUsername(forgotIdentifier.trim());
      }
      setPassword(newPassword);

      setForgotSuccessMessage('Your password has been successfully updated. Your new credentials have been pre-filled for immediate login.');
      setViewMode('reset-success');
      setIsSubmitting(false);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setForgotError(err.message || 'Server communication error. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 bg-gradient-to-tr from-[#FFFFFF] via-[#FAF9F6] to-[#F5F2EB] text-[#111111] relative overflow-hidden">
      
      {/* Premium Executive Background Patterns */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="tibeb-luxury-pattern" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M32 0 L64 32 L32 64 L0 32 Z" fill="none" stroke="#D4AF37" strokeWidth="1" />
            <path d="M32 8 L56 32 L32 56 L8 32 Z" fill="none" stroke="#C9A227" strokeWidth="0.5" />
            <circle cx="32" cy="32" r="2.5" fill="#D4AF37" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tibeb-luxury-pattern)" />
      </svg>

      {/* Subtle gold radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.06)_0%,transparent_65%)] pointer-events-none" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#C9A227]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative screen corners for premium executive atmosphere */}
      <div className="absolute top-6 left-6 w-16 h-16 pointer-events-none opacity-40 hidden sm:block">
        <div className="absolute inset-0 border-t-2 border-l-2 border-[#D4AF37]" />
        <div className="absolute top-1 left-1 w-4 h-4 border-t border-l border-[#111111]" />
      </div>
      <div className="absolute top-6 right-6 w-16 h-16 pointer-events-none opacity-40 hidden sm:block">
        <div className="absolute inset-0 border-t-2 border-r-2 border-[#D4AF37]" />
        <div className="absolute top-1 right-1 w-4 h-4 border-t border-r border-[#111111]" />
      </div>
      <div className="absolute bottom-6 left-6 w-16 h-16 pointer-events-none opacity-40 hidden sm:block">
        <div className="absolute inset-0 border-b-2 border-l-2 border-[#D4AF37]" />
        <div className="absolute bottom-1 left-1 w-4 h-4 border-b border-l border-[#111111]" />
      </div>
      <div className="absolute bottom-6 right-6 w-16 h-16 pointer-events-none opacity-40 hidden sm:block">
        <div className="absolute inset-0 border-b-2 border-r-2 border-[#D4AF37]" />
        <div className="absolute bottom-1 right-1 w-4 h-4 border-b border-r border-[#111111]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg relative z-10 p-1"
      >
        {/* Floating Luxury Card Container */}
        <div className="bg-white/90 backdrop-blur-md border border-[#D4AF37]/50 rounded-[24px] p-8 sm:p-12 shadow-[0_20px_50px_rgba(17,17,17,0.06),0_10px_30px_rgba(212,175,55,0.03)] relative overflow-hidden transition-all duration-300 hover:shadow-[0_30px_70px_rgba(17,17,17,0.08),0_15px_40px_rgba(212,175,55,0.05)]">
          
          {/* Card inner luxury double frame line */}
          <div className="absolute inset-2.5 border border-[#D4AF37]/15 rounded-[20px] pointer-events-none" />

          {/* Top Brand Emblem Badge */}
          <div className="flex flex-col items-center text-center mb-8 relative">
            
            {/* Logo container with elegant double gold frame */}
            <div className="relative p-1.5 rounded-full border border-[#D4AF37] bg-white shadow-xl shadow-[#D4AF37]/10 mb-5 transform transition-all duration-300 hover:scale-105">
              <div className="rounded-full border border-[#D4AF37]/40 p-1 bg-white">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt="Yared Tibeb Logo" 
                    className="w-16 h-16 rounded-full object-contain" 
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#111111] flex items-center justify-center">
                    <Shield className="w-8 h-8 text-[#D4AF37]" />
                  </div>
                )}
              </div>
            </div>

            {/* Premium Badge */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#111111] border border-[#D4AF37] text-[10px] font-sans font-bold tracking-[0.2em] text-[#D4AF37] uppercase mb-3 shadow-md select-none">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
              <span>Yared Tibeb Studio</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-wide leading-tight">
              Executive Portal
            </h2>
            <p className="text-xs text-gray-500 mt-2 max-w-xs leading-relaxed font-sans font-medium">
              Secure authentication for authorized administrators and studio management
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* 1. LOGIN VIEW */}
            {viewMode === 'login' && (
              <motion.form 
                key="login-form"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleLoginSubmit}
                className="space-y-6 relative z-10"
              >
                {loginError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 shadow-sm"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-sans font-medium">{loginError}</span>
                  </motion.div>
                )}

                {/* Username Input */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-sans font-extrabold text-[#111111] uppercase tracking-[0.15em]">
                    Username or Email
                  </label>
                  <div className="relative group">
                    <User className="w-4.5 h-4.5 text-[#111111] absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 group-focus-within:text-[#D4AF37]" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. admin or admin@yaredtibeb.com"
                      className="w-full h-12 bg-white border border-[#D4AF37]/40 focus:border-[#D4AF37] rounded-xl pl-11 pr-4 text-sm text-[#111111] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all duration-300 font-sans font-semibold"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-sans font-extrabold text-[#111111] uppercase tracking-[0.15em]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotIdentifier(username);
                        setForgotError('');
                        setForgotStep(1);
                        setViewMode('forgot');
                      }}
                      className="text-xs text-[#D4AF37] hover:text-[#C9A227] font-sans font-bold tracking-wide transition-colors duration-300 relative py-0.5 group cursor-pointer"
                    >
                      Forgot password?
                      <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#C9A227] transition-all duration-300 group-hover:w-full" />
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="w-4.5 h-4.5 text-[#111111] absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 group-focus-within:text-[#D4AF37]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your security password"
                      className="w-full h-12 bg-white border border-[#D4AF37]/40 focus:border-[#D4AF37] rounded-xl pl-11 pr-11 text-sm text-[#111111] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all duration-300 font-sans font-semibold"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37] transition-colors duration-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 h-12 rounded-xl bg-[#111111] text-[#D4AF37] border border-[#D4AF37]/30 font-serif font-bold text-xs sm:text-sm tracking-widest uppercase hover:bg-[#D4AF37] hover:text-[#111111] hover:border-[#D4AF37] active:scale-[0.99] transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#D4AF37]/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4.5 h-4.5 animate-spin text-current" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4.5 h-4.5 text-current" />
                      <span>Sign In to Admin Panel</span>
                    </>
                  )}
                </button>

                {/* Quick Fill Demo Banner */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#D4AF37]/30 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="text-left space-y-0.5">
                    <span className="text-[#C9A227] font-extrabold block text-[11px] font-sans uppercase tracking-wider">Demo Executive Account:</span>
                    <span className="text-[#111111] font-mono text-[11px] font-bold">admin / admin123</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickFillDemo}
                    className="px-3.5 py-1.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37] hover:text-white border border-[#D4AF37]/35 text-[#C9A227] rounded-lg text-[10px] font-sans font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer shrink-0 hover:shadow-md"
                  >
                    ⚡ Auto-Fill Demo
                  </button>
                </div>

                {/* Premium Footer Row */}
                <div className="pt-5 border-t border-[#D4AF37]/15 flex items-center justify-between text-xs text-gray-600">
                  <button
                    type="button"
                    onClick={onBackToStore}
                    className="flex items-center gap-1.5 text-gray-600 hover:text-[#111111] font-sans font-bold text-xs tracking-wide transition-colors duration-300 group cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-[#D4AF37] group-hover:-translate-x-1 transition-transform" />
                    <span>Return to Storefront</span>
                  </button>
                  <div className="flex items-center gap-1 text-[10px] font-mono font-bold tracking-wider text-[#D4AF37] uppercase bg-[#111111]/5 px-2.5 py-1 rounded border border-[#D4AF37]/20">
                    <Shield className="w-3 h-3 text-[#D4AF37]" />
                    <span>SSL SECURED</span>
                  </div>
                </div>
              </motion.form>
            )}

            {/* 2. FORGOT PASSWORD VIEW */}
            {viewMode === 'forgot' && (
              <motion.div
                key="forgot-form"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 relative z-10"
              >
                <div className="flex items-center gap-3.5 pb-3 border-b border-[#D4AF37]/15">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep(1);
                      setViewMode('login');
                    }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#111111] transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
                  </button>
                  <h3 className="font-serif font-bold text-lg text-[#111111]">
                    Reset Admin Password
                  </h3>
                </div>

                {forgotError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 shadow-sm"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-sans font-medium">{forgotError}</span>
                  </motion.div>
                )}

                {forgotStep === 1 && (
                  <form onSubmit={handleInitiateForgot} className="space-y-5">
                    <p className="text-xs text-gray-500 leading-relaxed font-sans font-medium">
                      Enter your admin username or registered email address to locate your security verification settings.
                    </p>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-sans font-extrabold text-[#111111] uppercase tracking-[0.15em]">
                        Admin Username or Email
                      </label>
                      <div className="relative group">
                        <User className="w-4.5 h-4.5 text-[#111111] absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 group-focus-within:text-[#D4AF37]" />
                        <input
                          type="text"
                          value={forgotIdentifier}
                          onChange={(e) => setForgotIdentifier(e.target.value)}
                          placeholder="e.g. admin or admin@yaredtibeb.com"
                          className="w-full h-12 bg-white border border-[#D4AF37]/40 focus:border-[#D4AF37] rounded-xl pl-11 pr-4 text-sm text-[#111111] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all duration-300 font-sans font-semibold"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 rounded-xl bg-[#111111] text-[#D4AF37] border border-[#D4AF37]/30 font-serif font-bold text-xs uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#111111] hover:border-[#D4AF37] transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                          <span>Searching Account...</span>
                        </>
                      ) : (
                        <span>Verify Admin Account</span>
                      )}
                    </button>
                  </form>
                )}

                {forgotStep === 2 && (
                  <form onSubmit={handleResetSubmit} className="space-y-5">
                    <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#D4AF37]/35 text-xs space-y-1.5 shadow-xs">
                      <div className="flex items-center gap-1.5 text-[#C9A227] font-extrabold uppercase tracking-wider font-sans text-[10px]">
                        <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
                        <span>Security Verification Question</span>
                      </div>
                      <p className="text-[#111111] font-serif italic text-sm font-bold">"{securityQuestion}"</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-sans font-extrabold text-[#111111] uppercase tracking-[0.15em]">
                        Security Answer / Master Key
                      </label>
                      <input
                        type="text"
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                        placeholder="Enter answer (e.g. Gondar) or Master Key"
                        className="w-full h-11 bg-white border border-[#D4AF37]/40 focus:border-[#D4AF37] rounded-xl px-4 text-sm text-[#111111] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all duration-300 font-sans font-semibold"
                        required
                      />
                      
                      {/* Quick fill chips */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-[10px] text-gray-500 font-sans font-bold uppercase tracking-wider">Quick Fill:</span>
                        <button
                          type="button"
                          onClick={() => setSecurityAnswer('Gondar')}
                          className="px-2.5 py-1 rounded bg-[#D4AF37]/10 hover:bg-[#D4AF37] hover:text-[#111111] border border-[#D4AF37]/40 text-[#C9A227] text-[10px] font-mono font-bold transition-all duration-300 cursor-pointer hover:shadow-xs"
                        >
                          "Gondar"
                        </button>
                        <button
                          type="button"
                          onClick={() => setSecurityAnswer('YARED-GOLD-2026')}
                          className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500 hover:text-white border border-amber-500/30 text-amber-700 text-[10px] font-mono font-bold transition-all duration-300 cursor-pointer hover:shadow-xs"
                        >
                          "YARED-GOLD-2026"
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-sans font-extrabold text-[#111111] uppercase tracking-[0.15em]">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full h-11 bg-white border border-[#D4AF37]/40 focus:border-[#D4AF37] rounded-xl pl-4 pr-11 text-sm text-[#111111] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all duration-300 font-sans font-semibold"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37] transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-sans font-extrabold text-[#111111] uppercase tracking-[0.15em]">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full h-11 bg-white border border-[#D4AF37]/40 focus:border-[#D4AF37] rounded-xl px-4 text-sm text-[#111111] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all duration-300 font-sans font-semibold"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-[#111111] to-[#2D2D2D] text-[#D4AF37] border border-[#D4AF37]/40 font-serif font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.99] transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <span>Save & Reset Password</span>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {/* 3. RESET SUCCESS VIEW */}
            {viewMode === 'reset-success' && (
              <motion.div
                key="reset-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center py-5 space-y-5 relative z-10"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-600 mx-auto flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-serif font-bold text-2xl text-[#111111]">
                  Password Reset Complete
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto font-sans font-medium">
                  {forgotSuccessMessage || 'Your password has been securely updated. You can now log into the executive portal with your new credentials.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('login');
                    setLoginError('');
                  }}
                  className="w-full h-12 rounded-xl bg-[#111111] text-[#D4AF37] border border-[#D4AF37]/35 font-serif font-bold text-xs uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#111111] transition-all duration-300 cursor-pointer shadow-md"
                >
                  Proceed to Sign In
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  );
};
