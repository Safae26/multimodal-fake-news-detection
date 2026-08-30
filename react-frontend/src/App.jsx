import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ArrowUp, Languages, Check } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Analyzer from './pages/Analyzer';
import Dossiers from './pages/Dossiers';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import SocialStream from './pages/SocialStream';
import CookieConsent from './components/CookieConsent';

// Automatically append ngrok-skip-browser-warning header to all fetch API calls
if (typeof window !== 'undefined' && !window.__fetch_patched__) {
  window.__fetch_patched__ = true;
  const originalFetch = window.fetch;
  window.fetch = function (url, options = {}) {
    options = options || {};
    options.headers = {
      'ngrok-skip-browser-warning': 'true',
      ...(options.headers || {})
    };
    return originalFetch(url, options);
  };
}

export default function App() {
  const [showFloatLang, setShowFloatLang] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [isInitializing, setIsInitializing] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Sync dark mode class name
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Monitor scroll for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Verify JWT on boot
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        try {
          const res = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            },
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setUser(data.user);
              setToken(storedToken);
            } else {
              logout();
            }
          } else {
            logout();
          }
        } catch (err) {
          clearTimeout(timeoutId);
          console.error('Session verification failed, fallback to local storage credentials if present.', err);
          const localUser = localStorage.getItem('user');
          if (localUser) {
            try {
              setUser(JSON.parse(localUser));
              setToken(storedToken);
            } catch {
              logout();
            }
          }
        }
      }
      setIsInitializing(false);
    };

    verifySession();
  }, []);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => { });
  };

  const updateUserState = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="relative">
          <div className="size-12 rounded-full border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
          {/* Tech Grid Pattern Background */}
          <div className="absolute inset-0 opacity-[0.35] dark:opacity-[0.25] bg-[linear-gradient(to_right,#4f46e50c_1px,transparent_1px),linear-gradient(to_bottom,#4f46e50c_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0"></div>
          {/* Soft glowing ambient lights */}
          <div className="absolute top-[-20%] left-[-10%] w-[50%] aspect-square rounded-full bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 dark:from-indigo-600/5 dark:to-violet-600/5 blur-[120px] pointer-events-none z-0"></div>
          <div className="absolute bottom-[10%] right-[-10%] w-[45%] aspect-square rounded-full bg-gradient-to-br from-violet-500/10 to-indigo-500/10 dark:from-violet-600/5 dark:to-indigo-600/5 blur-[120px] pointer-events-none z-0"></div>
          
          <Navbar darkMode={darkMode} setDarkMode={setDarkMode} user={user} logout={logout} />

          <main className="flex-grow relative z-10">
            <Routes>
              <Route
                path="/"
                element={user && user.is_admin ? <Navigate to="/admin" replace /> : <Home />}
              />
              <Route
                path="/analyzer"
                element={user ? (user.is_admin ? <Navigate to="/admin" replace /> : <Analyzer token={token} user={user} />) : <Navigate to="/login" replace />}
              />
              <Route
                path="/dossiers"
                element={user ? (user.is_admin ? <Navigate to="/admin" replace /> : <Dossiers token={token} user={user} />) : <Navigate to="/login" replace />}
              />
              <Route
                path="/about"
                element={user && user.is_admin ? <Navigate to="/admin" replace /> : <About user={user} />}
              />
              <Route
                path="/stream"
                element={user ? (user.is_admin ? <Navigate to="/admin" replace /> : <SocialStream />) : <Navigate to="/login" replace />}
              />
              <Route
                path="/login"
                element={!user ? <Login login={login} /> : <Navigate to={user.is_admin ? "/admin" : "/analyzer"} replace />}
              />
              <Route
                path="/register"
                element={!user ? <Register /> : <Navigate to={user.is_admin ? "/admin" : "/analyzer"} replace />}
              />
              <Route
                path="/profile"
                element={user ? <Profile user={user} token={token} updateUserState={updateUserState} /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/admin"
                element={user && user.is_admin ? <Admin token={token} /> : <Navigate to="/" replace />}
              />
              <Route
                path="*"
                element={user && user.is_admin ? <Navigate to="/admin" replace /> : <NotFound />}
              />
            </Routes>
          </main>

          {!user?.is_admin && <Footer />}
          {!user?.is_admin && <CookieConsent />}

          {/* Sticky Back-to-Top Button */}
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 rtl:left-6 rtl:right-auto z-[99] p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl hover:scale-105 active:scale-95 transition-all animate-fade-in border border-indigo-500/20"
              title="Scroll back to top"
            >
              <ArrowUp className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}

          {/* Floating Translate Scrollbutton */}
          {!user?.is_admin && (
            <div className="fixed bottom-6 left-6 rtl:right-6 rtl:left-auto z-[99] flex flex-col items-center">
              {showFloatLang && (
                <div className="mb-2 flex flex-col gap-2 p-1.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 shadow-2xl animate-fade-in-up max-h-64 overflow-y-auto custom-scrollbar">
                  {[
                    { code: 'en', name: 'English', flag: '🇬🇧' },
                    { code: 'fr', name: 'Français', flag: '🇫🇷' },
                    { code: 'ar', name: 'العربية', flag: '🇲🇦' }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); setShowFloatLang(false); }}
                      className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all w-28 ${language === lang.code ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      title={lang.name}
                    >
                      <span className="flex items-center gap-2"><span>{lang.flag}</span> <span className="uppercase">{lang.code}</span></span>
                      {language === lang.code && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowFloatLang(!showFloatLang)}
                className="p-3 rounded-xl bg-white dark:bg-slate-900 text-slate-750 dark:text-slate-100 shadow-xl border border-slate-200/50 dark:border-slate-800/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                title="Translate website"
              >
                <Languages className="w-5 h-5 text-indigo-600 dark:text-indigo-400 stroke-[2.5]" />
                <span className="text-[10px] font-extrabold uppercase select-none opacity-80 leading-none">{language}</span>
              </button>
            </div>
          )}
        </div>
    </Router>
  );
}
