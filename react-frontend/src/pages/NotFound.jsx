import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, Search, BookOpen, User, HelpCircle } from 'lucide-react';

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState('');

  const searchItems = [
    { name: 'Home Dashboard', path: '/', desc: 'Analyze overall performance statistics and active scans.' },
    { name: 'Verify News (Analyzer Services)', path: '/analyzer', desc: 'Input text headlines, images, or video sources for multimodal classification.' },
    { name: 'Research Story & Team', path: '/about?tab=story', desc: 'Read how FakeNewsHunter started at Moulay Ismail University.' },
    { name: 'Peer Reviews & Comments', path: '/about?tab=reviews', desc: 'Read reviews or write feedback about model architectures.' },
    { name: 'Academic Contact & Inquiry Support', path: '/about?tab=contact', desc: 'Submit research inquiries directly to our lab.' },
  ];

  const filteredItems = searchQuery.trim() === ''
    ? []
    : searchItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 relative">
      <div className="max-w-xl w-full text-center space-y-8 relative z-10">
        {/* Animated Error Illustration */}
        <div className="relative inline-block">
          <div className="absolute inset-0 rounded-full bg-red-500/10 blur-xl animate-pulse"></div>
          <div className="relative p-6 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-200/50 dark:border-red-900/30">
            <AlertTriangle className="h-12 w-12 stroke-[2]" />
          </div>
        </div>

        {/* Apology & Message */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-display font-black text-slate-900 dark:text-white">
            Page Not Found (404)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
            We apologize. The page, model parameters, or classification logs you requested do not exist or have been moved.
          </p>
        </div>

        {/* Re-engagement Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="text-left">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Search Site Directory</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Find models, pages, or guidelines instantly below</p>
          </div>
          <div className="relative flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5">
            <Search className="h-4 w-4 text-slate-450 shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Type to search our site index..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:outline-none"
            />
          </div>

          {/* Dynamic Search Results */}
          {searchQuery.trim() !== '' && (
            <div className="border-t border-slate-100 dark:border-slate-850 pt-3 space-y-2 max-h-[180px] overflow-y-auto">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.path}
                    className="flex flex-col text-left p-2.5 rounded-xl hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 border border-transparent hover:border-indigo-100/50 dark:hover:border-indigo-900/30 transition-all group"
                  >
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 line-clamp-1">
                      {item.desc}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="text-center py-4 text-slate-400 text-xs">
                  No matching directory items found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Help & Redirect buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-tr from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all text-center flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Return to Dashboard
          </Link>
          <Link
            to="/analyzer"
            className="w-full sm:w-auto px-6 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-250 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-xs font-bold hover:scale-[1.02] active:scale-95 transition-all text-center flex items-center justify-center gap-2"
          >
            Scan New Claim
          </Link>
        </div>

        {/* Alternate helpful links list */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-slate-450 dark:text-slate-500">
            <Link to="/about?tab=story" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              Research Story
            </Link>
            <Link to="/about?tab=contact" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              Academic Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
