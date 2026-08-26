import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, ShieldAlert, KeyRound, CheckCircle, 
  AlertCircle, Loader, Camera, Upload, Link as LinkIcon, RefreshCw, Palette,
  Eye, EyeOff
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { useLanguage } from '../context/LanguageContext';

export default function Profile({ user, token, updateUserState }) {
  const { toast } = useAlert();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePic, setProfilePic] = useState('');

  // Custom Avatar Controls
  const [avatarSeed, setAvatarSeed] = useState('');
  const [avatarTab, setAvatarTab] = useState('random'); // random, upload, url
  const [inputUrl, setInputUrl] = useState('');
  const fileInputRef = useRef(null);

  // Accent Theme Customizer State
  const [currentAccent, setCurrentAccent] = useState(() => {
    return localStorage.getItem('accent-color') || 'indigo';
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync user details on boot
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      
      const isDefaultAdminPic = user.username === 'admin' && (
        !user.profile_picture || 
        user.profile_picture.includes('images.unsplash.com/photo-1535713875002-d1d0cf377fde') ||
        user.profile_picture.includes('dicebear.com')
      );
      
      if (isDefaultAdminPic) {
        setProfilePic('/assets/admin/safae.jpeg');
      } else {
        setProfilePic(user.profile_picture || `https://api.dicebear.com/9.x/notionists/svg?seed=${user.username}`);
      }
    }
  }, [user]);

  // Handle Profile Update Submission
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg(t('msgEmailRequired'));
      return;
    }

    if (password && password !== confirmPassword) {
      setErrorMsg(t('msgPassMismatch'));
      return;
    }

    if (password) {
      if (password.length < 8) {
        setErrorMsg('Password must be at least 8 characters long.');
        return;
      }
      if (!/[A-Z]/.test(password)) {
        setErrorMsg('Password must contain at least one uppercase letter (A-Z).');
        return;
      }
      if (!/[a-z]/.test(password)) {
        setErrorMsg('Password must contain at least one lowercase letter (a-z).');
        return;
      }
      if (!/[0-9]/.test(password)) {
        setErrorMsg('Password must contain at least one number (0-9).');
        return;
      }
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: email.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          current_password: currentPassword ? currentPassword : null,
          password: password ? password : null,
          profile_picture: profilePic
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || t('msgFailedUpdate'));
      }

      const data = await response.json();
      if (data.success) {
        updateUserState(data.user);
        setSuccessMsg(t('msgSuccessSave'));
        toast(t('msgSuccessUpdate'), 'success');
        setCurrentPassword('');
        setPassword('');
        setConfirmPassword('');
      } else {
        throw new Error(t('msgUpdateFailed'));
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || t('msgErrorUpdate'));
      toast(err.message || t('msgFailedUpdateProfile'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // DiceBear Generator seed-based
  const generateSeedAvatar = (customSeed) => {
    const seed = customSeed || Math.random().toString(36).substring(7);
    if (!customSeed) {
      setAvatarSeed(seed);
    }
    const avatarUrl = `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}`;
    setProfilePic(avatarUrl);
  };

  // Handle local file selection -> convert to Base64 dataURL
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg(t('msgImgSize'));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
        setSuccessMsg(t('msgPhotoLoadedSubmit'));
        toast(t('msgPhotoLoadedClick'), 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle URL paste
  const applyUrlAvatar = () => {
    if (inputUrl.trim().startsWith('http')) {
      setProfilePic(inputUrl.trim());
      setSuccessMsg(t('msgUrlLoadedSubmit'));
      toast(t('msgUrlLoadedSuccess'), 'success');
    } else {
      setErrorMsg(t('msgValidUrl'));
      toast(t('msgInvalidUrl'), 'error');
    }
  };

  // Change App Color Accent dynamically
  const selectAccentTheme = (accentName) => {
    setCurrentAccent(accentName);
    document.documentElement.setAttribute('data-accent', accentName);
    localStorage.setItem('accent-color', accentName);
    const themeObj = themesList.find(t_theme => t_theme.name === accentName);
    const themeLabel = themeObj ? themeObj.label : accentName;
    toast(`${t('msgAccentChanged')} ${themeLabel}!`, 'success');
  };

  const themesList = [
    { name: 'indigo', label: t('profileThemeIndigo'), color: '#4f46e5', ringClass: 'ring-indigo-400' },
    { name: 'emerald', label: t('profileThemeEmerald'), color: '#059669', ringClass: 'ring-emerald-400' },
    { name: 'rose', label: t('profileThemeRose'), color: '#e11d48', ringClass: 'ring-rose-400' },
    { name: 'amber', label: t('profileThemeAmber'), color: '#d97706', ringClass: 'ring-amber-400' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8 animate-fade-in relative">
      
      {/* Dynamic Glowing Radial Blurs */}
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-indigo-500/10 glowing-bg"></div>
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 glowing-bg" style={{ animationDelay: '4s' }}></div>

      <div className="mb-10 text-center md:text-left relative z-10">
        <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          {user?.is_admin ? t('adminProfileTitle') : t('profileTitle')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {user?.is_admin ? t('adminProfileSubtitle') : t('profileSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        {/* Left Column: Avatar Customizer (cols 4) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center">
          
          {/* Avatar display frame */}
          <div className="relative mb-4">
            <div className="size-28 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border-2 border-indigo-500/20 dark:border-slate-700 overflow-hidden shadow-inner">
              <img
                src={profilePic}
                alt="Profile Avatar"
                className="size-26 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = user?.username === 'admin' ? '/assets/admin/safae.jpeg' : `https://api.dicebear.com/9.x/notionists/svg?seed=${user?.username || 'fallback'}`;
                }}
              />
            </div>
            <div className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full shadow-md border border-white dark:border-slate-900">
              <Camera className="w-4 h-4" />
            </div>
          </div>

          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            @{user?.username || 'username'}
          </h3>
          {Boolean(user?.is_admin) ? (
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest mt-1">
              {t('profileRoleAdmin')}
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mt-1">
              Verified Member
            </p>
          )}

          <div className="border-t border-slate-100 dark:border-slate-800 w-full my-6"></div>

          {/* Picture Customization Tabs */}
          <div className="w-full">
            <h4 className="text-xs font-black text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-3 text-center">
              {t('profileModifyPic')}
            </h4>
            
            {/* Tabs Header */}
            <div className="grid grid-cols-3 gap-1 bg-slate-55 dark:bg-slate-950 p-1 rounded-xl mb-4 text-[10px] font-bold text-slate-500">
              <button
                type="button"
                onClick={() => setAvatarTab('random')}
                className={`py-1.5 rounded-lg text-center transition-all ${avatarTab === 'random' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : ''}`}
              >
                {t('profileTabSeed')}
              </button>
              <button
                type="button"
                onClick={() => setAvatarTab('upload')}
                className={`py-1.5 rounded-lg text-center transition-all ${avatarTab === 'upload' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : ''}`}
              >
                {t('profileTabUpload')}
              </button>
              <button
                type="button"
                onClick={() => setAvatarTab('url')}
                className={`py-1.5 rounded-lg text-center transition-all ${avatarTab === 'url' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : ''}`}
              >
                {t('profileTabUrl')}
              </button>
            </div>

            {/* Tab 1: Seed / Randomizer */}
            {avatarTab === 'random' && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={avatarSeed}
                    onChange={(e) => {
                      setAvatarSeed(e.target.value);
                      generateSeedAvatar(e.target.value);
                    }}
                    placeholder={t('profilePlaceholderSeed')}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs outline-none focus:border-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => generateSeedAvatar('')}
                    className="p-2 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:scale-105 active:scale-95 transition-all"
                    title={t('Generate Random Avatar')}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                  {t('profileSeedDesc')}
                </p>
              </div>
            )}

            {/* Tab 2: Custom File Upload */}
            {avatarTab === 'upload' && (
              <div className="space-y-3 animate-fade-in">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/gif"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 cursor-pointer flex flex-col items-center justify-center gap-1 group transition-all"
                >
                  <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{t('profileChooseFile')}</span>
                  <span className="text-[9px] text-slate-400">{t('profileMaxSize')}</span>
                </button>
              </div>
            )}

            {/* Tab 3: Custom Web URL */}
            {avatarTab === 'url' && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex gap-2">
                  <div className="relative w-full">
                    <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder={t('profilePlaceholderUrl')}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg text-xs outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={applyUrlAvatar}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-all active:scale-95"
                  >
                    {t('profileApply')}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                  {t('profileUrlDesc')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Settings Form & Accents Panel (cols 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main settings container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
            <form onSubmit={handleUpdate} className="space-y-6">
              
              {/* Name fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                    {t('profileFirstName')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder={t('msgJohn')}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                    {t('profileLastName')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-405">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder={t('msgDoe')}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                  {t('profileEmail')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800"></div>

              {/* Change Password Block */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                  {t('profileSecPassword')}
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="current-password"
                        autoComplete="current-password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-4 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                        tabIndex="-1"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                      {t('profileNewPassword')}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="new-password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-4 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                        tabIndex="-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                      {t('profileConfirmPassword')}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirm-password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-4 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                        tabIndex="-1"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Messages */}
              {errorMsg && (
                <div className="flex items-start gap-2 p-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-200/50 dark:border-red-900/30 animate-pulse-subtle">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="flex items-start gap-2 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl border border-emerald-200/50 dark:border-emerald-900/30 animate-fade-in">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 hover:scale-[1.01] transition-all flex items-center justify-center text-xs"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    {t('profileSaving')}
                  </>
                ) : (
                  t('profileUpdateBtn')
                )}
              </button>
            </form>
          </div>

          {/* UNIQUE TOUCH: Accent Theme customizer panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              {t('profileCustomizerTitle')}
            </h4>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-5">
              {t('profileCustomizerDesc')}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {themesList.map((theme) => (
                <button
                  key={theme.name}
                  type="button"
                  onClick={() => selectAccentTheme(theme.name)}
                  className={`p-3.5 border-2 rounded-2xl flex flex-col items-center gap-2.5 transition-all text-xs font-bold ${
                    currentAccent === theme.name 
                      ? 'border-indigo-600 bg-indigo-50/15 dark:bg-indigo-950/20 text-slate-900 dark:text-white shadow-sm' 
                      : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <span 
                    className={`size-6 rounded-full shadow border border-white dark:border-slate-800 ${currentAccent === theme.name ? `ring-4 ${theme.ringClass}/40` : ''}`}
                    style={{ backgroundColor: theme.color }}
                  ></span>
                  {theme.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
