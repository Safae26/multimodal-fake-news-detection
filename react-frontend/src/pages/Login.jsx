import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AlertBox from '../components/AlertBox';
import { Shield, KeyRound, User, Mail, AlertCircle, CheckCircle, Loader, Eye, EyeOff } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { useLanguage } from '../context/LanguageContext';

export default function Login({ login }) {
  const { toast } = useAlert();
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Forgot / Reset Password state
  const [forgotStep, setForgotStep] = useState('none'); // none, email, reset
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetDemoCode, setResetDemoCode] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json().catch(() => ({ detail: 'Authentication failed' }));

      if (!response.ok) {
        throw new Error(data.detail || 'Incorrect credentials');
      }
      if (data.success) {
        login(data.user, data.token);
        setSuccessMsg('Login successful!');
        toast(`Welcome back, ${data.user.first_name || data.user.username}!`, 'success');
        const targetPath = data.user.is_admin ? '/admin' : '/analyzer';
        navigate(targetPath);
      } else {
        throw new Error('Authentication failed');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Incorrect username or password. Please try again.');
      toast(err.message || 'Authentication failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim() })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to request reset token');
      }

      setResetDemoCode(data.demo_code || '');
      setForgotStep('reset');
      setSuccessMsg('Verification reset code generated! Please check your mailbox.');
      toast('Verification reset code sent to your email.', 'success');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Unable to locate an account under this email address.');
      toast(err.message || 'Failed to generate reset code.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetCode.trim() || !newPassword.trim()) {
      setErrorMsg('Please fill in both the code and new password.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setErrorMsg('Password must contain at least one uppercase letter (A-Z).');
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setErrorMsg('Password must contain at least one lowercase letter (a-z).');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setErrorMsg('Password must contain at least one number (0-9).');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail.trim(),
          code: resetCode.trim(),
          new_password: newPassword
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Password reset failed.');
      }

      setSuccessMsg('Security credentials updated! Redirecting to login view...');
      toast('Password reset successfully! Please sign in.', 'success');
      setTimeout(() => {
        setForgotStep('none');
        setResetEmail('');
        setResetCode('');
        setNewPassword('');
        setConfirmNewPassword('');
        setResetDemoCode('');
        setSuccessMsg('');
      }, 2000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Invalid or expired authorization code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 size-96 rounded-full bg-indigo-500/5 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 size-96 rounded-full bg-violet-500/5 blur-3xl"></div>

      <div className="w-full max-w-md space-y-8 relative z-10 animate-fade-in-up">
        {/* Logo and title */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/20 text-white flex items-center justify-center mb-4">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-display font-black text-slate-900 dark:text-white">
            {forgotStep === 'none' && t('loginWelcome')}
            {forgotStep === 'email' && t('loginRecoverTitle')}
            {forgotStep === 'reset' && t('loginResetTitle')}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {forgotStep === 'none' && t('loginSubtitle')}
            {forgotStep === 'email' && t('loginRecoverSub')}
            {forgotStep === 'reset' && t('loginResetSub')}
          </p>
        </div>

        {/* Card Frame */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl text-left rtl:text-right">
          
          {/* STEP 1: Standard Login Form */}
          {forgotStep === 'none' && (
            <form className="space-y-6" onSubmit={handleLogin}>
              {/* Username Input */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                  {t('loginUsername')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. john_doe"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                    {t('loginPassword')}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep('email');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    {t('loginForgot')}
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl pl-10 pr-10 rtl:pr-10 rtl:pl-10 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Notifications */}
              {errorMsg && (
                <AlertBox type="error" icon={AlertCircle}>{errorMsg}</AlertBox>
              )}
              {successMsg && (
                <AlertBox type="success" icon={CheckCircle}>{successMsg}</AlertBox>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 hover:scale-[1.01] transition-all flex items-center justify-center text-sm font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    {t('loginVerifying')}
                  </>
                ) : (
                  t('loginSubmit')
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Email input for Reset Request */}
          {forgotStep === 'email' && (
            <form className="space-y-6" onSubmit={handleForgotPassword}>
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                  {t('loginEmail')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Notifications */}
              {errorMsg && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-200/50 dark:border-red-900/30">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setForgotStep('none');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="flex-1 py-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 font-bold rounded-xl text-xs transition-all"
                >
                  {t('loginCancel')}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl text-xs hover:scale-[1.01] transition-all flex items-center justify-center"
                >
                  {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : t('loginSendCode')}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Reset Validation form */}
          {forgotStep === 'reset' && (
            <form className="space-y-4" onSubmit={handleResetPassword}>
              


              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                  {t('loginVerifyCode')}
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center tracking-[0.5em] font-mono text-base bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                  {t('loginNewPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl px-4 pr-10 rtl:pr-4 rtl:pl-10 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 focus:outline-none"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                  {t('loginConfirmPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl px-4 pr-10 rtl:pr-4 rtl:pl-10 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 focus:outline-none"
                  >
                    {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Notifications */}
              {errorMsg && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-200/50 dark:border-red-900/30">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl border border-emerald-200/50 dark:border-emerald-900/30">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 hover:scale-[1.01] transition-all flex items-center justify-center text-xs"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    {t('loginResetting')}
                  </>
                ) : (
                  t('loginResetSubmit')
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setForgotStep('none');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold transition-colors"
                >
                  &larr; {t('loginBack')}
                </button>
              </div>
            </form>
          )}

          {/* Bottom links */}
          {forgotStep === 'none' && (
            <div className="border-t border-slate-100 dark:border-slate-800 mt-6 pt-4 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('loginNoAccount')}{' '}
                <Link
                  to="/register"
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {t('loginRegisterHere')}
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
