import React, { useState, useEffect, useRef } from 'react';
import {
    Play, Pause, RefreshCw,
    Calendar, Heart, Share2, ExternalLink,
    Zap, MousePointerClick, AlertCircle, ScanSearch
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAlert } from '../context/AlertContext';

export default function SocialStream() {
    const { language } = useLanguage();
    const { toast } = useAlert();
    const [tweets, setTweets] = useState([]);
    const [selectedTweet, setSelectedTweet] = useState(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [systemStatus, setSystemStatus] = useState(null);
    const searchQuery = "news";
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectCountRef = useRef(0);
    const isPlayingRef = useRef(isPlaying);
    isPlayingRef.current = isPlaying;

    const translations = {
        en: {
            title: "Live News Monitor",
            subtitle: "Explore live public social media posts. Select any claim to verify it instantly using AI text and image analysis.",
            statusConnected: "Live Stream Active",
            statusDisconnected: "Stream Paused",
            btnPause: "Pause Stream",
            btnResume: "Resume Stream",
            feedHeader: "Incoming Social Posts",
            panelTitle: "Post Verification Analysis",
            waitingTitle: "Select a post to inspect",
            waitingDesc: "Click any post from the live stream on the left to analyze its truthfulness and evidence.",
            isNotNews: "Casual conversation post — low risk",
            runDetector: "Check for Fake News",
            badgeNews: "News Claim",
            badgeNonNews: "Social Chat",
            viewSource: "View Source",
            searchPlaceholder: "Search a topic (e.g. climate, elections)...",
            searchBtn: "Search",
            loadingTitle: "Connecting to Live Stream…",
            loadingDesc: "Establishing secure real-time stream connection.",
            verifyBtn: "Verify Claim →",
            authorLabel: "Author",
            whatIsThis: "About Live Feed",
            whatIsThisDesc: "This feed streams live public social posts so you can instantly verify claims using AI detection models.",
        },
        fr: {
            title: "Moniteur d'Actualités en Direct",
            subtitle: "Explorez les publications publiques des réseaux sociaux en direct. Sélectionnez une affirmation pour la vérifier instantanément grâce à l'analyse IA du texte et de l'image.",
            statusConnected: "Flux En Direct",
            statusDisconnected: "Flux en Pause",
            btnPause: "Mettre en Pause",
            btnResume: "Reprendre le Flux",
            feedHeader: "Publications Récentes",
            panelTitle: "Analyse du Post",
            waitingTitle: "Sélectionnez une publication",
            waitingDesc: "Cliquez sur une publication dans le fil à gauche pour analyser sa véracité et ses preuves.",
            isNotNews: "Conversation informelle — risque faible",
            runDetector: "Vérifier les Fausses Infos",
            badgeNews: "Actualité",
            badgeNonNews: "Discussion",
            viewSource: "Voir l'Original",
            searchPlaceholder: "Rechercher un sujet (ex. climat, élections)…",
            searchBtn: "Rechercher",
            loadingTitle: "Connexion au Flux en Direct…",
            loadingDesc: "Établissement du flux de données en temps réel.",
            verifyBtn: "Vérifier l'affirmation →",
            authorLabel: "Auteur",
            whatIsThis: "À propos du Fil",
            whatIsThisDesc: "Ce flux diffuse des publications publiques afin que vous puissiez vérifier rapidement la véracité des informations grâce à nos modèles d'IA.",
        },
        ar: {
            title: "مراقب الأخبار المباشر",
            subtitle: "استكشف منشورات وسائل التواصل الاجتماعي المباشرة. اختر أي ادعاء للتحقق منه فوراً باستخدام تحليل الذكاء الاصطناعي للنص والصورة.",
            statusConnected: "البث مباشر",
            statusDisconnected: "البث متوقف",
            btnPause: "إيقاف مؤقت",
            btnResume: "استئناف البث",
            feedHeader: "المنشورات الواردة",
            panelTitle: "تحليل المنشور",
            waitingTitle: "اختر منشورًا للتحليل",
            waitingDesc: "انقر على أي منشور في القائمة لعرض تقرير التحقق بالذكاء الاصطناعي.",
            isNotNews: "محادثة عامة — مخاطر منخفضة",
            runDetector: "فحص الأخبار المزيفة",
            badgeNews: "خبر",
            badgeNonNews: "محادثة",
            viewSource: "عرض المصدر",
            searchPlaceholder: "ابحث عن موضوع (مثل المناخ، الانتخابات)…",
            searchBtn: "بحث",
            loadingTitle: "الاتصال بالبث المباشر…",
            loadingDesc: "جاري الاتصال بخط البيانات المباشر.",
            verifyBtn: "التحقق من الادعاء ←",
            authorLabel: "الناشر",
            whatIsThis: "حول البث المباشر",
            whatIsThisDesc: "يعرض هذا البث منشورات عامة في الوقت الفعلي لتتمكن من التحقق من صحتها فورًا باستخدام نماذج الذكاء الاصطناعي.",
        }
    };

    const localT = translations[language] || translations.en;

    const connectWebSocket = () => {
        if (wsRef.current) return;
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        let wsHost = window.location.host;
        let protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

        if (wsHost.includes('vercel.app')) {
            wsHost = 'dodge-thirsty-clamp.ngrok-free.dev';
            protocol = 'wss:';
        } else if (wsHost.includes('localhost') || wsHost.includes('127.0.0.1')) {
            wsHost = '127.0.0.1:7860';
            protocol = 'ws:';
        }

        const wsUrl = `${protocol}//${wsHost}/api/ws/social-stream?query=${encodeURIComponent(searchQuery)}`;

        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
            setIsConnected(true);
            reconnectCountRef.current = 0;
            toast(`Connected — watching "${searchQuery}"`, "success");
        };

        wsRef.current.onmessage = (event) => {
            try {
                const newTweet = JSON.parse(event.data);
                if (newTweet.id === "rate_limit_info") {
                    toast(newTweet.text, "warning");
                    return;
                }
                setTweets(prev => {
                    // Route @system status messages to the status bar, not the feed
                    if (newTweet.author_handle === '@system' || newTweet.author_name === 'Stream Active' || newTweet.author_name === 'Detection Alert') {
                        setSystemStatus(newTweet.text);
                        return prev;
                    }
                    if (prev.some(t => t.id === newTweet.id)) return prev;
                    return [newTweet, ...prev.slice(0, 19)];
                });
            } catch (err) {
                console.error("Error parsing websocket message payload", err);
            }
        };

        wsRef.current.onclose = () => {
            setIsConnected(false);
            wsRef.current = null;
            if (isPlayingRef.current) {
                const delay = Math.min(1000 * Math.pow(2, reconnectCountRef.current), 30000);
                reconnectCountRef.current += 1;
                reconnectTimeoutRef.current = setTimeout(() => {
                    connectWebSocket();
                }, delay);
            }
        };

        wsRef.current.onerror = (err) => {
            console.error("WebSocket Connection Error", err);
            setIsConnected(false);
        };
    };

    const disconnectWebSocket = () => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        reconnectCountRef.current = 0;
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
            setIsConnected(false);
        }
    };

    useEffect(() => {
        reconnectCountRef.current = 0;
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (isPlaying) {
            connectWebSocket();
        } else {
            disconnectWebSocket();
        }
        return () => {
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            if (wsRef.current) wsRef.current.close();
        };
    }, [isPlaying, searchQuery]);




    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-display font-black tracking-tight flex items-center gap-2.5 text-slate-900 dark:text-white">
                        <Zap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        <span>{localT.title}</span>
                    </h1>
                    <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm max-w-xl">
                        {localT.subtitle}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Live status pill */}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        isConnected
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : isPlaying
                                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                    }`}>
                        <span className={`h-2 w-2 rounded-full ${
                            isConnected 
                                ? 'bg-emerald-500 animate-pulse' 
                                : isPlaying 
                                    ? 'bg-indigo-500 animate-ping' 
                                    : 'bg-slate-400'
                        }`}></span>
                        {isConnected ? localT.statusConnected : isPlaying ? (systemStatus || localT.loadingTitle) : localT.statusDisconnected}
                    </span>

                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all ${isPlaying
                            ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                        }`}
                    >
                        {isPlaying ? (
                            <><Pause className="h-4 w-4" />{localT.btnPause}</>
                        ) : (
                            <><Play className="h-4 w-4 fill-white" />{localT.btnResume}</>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* ── Left: Feed ── */}
                <div className="lg:col-span-7 space-y-3">
                    <div className="flex justify-between items-center px-1 mb-2">
                        <h2 className="text-base font-bold text-slate-700 dark:text-slate-200">
                            {localT.feedHeader}
                            {tweets.length > 0 && (
                                <span className="ml-2 text-xs font-semibold text-slate-400">({tweets.length})</span>
                            )}
                        </h2>
                    </div>

                    {/* System status banner (only when active system notification exists) */}
                    {systemStatus && (
                        <div className="flex items-center gap-3 px-4 py-3 mb-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/30">
                            <RefreshCw className="h-3.5 w-3.5 text-indigo-500 animate-spin shrink-0" />
                            <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium leading-snug">
                                {systemStatus}
                            </p>
                        </div>
                    )}

                    <div className="space-y-3 max-h-[72vh] overflow-y-auto pr-1 custom-scrollbar">
                        {tweets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl border border-dashed border-indigo-200/60 dark:border-indigo-800/30 bg-indigo-50/20 dark:bg-indigo-950/10 text-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center">
                                        <Zap className="h-6 w-6 text-indigo-500" />
                                    </div>
                                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">{localT.loadingTitle}</p>
                                    <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">{localT.loadingDesc}</p>
                                </div>
                            </div>
                        ) : (
                            tweets.map((tweet) => (
                                <button
                                    key={tweet.id}
                                    onClick={() => setSelectedTweet(tweet)}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden ${
                                        selectedTweet?.id === tweet.id
                                            ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                                            : !tweet.is_news_candidate
                                                ? 'border-amber-300/60 dark:border-amber-800/40 bg-amber-50/20 dark:bg-amber-950/10 hover:border-amber-400 dark:hover:border-amber-700'
                                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm'
                                    }`}
                                >
                                    {/* Badge top-right */}
                                    <div className="absolute top-3 right-3 flex gap-1.5 items-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            tweet.is_news_candidate
                                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                        }`}>
                                            {tweet.is_news_candidate ? localT.badgeNews : localT.badgeNonNews}
                                        </span>
                                    </div>

                                    {/* Author row */}
                                    <div className="flex gap-2.5 items-center pr-16">
                                        <img
                                            src={tweet.author_avatar}
                                            alt=""
                                            className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 object-cover shrink-0"
                                            onError={(e) => {
                                                e.target.src = `https://api.dicebear.com/9.x/identicon/svg?seed=${tweet.author_name}`;
                                            }}
                                        />
                                        <div className="min-w-0">
                                            <span className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate block">{tweet.author_name}</span>
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs text-slate-400">{tweet.author_handle}</span>
                                                {tweet.url && (
                                                    <a
                                                        href={tweet.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="text-slate-400 hover:text-indigo-500 transition-colors"
                                                        title="View original post"
                                                    >
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Post text */}
                                    <p className="mt-2.5 text-sm text-slate-700 dark:text-slate-200 leading-relaxed line-clamp-3">
                                        {tweet.text}
                                    </p>

                                    {/* Image */}
                                    {tweet.image_url && (
                                        <div className="mt-3 rounded-xl overflow-hidden border border-slate-200/50 dark:border-slate-800 max-h-48 bg-slate-100 dark:bg-slate-800">
                                            <img
                                                src={tweet.image_url}
                                                alt=""
                                                className="w-full object-cover max-h-48"
                                                referrerPolicy="no-referrer"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="mt-3 flex items-center justify-between text-slate-400 text-xs">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1"><Heart className="h-3 w-3 text-rose-400" />{tweet.likes.toLocaleString()}</span>
                                            <span className="flex items-center gap-1"><Share2 className="h-3 w-3 text-indigo-400" />{tweet.retweets.toLocaleString()}</span>
                                        </div>
                                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{tweet.created_at}</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* ── Right: Analysis Panel ── */}
                <div className="lg:col-span-5">
                    <h2 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2 px-1">
                        <ScanSearch className="h-4 w-4 text-indigo-500" />
                        {localT.panelTitle}
                    </h2>

                    {!selectedTweet ? (
                        /* Empty state */
                        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 p-10 text-center flex flex-col items-center justify-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                                <MousePointerClick className="h-7 w-7 text-indigo-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{localT.waitingTitle}</p>
                                <p className="text-xs text-slate-400 mt-1 max-w-[220px] mx-auto leading-relaxed">{localT.waitingDesc}</p>
                            </div>
                        </div>
                    ) : (
                        /* Selected tweet analysis */
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 shadow-lg overflow-hidden">

                            {/* Author mini-header */}
                            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 min-w-0">
                                    <img src={selectedTweet.author_avatar} alt="" className="w-8 h-8 rounded-full shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-xs text-slate-400">{localT.authorLabel}</p>
                                        <p className="text-sm font-semibold truncate">{selectedTweet.author_name}</p>
                                    </div>
                                </div>
                                {selectedTweet.url && (
                                    <a
                                        href={selectedTweet.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="shrink-0 text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-semibold flex items-center gap-1"
                                    >
                                        {localT.viewSource} <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>

                            {/* Post preview */}
                            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed line-clamp-4">
                                    {selectedTweet.text}
                                </p>
                            </div>

                            {/* AI Result */}
                            <div className="px-5 py-4 space-y-3">
                                {/* Step 1 result (non-news only) */}
                                {!selectedTweet.is_news_candidate && (
                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
                                        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                        <p className="text-sm font-semibold leading-snug text-amber-700 dark:text-amber-300">
                                            {localT.isNotNews}
                                        </p>
                                    </div>
                                )}

                                {/* CTA: Verify with AI */}
                                {selectedTweet.is_news_candidate && (
                                    <button
                                        onClick={() => {
                                            toast("Opening AI verifier…", "info");
                                            const rawText = (selectedTweet.text || '').replace(/🔗/g, '').trim();
                                            const urlRegex = /(https?:\/\/[^\s]+)/gi;
                                            const foundUrls = rawText.match(urlRegex);
                                            const cleanText = rawText.replace(urlRegex, '').replace(/\s+/g, ' ').trim();
                                            const finalUrl = selectedTweet.url || (foundUrls ? foundUrls[0] : '');

                                            window.location.href = `/analyzer?text=${encodeURIComponent(cleanText || rawText)}&image=${encodeURIComponent(selectedTweet.image_url || '')}&source=${encodeURIComponent(selectedTweet.source_name || '')}&url=${encodeURIComponent(finalUrl)}`;
                                        }}
                                        className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/15 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Zap className="h-4 w-4" />
                                        {localT.verifyBtn}
                                    </button>
                                )}
                            </div>


                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
