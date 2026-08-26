import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Github, Linkedin, Mail, MapPin, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors duration-300 relative z-10">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 md:gap-10">
          {/* Logo & Description (colspan 4) */}
          <div className="md:col-span-4 space-y-4 ltr:text-left rtl:text-right">
            <Link to="/" className="flex items-center gap-2.5 ltr:justify-start rtl:justify-start">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-md shadow-indigo-500/20 text-white shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              <span dir="ltr" className="font-display font-extrabold text-lg text-slate-900 dark:text-white [direction:ltr]">
                FakeNews <span className="text-indigo-600 dark:text-indigo-400">Hunter</span>
              </span>
            </Link>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              {t('footerDesc')}
            </p>
            <div className="flex gap-2.5 pt-2 ltr:justify-start rtl:justify-start">
              <a 
                href="https://github.com/Safae26" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all hover:scale-105"
                title="GitHub Repository"
              >
                <Github className="h-4 w-4" />
              </a>
              <a 
                href="https://ma.linkedin.com/in/safae-eraji-230083270" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all hover:scale-105"
                title="LinkedIn Profile"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation (colspan 2) */}
          <div className="md:col-span-2 ltr:text-left rtl:text-right">
            <h3 className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-4">{t('quickNav')}</h3>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-650 dark:text-slate-300">
              <li>
                <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('homeDashboard')}</Link>
              </li>
              <li>
                <Link to="/analyzer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('navAnalyzer')}</Link>
              </li>
              <li>
                <Link to="/stream" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('navSocialStream')}</Link>
              </li>
              <li>
                <Link to="/about?tab=story" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('navAbout')}</Link>
              </li>
            </ul>
          </div>

          {/* Community & Support (colspan 3) */}
          <div className="md:col-span-3 ltr:text-left rtl:text-right">
            <h3 className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-4">{t('termsPrivacyHeader')}</h3>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-650 dark:text-slate-300">
              <li>
                <Link to="/about?tab=reviews" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('peerReviews')}</Link>
              </li>
              <li>
                <Link to="/about?tab=contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('support')}</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details (colspan 3) */}
          <div className="md:col-span-3 ltr:text-left rtl:text-right space-y-3">
            <h3 className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-4">{t('academicNode')}</h3>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              <div className="flex items-start gap-2.5 rtl:flex-row">
                <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <p>{t('footerLocation')}</p>
              </div>
              <div className="flex items-center gap-2.5 rtl:flex-row">
                <ExternalLink className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <a href="https://www.fs-umi.ac.ma/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors">
                  fs-umi.ac.ma
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 dark:border-slate-800 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            &copy; 2025 - 2026 FakeNews Hunter &bull; {t('footerThesisProject')} {t('rightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}
