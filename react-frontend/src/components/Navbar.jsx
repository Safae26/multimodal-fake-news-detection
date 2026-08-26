import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, Shield, LogOut, Check, Languages, ChevronDown, Home, Zap, Sparkles, FileText, Info, LogIn, UserPlus } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({ darkMode, setDarkMode, user, logout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const location = useLocation();
  const { confirmAction, toast } = useAlert();
  const { language, setLanguage, t } = useLanguage();
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLangDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    confirmAction({
      title: t('navLogout'),
      message: t('logoutConfirmMsg'),
      type: 'danger',
      onConfirm: () => {
        logout();
        toast(t('logoutSuccessMsg'), 'success');
      }
    });
  };

  const handleThemeToggle = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    toast(`${nextMode ? 'Dark theme' : 'Light theme'} activated!`, 'success');
  };

  const navLinks = user && user.is_admin ? [
    { name: t('navAdmin'), path: '/admin', icon: <Shield className="w-4.5 h-4.5" /> }
  ] : [
    { name: t('navHome'), path: '/', icon: <Home className="w-4.5 h-4.5" /> },
    { name: t('navSocialStream'), path: '/stream', icon: <Zap className="w-4.5 h-4.5" /> },
    { name: t('navAnalyzer'), path: '/analyzer', icon: <Sparkles className="w-4.5 h-4.5" /> },
    ...(user ? [{ name: t('navDossiers'), path: '/dossiers', icon: <FileText className="w-4.5 h-4.5" /> }] : []),
    { name: t('navAbout'), path: '/about', icon: <Info className="w-4.5 h-4.5" /> },
  ];

  const languagesList = [
    { code: 'en', name: 'English', label: 'EN' },
    { code: 'fr', name: 'Français', label: 'FR' },
    { code: 'ar', name: 'العربية', label: 'AR' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left Side: Logo & Desktop Links */}
          <div className="flex items-center gap-10">
            {/* Logo */}
            <Link to={user && user.is_admin ? "/admin" : "/"} className="flex items-center gap-2 group text-left">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-md shadow-indigo-500/20 text-white">
                <Shield className="h-6 w-6" />
              </div>
              <span dir="ltr" className="font-display font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 pr-2 [direction:ltr]">
                FakeNews <span className="text-indigo-600 dark:text-indigo-400">Hunter</span>
                <span className="inline-flex items-center justify-center p-0.5 rounded-full bg-emerald-500 text-white shadow-sm" title="AI Verification Admin">
                  <Check className="h-3 w-3 stroke-[3]" />
                </span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-4 xl:gap-6 whitespace-nowrap">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  id={link.id}
                  to={link.path}
                  className={`text-xs xl:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${isActive(link.path)
                      ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side Buttons */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4 shrink-0 whitespace-nowrap">
            {/* Language Selector Dropdown */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-200 shrink-0"
                title="Select Language"
              >
                <Languages className="h-4.5 w-4.5 shrink-0" />
                <span className="text-xs xl:text-sm font-semibold uppercase">{language}</span>
                <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
              </button>
              {showLangDropdown && (
                <div className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-40 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl py-1 z-50 animate-fade-in`}>
                  {languagesList.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLangDropdown(false);
                        toast(`Language set to ${lang.name}`, 'success');
                      }}
                      className={`flex items-center justify-between w-full px-4 py-2.5 text-xs xl:text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors ${language === lang.code ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-slate-100 dark:bg-slate-900' : 'text-slate-700 dark:text-slate-300'
                        }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.name}</span>
                      </span>
                      {language === lang.code && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-200 shrink-0"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3.5 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all text-xs xl:text-sm shrink-0 whitespace-nowrap"
                >
                  <img
                    src={(user.username === 'admin' && (!user.profile_picture || user.profile_picture.includes('images.unsplash.com') || user.profile_picture.includes('dicebear.com'))) ? '/assets/admin/safae.jpeg' : (user.profile_picture || `https://api.dicebear.com/9.x/notionists/svg?seed=${user.username}`)}
                    alt="User Profile"
                    className="h-5 w-5 rounded-full object-cover border border-indigo-500/20 shrink-0"
                    onError={(e) => {
                      e.target.src = user.username === 'admin' ? '/assets/admin/safae.jpeg' : `https://api.dicebear.com/9.x/notionists/svg?seed=${user.username}`;
                    }}
                  />
                  <span>{user.first_name || user.username}</span>
                </Link>
                <button
                  onClick={handleLogoutClick}
                  className="p-2.5 rounded-xl border border-red-200/50 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 shrink-0"
                  title={t('navLogout')}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  to="/login"
                  className="px-4 py-2.5 text-xs xl:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shrink-0 whitespace-nowrap"
                >
                  {t('navSignIn')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 transition-all text-xs xl:text-sm text-center shrink-0 whitespace-nowrap"
                >
                  {t('navRegister')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile/Tablet Menu Button */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Menu Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 top-16 bg-slate-950/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile/Tablet Menu Drawer */}
      {isOpen && (
        <div className="relative z-50 lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 shadow-2xl animate-fade-in-up">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center justify-between py-3 px-4 rounded-2xl text-base font-semibold transition-all duration-200 ${isActive(link.path)
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold border-l-4 border-indigo-600 shadow-sm'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
            >
              <span className="flex items-center gap-3">
                <span className={isActive(link.path) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}>
                  {link.icon}
                </span>
                <span>{link.name}</span>
              </span>
              {isActive(link.path) && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
            </Link>
          ))}

          {/* Mobile Language Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 my-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Languages className="w-4 h-4 text-indigo-500" /> {t('language')}
            </span>
            <div className="flex w-full sm:w-auto gap-2">
              {languagesList.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                    toast(t('langChangedMsg'), 'success');
                  }}
                  className={`flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl text-xs font-black tracking-wide transition-all flex items-center justify-center gap-1 ${language === lang.code
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 scale-[1.02]'
                      : 'bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                >
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-1">
            {user ? (
              <div className="space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 text-sm"
                >
                  <img
                    src={(user.username === 'admin' && (!user.profile_picture || user.profile_picture.includes('images.unsplash.com') || user.profile_picture.includes('dicebear.com'))) ? '/assets/admin/safae.jpeg' : (user.profile_picture || `https://api.dicebear.com/9.x/notionists/svg?seed=${user.username}`)}
                    alt="User Profile"
                    className="h-6 w-6 rounded-full object-cover border border-indigo-500/20"
                    onError={(e) => {
                      e.target.src = user.username === 'admin' ? '/assets/admin/safae.jpeg' : `https://api.dicebear.com/9.x/notionists/svg?seed=${user.username}`;
                    }}
                  />
                  <div className="flex flex-col text-left">
                    <span className="leading-none">{user.first_name || user.username}</span>
                    <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">{user.email || 'View Profile'}</span>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogoutClick();
                  }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 font-bold text-red-600 dark:text-red-400 text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  {t('navLogout')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3.5 text-center font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-2xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-indigo-500" />
                  {t('navSignIn')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3.5 text-center bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-2xl text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  {t('navRegister')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
