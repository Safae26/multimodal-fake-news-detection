import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, X, Eye } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent_accepted');
    if (!consent) {
      // Delay display slightly for better UX
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookie_consent_accepted', 'all');
    setVisible(false);
  };

  const handleAcceptNecessary = () => {
    localStorage.setItem('cookie_consent_accepted', 'necessary');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-6 rtl:right-6 rtl:left-auto z-[999] max-w-sm w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 text-left rtl:text-right animate-fade-in-up">
      <div className="flex items-start justify-between gap-3">
        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="space-y-1.5 flex-grow">
          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
            {t('cookieTitle')}
          </h4>
          <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed font-medium">
            {t('cookieDesc')}
          </p>
        </div>
        <button 
          onClick={handleAcceptNecessary}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 p-1 transition-colors"
          title="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-2 mt-4 pt-1 border-t border-slate-100 dark:border-slate-850">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleAcceptAll}
            className="w-full py-2 bg-gradient-to-tr from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-[10px] font-black shadow-sm transition-all text-center hover:scale-[1.02]"
          >
            {t('cookieAccept')}
          </button>
          <button
            onClick={handleAcceptNecessary}
            className="w-full py-2 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-black transition-all text-center hover:scale-[1.02]"
          >
            {t('cookieNecessary')}
          </button>
        </div>
        <Link
          to="/about?tab=story"
          onClick={() => setVisible(false)}
          className="inline-flex items-center justify-center gap-1.5 py-1.5 text-[9px] font-bold text-slate-450 hover:text-indigo-600 dark:hover:text-indigo-500 transition-colors"
        >
          <Eye className="h-3 w-3" />
          {t('cookieReview')}
        </Link>
      </div>
    </div>
  );
}
