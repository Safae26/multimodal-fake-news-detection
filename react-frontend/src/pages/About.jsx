import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MapPin, Globe, CheckCircle, Github, Linkedin, MessageSquare, ShieldAlert, Star, Send, Lock, Trash2, GraduationCap, Loader, ExternalLink } from 'lucide-react';
import AlertBox from '../components/AlertBox';
import { useLanguage } from '../context/LanguageContext';

export default function About({ user }) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('story'); // story, reviews, contact, legal
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['story', 'reviews', 'contact'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);



  // Comments & Reviews state
  const [comments, setComments] = useState(() => {
    const saved = localStorage.getItem('user_comments');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentInstitution, setNewCommentInstitution] = useState('');
  const [newCommentRating, setNewCommentRating] = useState(5);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentSuccess, setCommentSuccess] = useState('');

  // Contact Form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  const sponsorLinks = [
    { label: 'GitHub Sponsors', href: 'https://github.com/sponsors/Safae26' },
    { label: 'Patreon', href: 'https://www.patreon.com/safaeeraji' },
    { label: 'OpenCollective', href: 'https://opencollective.com/multimodal-fake-news-detection' },
    { label: 'Buy Me a Coffee', href: 'https://buymeacoffee.com/safaeeraji' }
  ];

  const roadmapItems = [
    t('aboutRoadmapItem1'),
    t('aboutRoadmapItem2'),
    t('aboutRoadmapItem3'),
    t('aboutRoadmapItem4')
  ];

  useEffect(() => {
    if (user) {
      const displayName = user.full_name || user.first_name || user.username || '';
      setContactName(displayName);
      setContactEmail(user.email || '');
      setNewCommentName(displayName);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('user_comments', JSON.stringify(comments));
  }, [comments]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!user) return;
    if (!newCommentName.trim() || !newCommentText.trim()) return;

    const newComment = {
      id: Date.now(),
      name: newCommentName.trim(),
      institution: newCommentInstitution.trim() || 'Independent Reviewer',
      rating: newCommentRating,
      text: newCommentText.trim(),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      username: user?.username || null
    };

    setComments((prev) => [newComment, ...prev]);
    setNewCommentName('');
    setNewCommentInstitution('');
    setNewCommentRating(5);
    setNewCommentText('');
    setCommentSuccess(t('aboutReviewSuccess'));
    setTimeout(() => setCommentSuccess(''), 4000);
  };

  const handleDeleteReview = (id) => {
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;

    setIsSubmittingContact(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName.trim(),
          email: contactEmail.trim(),
          subject: contactSubject.trim(),
          message: contactMessage.trim()
        })
      });

      setContactSuccess(t('aboutContactSuccess'));
      setContactSubject('');
      setContactMessage('');
      setTimeout(() => setContactSuccess(''), 5000);
    } catch (err) {
      console.error(err);
      setContactSuccess(t('aboutContactSuccess'));
      setContactSubject('');
      setContactMessage('');
      setTimeout(() => setContactSuccess(''), 5000);
    } finally {
      setIsSubmittingContact(false);
    }
  };


  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Left-aligned Bordered Header Card */}
      <div className="relative mb-12 p-8 sm:p-10 md:p-12 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden text-start">
        {/* Glow Backdrops */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/15 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/15 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 max-w-3xl space-y-4">
          {/* Academic Badge with Gradient Border */}
          <div className="inline-flex p-[1px] rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 shadow-sm">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-[11px] bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 text-xs font-bold tracking-wide">
              <span className="p-1 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs">
                <GraduationCap className="w-3.5 h-3.5" />
              </span>
              <span>{t('aboutAcademicInitiative')}</span>
            </div>
          </div>

          {/* Main Title (No Pink) */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold tracking-tight leading-[1.2] text-slate-900 dark:text-white">
            {t('aboutHeroTitle')}{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 dark:from-indigo-400 dark:via-indigo-300 dark:to-violet-400 bg-clip-text text-transparent">
              {t('aboutHeroTitleHighlight')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 dark:text-slate-350 text-sm sm:text-base md:text-lg font-medium leading-relaxed max-w-2xl">
            {t('aboutHeroSubtitle')}
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 mb-12">
        <button
          onClick={() => setActiveTab('story')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'story'
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
            : 'text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
        >
          {t('team')}
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'reviews'
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
            : 'text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
        >
          {t('peerReviews')}
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'contact'
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
            : 'text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
        >
          {t('support')}
        </button>
      </div>

      {/* TAB CONTENT: Our Story & Team */}
      {activeTab === 'story' && (
        <div className="space-y-16 animate-fade-in-up">
          {/* Story & History Section */}
          <section className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-6">
              <h2 className="text-3xl font-display font-black text-slate-900 dark:text-white text-center">
                {t('aboutStoryTitle')}
              </h2>
              <div className="space-y-4 text-slate-600 dark:text-slate-350 text-sm md:text-base leading-relaxed text-start">
                <p>
                  {t('aboutStoryP1')}
                </p>
                <p>
                  {t('aboutStoryP2')}
                </p>
                <p>
                  {t('aboutStoryP3')}
                </p>
              </div>
            </div>
          </section>

          {/* Research Team */}
          <section>
            <h2 className="text-3xl font-display font-black text-center text-slate-900 dark:text-white mb-12">
              {t('aboutTeamTitle')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Safae ERAJI */}
              <div className="group relative bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-300 overflow-hidden hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-[0_0_24px_4px_rgba(99,102,241,0.18)]">

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="size-24 rounded-full mb-6 bg-indigo-50 dark:bg-slate-800 flex items-center justify-center border border-indigo-100 dark:border-slate-750 overflow-hidden">
                    <img
                      src="/assets/admin/safae.jpeg"
                      alt="Safae ERAJI"
                      className="size-20 rounded-full object-cover"
                    />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Safae ERAJI</h3>
                  <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider mt-1 mb-4">{t('aboutSafaeRole')}</p>

                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                    {t('aboutSafaeBio')}
                  </p>

                  <div className="flex gap-2">
                    <a href="https://github.com/Safae26" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all">
                      <Github className="h-5 w-5" />
                    </a>
                    <a href="https://www.linkedin.com/in/safae-eraji-230083270" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all">
                      <Linkedin className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Supervisor */}
              <div className="group relative bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-300 overflow-hidden hover:border-violet-400 dark:hover:border-violet-500 hover:shadow-[0_0_24px_4px_rgba(139,92,246,0.18)]">

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="size-24 rounded-full mb-6 bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-violet-500/10 dark:from-indigo-950/40 dark:to-purple-950/40 flex items-center justify-center border border-indigo-500/20 shadow-xs">
                    <div className="size-20 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md tracking-wider">
                      EE
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pr. Ed-Drissiya EL-ALLALY</h3>
                  <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider mt-1 mb-4">{t('aboutSupervisorRole')}</p>

                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                    {t('aboutSupervisorBio')}
                  </p>

                  <div className="flex gap-2">
                    <a href="https://www.linkedin.com/in/ed-drissiya-el-allaly-b8b41b116/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all">
                      <Linkedin className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm text-start space-y-4">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {t('aboutSupportTitle')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed">
                {t('aboutSupportSubtitle')}
              </p>

              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-350">
                <li>• {t('aboutImpactItem1')}</li>
                <li>• {t('aboutImpactItem2')}</li>
                <li>• {t('aboutImpactItem3')}</li>
                <li>• {t('aboutImpactItem4')}</li>
              </ul>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {sponsorLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 bg-indigo-50/60 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors text-xs font-bold"
                  >
                    {link.label}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  to="/analyzer"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
                >
                  {t('aboutTryDemo')}
                </Link>
                <a
                  href="https://github.com/Safae26/multimodal-fake-news-detection#-setup--deployment-guide"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {t('aboutQuickstartGuide')}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm text-start space-y-4">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {t('aboutRoadmapTitle')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed">
                {t('aboutRoadmapSubtitle')}
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-350">
                {roadmapItems.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t('aboutVisibilityText')}
              </p>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-350">
                <p className="font-bold text-slate-700 dark:text-slate-250">{t('aboutRecognitionTitle')}</p>
                <p>• {t('aboutRecognitionItem1')}</p>
                <p>• {t('aboutRecognitionItem2')}</p>
                <p>• {t('aboutRecognitionItem3')}</p>
              </div>
            </div>
          </section>


        </div>
      )}

      {/* TAB CONTENT: Peer Reviews & Comments */}
      {activeTab === 'reviews' && (
        <div className="space-y-12 animate-fade-in-up">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">

            {/* Reviews display side */}
            <div className="lg:col-span-3 space-y-6">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-indigo-600" />
                {t('aboutUserReviewsPrefix')} ({comments.length})
              </h2>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {comments.map((comm) => (
                  <div
                    key={comm.id}
                    className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm transition-all duration-300"
                  >
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <div className="text-start">
                        <h4 className="font-bold text-slate-900 dark:text-white leading-none">
                          {comm.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-bold block mt-1">
                          {comm.institution}
                        </span>
                      </div>
                      <div className="flex gap-0.5 text-amber-500 shrink-0">
                        {Array.from({ length: comm.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-350 text-xs leading-relaxed italic text-start">
                      "{comm.text}"
                    </p>
                    <div className="flex justify-between items-end mt-3">
                      <span className="text-[9px] text-slate-400 font-mono block text-start">
                        {comm.timestamp}
                      </span>
                      {user?.is_admin && (
                        <button
                          onClick={() => handleDeleteReview(comm.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                          title="Delete review (Admin)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leave a review side */}
            {user ? (
              <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-250/50 dark:border-slate-850 p-6 rounded-2xl h-fit text-start">
                <h3 className="font-black text-slate-900 dark:text-white text-base mb-4">
                  {t('aboutSubmitReview')}
                </h3>

                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  {commentSuccess && (
                    <AlertBox type="success" icon={CheckCircle}>{commentSuccess}</AlertBox>
                  )}

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                      {t('aboutYourName')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        readOnly
                        value={newCommentName}
                        className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold cursor-not-allowed select-none"
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                      {t('aboutInstitution')} <span className="text-slate-400 font-normal lowercase">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={newCommentInstitution}
                      onChange={(e) => setNewCommentInstitution(e.target.value)}
                      placeholder={t('aboutInstitutionPlaceholder')}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                      {t('aboutRatingScore')}
                    </label>
                    <select
                      value={newCommentRating}
                      onChange={(e) => setNewCommentRating(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="5">{t('rating5')}</option>
                      <option value="4">{t('rating4')}</option>
                      <option value="3">{t('rating3')}</option>
                      <option value="2">{t('rating2')}</option>
                      <option value="1">{t('rating1')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                      {t('aboutYourComments')}
                    </label>
                    <textarea
                      required
                      rows="3"
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder={t('aboutCommentsPlaceholder')}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500 font-medium"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {t('aboutPostReview')}
                  </button>
                </form>
              </div>
            ) : (
              <div className="lg:col-span-2 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  {t('aboutAuthRequired')}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-xs">
                  {t('aboutAuthRequiredDesc')}
                </p>
                <Link
                  to="/login"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  {t('aboutSignInRegister')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      {/* TAB CONTENT: Contact Information */}
      {activeTab === 'contact' && (
        <div className="space-y-12 animate-fade-in-up">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">

            {/* Institution Contact Information */}
            <div className="lg:col-span-2 space-y-6 text-start">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {t('aboutContactInfo')}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                {t('aboutContactSubtitle')}
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                  <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{t('aboutInstLocation')}</span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {t('aboutInstLocationValue')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                  <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{t('aboutWebsiteLink')}</span>
                    <a href="https://www.fs-umi.ac.ma/" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                      fs-umi.ac.ma
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Contact Form */}
            {user ? (
              <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 rounded-3xl shadow-sm text-start">
                <h3 className="font-black text-slate-900 dark:text-white text-lg mb-6">
                  {t('aboutSendInquiry')}
                </h3>

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  {contactSuccess && (
                    <AlertBox type="success" icon={CheckCircle}>{contactSuccess}</AlertBox>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                        {t('aboutYourName')}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          readOnly
                          value={contactName}
                          className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold cursor-not-allowed select-none"
                        />
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                        {t('aboutEmailAddress')}
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          readOnly
                          value={contactEmail}
                          className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold cursor-not-allowed select-none"
                        />
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                      {t('aboutSubject')}
                    </label>
                    <input
                      type="text"
                      required
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      placeholder={t('aboutSubjectPlaceholder')}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                      {t('aboutMessageBody')}
                    </label>
                    <textarea
                      required
                      rows="4"
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder={t('aboutMessagePlaceholder')}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingContact}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isSubmittingContact ? (
                      <>
                        <Loader className="w-3.5 h-3.5 animate-spin" />
                        <span>{t('aboutSendMessage')}...</span>
                      </>
                    ) : (
                      t('aboutSendMessage')
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="lg:col-span-3 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  {t('aboutAuthRequired')}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm leading-relaxed">
                  {t('aboutInquiryAuthDesc')}
                </p>
                <a
                  href="/login"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  {t('aboutSignInRegister')}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}