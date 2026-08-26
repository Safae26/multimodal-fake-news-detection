import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, Image as ImageIcon, 
  Globe, Sparkles, Loader, BarChart3, AlertCircle, CheckCircle2, 
  FileDown, ZoomIn, X, Trash2
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { useLanguage } from '../context/LanguageContext';

export default function Analyzer({ token, user }) {
  const { confirmAction, toast } = useAlert();
  const { t } = useLanguage();
  const getCategoryTranslation = (cat) => {
    if (cat?.includes('State of the Art')) return t('modelsParadigm1Title');
    if (cat?.includes('Foundational')) return t('modelsParadigm2Title');
    if (cat?.includes('Adversarial')) return t('modelsParadigm3Title');
    if (cat?.includes('Attention')) return t('modelsParadigm4Title');
    if (cat?.includes('Variational') || cat?.includes('Fusion')) return t('modelsParadigm5Title');
    if (cat?.includes('Optimization') || cat?.includes('PEFT') || cat?.includes('Distilled')) return t('modelsParadigm6Title');
    return cat;
  };
  const getModelKey = (name) => {
    return name.toLowerCase().replace(/ /g, '_').replace(/\+/g, '_plus').replace(/-/g, '_').replace(/\//g, '_').replace(/[()]/g, '');
  };
  // Form fields
  const [selectedModel, setSelectedModel] = useState('EANN');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedDomain, setSelectedDomain] = useState('Politics');
  const [articleText, setArticleText] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  
  // Image upload & Lightbox states
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const fileInputRef = useRef(null);

  // URL Scraper states
  const [scrapingUrl, setScrapingUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeSuccess, setScrapeSuccess] = useState(false);
  const [scrapeError, setScrapeError] = useState('');

  // Dropdown & Dragging UI states
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const modelDropdownRef = useRef(null);

  const modelOptions = [
    { name: 'MIAN', arch: 'Hierarchical HLM + Co-Attention + Inverse Attention (IJCAI 2025)', modalities: ['Text', 'Image', 'Metadata'], category: 'State of the Art (2025/2026)', primary: true },
    { name: 'VCLMMF', arch: 'VAE + Dual Contrastive Learning Projection (2025)', modalities: ['Text', 'Image', 'Metadata'], category: 'State of the Art (2025/2026)', primary: false },
    { name: 'Original CLIP', arch: 'Dual-encoder contrastive', modalities: ['Text', 'Image'], category: 'Foundational & Embedding', primary: false },
    { name: 'EANN', arch: 'Event Adversarial + Multi-branch classifier', modalities: ['Text', 'Image'], category: 'Adversarial & Ambiguity Learning', primary: true },
    { name: 'CAFE', arch: 'Ambiguity-aware cross-modal fusion', modalities: ['Text', 'Image'], category: 'Adversarial & Ambiguity Learning', primary: false },
    { name: 'HMCAN', arch: 'Hierarchical Contextual Attention Network', modalities: ['Text', 'Image'], category: 'Attention & Recurrent', primary: false },
    { name: 'MVAE', arch: 'Multimodal Variational Autoencoder', modalities: ['Text', 'Image'], category: 'Variational, Similarity & Fusion Baselines', primary: false },
    { name: 'SAFE', arch: 'Similarity-Aware Fusion Engine', modalities: ['Text', 'Image'], category: 'Variational, Similarity & Fusion Baselines', primary: false },
    { name: 'Traditional Fusion', arch: 'Early/Late Fusion Classifier', modalities: ['Text', 'Image'], category: 'Variational, Similarity & Fusion Baselines', primary: false }
  ];

  const currentModelObj = modelOptions.find(m => m.name === selectedModel) || modelOptions.find(m => m.name === 'EANN') || modelOptions[0];

  // App UI state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Prediction results
  const [prediction, setPrediction] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [metrics, setMetrics] = useState({
    fakeProbability: 0,
    realProbability: 0,
    textWeight: 0,
    imageWeight: 0,
    videoWeight: 0
  });
  const [timestamp, setTimestamp] = useState('');
  const [explanations, setExplanations] = useState(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target)) {
        setIsModelDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const textParam = params.get('text');
    const imageParam = params.get('image');
    const sourceParam = params.get('source');
    const urlParam = params.get('url');

    if (textParam) {
      const rawText = decodeURIComponent(textParam).replace(/🔗/g, '').trim();
      const urlRegex = /(https?:\/\/[^\s]+)/gi;
      const foundUrls = rawText.match(urlRegex);
      const cleanText = rawText.replace(urlRegex, '').replace(/\s+/g, ' ').trim();

      setArticleText(cleanText || rawText);

      const targetUrl = urlParam ? decodeURIComponent(urlParam) : (foundUrls ? foundUrls[0] : '');
      if (targetUrl) {
        setSourceUrl(targetUrl);
      }
    }
    if (imageParam) {
      const decodedImg = decodeURIComponent(imageParam);
      if (decodedImg) {
        setImagePreview(decodedImg);
        setImageUrl(decodedImg);
      }
    }
    if (sourceParam) {
      setSourceName(decodeURIComponent(sourceParam));
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageUrl('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImageUrl('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = (e) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview('');
    setImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Scrape Claim from news URL
  const handleScrapeUrl = async () => {
    const rawUrl = scrapingUrl.trim();
    if (!rawUrl) return;

    // Validate URL syntax
    const isValidUrl = (str) => {
      try {
        const u = new URL(str.startsWith('http') ? str : `https://${str}`);
        return u.hostname.includes('.');
      } catch (_) {
        return false;
      }
    };

    const formattedUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;

    if (!isValidUrl(rawUrl)) {
      setScrapeError('This is not a valid URL. Please enter a valid website link (e.g., https://news.domain.com/article).');
      toast('This is not a valid URL.', 'error');
      return;
    }

    setIsScraping(true);
    setScrapeSuccess(false);
    setScrapeError('');

    try {
      const res = await fetch('/api/extract-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url: formattedUrl })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'URL content extraction failed');
      }

      const data = await res.json();

      const hasText = Boolean(data.text && data.text.trim());
      const hasImage = Boolean(data.image_url);

      if (!hasText && !hasImage) {
        setScrapeError('No news article text or image could be extracted from this link.');
        toast('No news content found on this link.', 'error');
        return;
      }

      if (hasText) setArticleText(data.text);
      if (hasImage) {
        setImagePreview(data.image_url);
        setImageUrl(data.image_url);
        setImageFile(null);
      }

      setScrapeSuccess(true);
      const parts = [];
      if (hasText) parts.push('article text');
      if (hasImage) parts.push('news image');
      toast(`Extracted ${parts.join(' & ')} from URL successfully!`, 'success');
    } catch (err) {
      console.error(err);
      setScrapeError(err.message || 'Scraper failed to extract article content.');
      toast(err.message || 'URL content extraction failed', 'error');
    } finally {
      setIsScraping(false);
    }
  };

  // Predict endpoint submit
  const startAnalysis = async () => {
    if (!articleText.trim() && !imageFile && !imageUrl) {
      setErrorMsg('Please provide at least one input asset (text or image) to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setHasResults(false);
    setErrorMsg('');

    const formData = new FormData();
    if (articleText) formData.append('text', articleText);
    if (imageFile) formData.append('image', imageFile);
    if (imageUrl) formData.append('image_url', imageUrl);
    formData.append('model', selectedModel);
    formData.append('language', selectedLanguage);
    formData.append('domain', selectedDomain);
    let finalSource = sourceName;
    if (!finalSource) {
      const activeUrl = sourceUrl || scrapingUrl;
      if (activeUrl) {
        finalSource = activeUrl.startsWith('http') ? activeUrl : `https://${activeUrl}`;
      } else {
        finalSource = 'Unknown';
      }
    }
    formData.append('source_name', finalSource);

    try {
      const apiPromise = fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const [response] = await Promise.all([
        apiPromise,
        new Promise(resolve => setTimeout(resolve, 2000)) // ensure premium inference animation runs
      ]);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Inference engine computation failure');
      }

      const data = await response.json();
      
      setPrediction(data.prediction);
      setConfidence(data.confidence);
      setMetrics({
        fakeProbability: data.metrics.fakeProbability,
        realProbability: data.metrics.realProbability,
        textWeight: data.metrics.textWeight,
        imageWeight: data.metrics.imageWeight,
        videoWeight: data.metrics.videoWeight
      });
      setTimestamp(new Date().toLocaleString());
      setExplanations(data.explanations || null);
      setHasResults(true);
      toast('Content analysis completed successfully!', 'success');
      setTimeout(() => document.getElementById('results-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred during analysis. Please try again.');
      toast(err.message || 'Analysis failed.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isInputEmpty = !articleText.trim() && !imageFile && !imageUrl;

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative">
      
      {/* Printable Dossier wrapper */}
      <div id="printable-dossier" className="hidden print:block p-8 bg-white text-slate-900">
        <div className="border-b-2 border-indigo-600 pb-4 mb-6">
          <h1 className="text-2xl font-black uppercase tracking-tight">FakeNewsHunter Claims Dossier</h1>
          <p className="text-xs text-slate-500 font-semibold">MULTIMODAL DEEP LEARNING VERIFICATION REPORT</p>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border">
            <div>
              <p className="text-xs font-bold text-slate-400">ANALYSIS TARGET VERDICT</p>
              <p className="text-lg font-black text-indigo-700">{prediction ? (prediction.includes('Fake') ? t('analyzerVerdictFake') : t('analyzerVerdictReal')) : 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400">CLASSIFICATION CONFIDENCE</p>
              <p className="text-lg font-black text-indigo-700">{confidence.toFixed(1)}%</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400">INPUT TARGET NEWS ARTICLE TEXT CLAIM</p>
            <p className="text-sm bg-slate-50 p-3 rounded-lg italic border">"{articleText || 'No claim text provided'}"</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div><strong>Language:</strong> {selectedLanguage}</div>
            <div><strong>Topic Domain:</strong> {selectedDomain}</div>
            <div><strong>News Source:</strong> {sourceName || 'Unknown'}</div>
          </div>
          <div className="border-t pt-4 text-center text-[10px] text-slate-400 font-mono">
            Generated by @{user?.username || 'user'} at {timestamp}
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="mb-6 print:hidden">
        <h1 className="text-2xl font-display font-black tracking-tight flex items-center gap-2.5 text-slate-900 dark:text-white">
          <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <span>{t('analyzerTitle')}</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm max-w-xl">
          {t('analyzerSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start print:hidden">
        
        {/* Left Input Panel: Form */}
        <div className="lg:col-span-7 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/60 shadow-xl shadow-slate-200/40 dark:shadow-black/20 space-y-6 text-left rtl:text-right">
          
          {/* Multimodal Inputs Stacked */}
          <div className="space-y-4">
            {/* News Text & URL Scraper */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="flex items-center text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  <FileText className="w-3.5 h-3.5 text-indigo-500 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
                  {t('analyzerNewsText')}
                </label>
                {articleText && (
                  <button
                    type="button"
                    onClick={() => setArticleText('')}
                    className="text-[10px] text-slate-450 hover:text-red-500 font-bold uppercase transition-colors"
                  >
                    Clear Text
                  </button>
                )}
              </div>
              
              <div className="relative">
                <textarea
                  rows={5}
                  value={articleText}
                  onChange={(e) => {
                    const val = e.target.value;
                    const urlRegex = /(https?:\/\/[^\s]+)/gi;
                    const foundUrls = val.match(urlRegex);
                    if (foundUrls && foundUrls.length > 0) {
                      if (!sourceUrl) {
                        setSourceUrl(foundUrls[0]);
                      }
                      const cleanVal = val.replace(urlRegex, '').replace(/\s+/g, ' ');
                      setArticleText(cleanVal);
                    } else {
                      setArticleText(val);
                    }
                  }}
                  placeholder={t('analyzerTextPlaceholder')}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-2xl px-5 py-4 text-base md:text-lg font-medium leading-relaxed focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none resize-none transition-all h-[170px] min-h-[140px] text-left rtl:text-right shadow-inner"
                />
                <div className="absolute bottom-3 right-4 rtl:left-4 rtl:right-auto text-xs text-slate-450 dark:text-slate-400 font-mono bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 pointer-events-none shadow-sm">
                  {articleText.trim() ? articleText.trim().split(/\s+/).length : 0} {t('analyzerWords')}
                </div>
              </div>

              {sourceUrl && (
                <div className="mt-2 flex items-center justify-between p-3 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 rounded-2xl animate-fade-in">
                  <div className="flex items-center gap-2 min-w-0">
                    <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">Original Source Link:</span>
                    <a 
                      href={sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline truncate"
                    >
                      {sourceUrl}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSourceUrl('')}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                    title="Dismiss Link"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>

            {/* URL Auto-Fill — extracts both text & image */}
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-2">
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  {t('analyzerExtractClaim')}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={scrapingUrl}
                    onChange={(e) => setScrapingUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleScrapeUrl()}
                    placeholder="https://example.com/news-article"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl pl-4 pr-4 py-3 text-sm md:text-base focus:ring-2 focus:ring-indigo-500/40 focus:border-transparent outline-none text-left rtl:text-right transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleScrapeUrl}
                  disabled={isScraping || !scrapingUrl.trim()}
                  className={`px-5 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shrink-0 transition-all ${
                    isScraping || !scrapingUrl.trim()
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/15 hover:shadow-indigo-500/25'
                  }`}
                >
                  {isScraping ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Globe className="w-4 h-4" />
                  )}
                  {isScraping ? 'Extracting...' : t('analyzerScrape')}
                </button>
              </div>
              {scrapeSuccess && (
                <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t('analyzerScrapeSuccess')}
                </p>
              )}
              {scrapeError && (
                <p className="mt-2 text-xs text-red-500 dark:text-red-400 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {scrapeError.length > 60 ? scrapeError.substring(0, 60) + '...' : scrapeError}
                </p>
              )}
            </div>

            {/* News Visual Evidence */}
            <div className="space-y-2 flex flex-col">
              <label className="flex items-center text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-500 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
                {t('analyzerVisualEvidence')}
              </label>
              
              <div
                onClick={triggerFileSelect}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl cursor-pointer transition-all p-3 text-center group flex flex-col justify-center items-center min-h-[220px] w-full ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/10 scale-[1.01]'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/25 hover:border-indigo-500/50 dark:hover:border-indigo-400/50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/jpeg,image/png"
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="relative w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-900/40 p-2 flex flex-col items-center justify-center min-h-[220px] max-h-[400px] overflow-hidden group/img shadow-md">
                    <img
                      src={imagePreview}
                      alt="Visual Evidence Preview"
                      referrerPolicy="no-referrer"
                      className="max-h-[360px] w-auto max-w-full rounded-lg object-contain shadow-xl transition-transform duration-300 group-hover/img:scale-[1.01]"
                    />
                    
                    {/* Control Overlay */}
                    <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsImageZoomed(true);
                        }}
                        className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl text-xs font-bold backdrop-blur-md shadow-lg transition-all flex items-center gap-1.5 hover:scale-105"
                        title="Zoom Image"
                      >
                        <ZoomIn className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Zoom</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearImage();
                        }}
                        className="px-3 py-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 hover:scale-105"
                        title={t('analyzerRemoveImage')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mb-3 group-hover:scale-110 transition-transform shadow-inner">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <p className="text-base font-bold text-slate-900 dark:text-white">
                      {t('analyzerDragDrop')}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {t('analyzerSupportedFormats')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action button */}
          <button
            id="tour-submit"
            onClick={startAnalysis}
            disabled={isInputEmpty || isAnalyzing}
            className={`w-full py-4 rounded-xl text-base font-bold flex items-center justify-center transition-all ${
              isInputEmpty || isAnalyzing
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-450 dark:text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 hover:scale-[1.01]'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader className="w-4.5 h-4.5 animate-spin mr-2" />
                {t('analyzerRunning')}
              </>
            ) : (
              <>
                {t('analyzerBtn')}
              </>
            )}
          </button>
          
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-xs rounded-xl border border-amber-200/50 dark:border-amber-900/30">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

        </div>

        {/* Right Panel: Results */}
        <div id="results-panel" className="lg:col-span-5 w-full lg:sticky lg:top-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/60 shadow-xl shadow-slate-200/40 dark:shadow-black/20 min-h-[500px] flex flex-col justify-between text-left rtl:text-right">
          <div>
            {/* Header Title */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t('analyzerResultsTitle')}
                </h2>
              </div>
            </div>

            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
                {/* Custom CSS Neural Inference Scanner */}
                <div className="relative size-48 mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-indigo-500/20 dark:border-indigo-500/10 animate-pulse"></div>
                  <div className="absolute size-40 rounded-full border border-dashed border-indigo-500/15 dark:border-indigo-400/10"></div>
                  <div className="absolute size-28 rounded-full border border-violet-500/20 dark:border-violet-500/10"></div>
                  <div className="absolute size-16 rounded-full border border-indigo-500/30 dark:border-indigo-500/20"></div>
                  <div className="absolute size-40 rounded-full bg-gradient-to-tr from-transparent via-transparent to-indigo-500/10 animate-spin" style={{ animationDuration: '3s' }}></div>
                  <div className="absolute size-40 rounded-full bg-gradient-to-tr from-transparent via-transparent to-violet-500/5 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}></div>
                  <div className="absolute size-4 rounded-full bg-indigo-600 dark:bg-indigo-500 animate-ping"></div>
                  <div className="absolute size-4 rounded-full bg-indigo-600 dark:bg-indigo-500 shadow-lg shadow-indigo-500/50"></div>
                  <div className="absolute top-1/2 left-4 right-4 h-[1px] bg-indigo-500/20 dark:bg-indigo-450/10 pointer-events-none"></div>
                  <div className="absolute left-1/2 top-4 bottom-4 w-[1px] bg-indigo-500/20 dark:bg-indigo-450/10 pointer-events-none"></div>
                </div>
                
                <p className="text-slate-900 dark:text-white font-bold text-base mb-1 tracking-tight flex items-center justify-center gap-2">
                  <span className="size-2 rounded-full bg-indigo-600 animate-ping text-left rtl:text-right"></span>
                  Analyzing Content Evidence
                </p>
                <p className="text-slate-400 text-xs max-w-[260px] leading-relaxed text-center">
                  Evaluating text structure, visual details, and cross-evidence patterns...
                </p>
              </div>
            )}

            {!isAnalyzing && hasResults && (
              <div className="space-y-6 animate-fade-in">
                {/* Verdict alert card */}
                {prediction.includes('Fake') ? (
                  <div className="flex items-center gap-3.5 p-5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/30 rounded-2xl animate-verdict-reveal">
                    <AlertCircle className="w-10 h-10 shrink-0 text-red-600 dark:text-red-400" />
                    <div>
                      <p className="text-lg font-black tracking-wide leading-none mb-1">{t('analyzerVerdictFake')}</p>
                      <p className="text-[11px] font-medium opacity-85">{t('analyzerVerdictFakeSub')}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3.5 p-5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30 rounded-2xl animate-verdict-reveal">
                    <CheckCircle2 className="w-10 h-10 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-lg font-black tracking-wide leading-none mb-1">{t('analyzerVerdictReal')}</p>
                      <p className="text-[11px] font-medium opacity-85">{t('analyzerVerdictRealSub')}</p>
                    </div>
                  </div>
                )}

                {/* Overall Confidence progress */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t('analyzerConfidence')}
                    </span>
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                      {confidence.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-200/40 dark:border-slate-850">
                    <div
                      className="bg-indigo-600 dark:bg-indigo-500 h-3 rounded-full animate-score-growth shadow"
                      style={{ width: `${confidence}%` }}
                    ></div>
                  </div>
                </div>

                {/* Probability Estimation Bars */}
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Probability Estimation
                  </h4>
                  <div className="space-y-2.5">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-emerald-600 dark:text-emerald-400">Verified Authentic (Real)</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{metrics.realProbability.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-150 dark:bg-slate-900 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-emerald-500 dark:bg-emerald-400 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${metrics.realProbability}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-red-600 dark:text-red-400">Manipulated / Deceptive (Fake)</span>
                        <span className="text-red-600 dark:text-red-400 font-bold">{metrics.fakeProbability.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-150 dark:bg-slate-900 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-red-500 dark:bg-red-400 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${metrics.fakeProbability}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>


                {/* Detailed Explanation Metrics — only shown when API returns real explanations */}
                {explanations?.text_verdict && (
                  <div className="border-t border-slate-100 dark:border-slate-850 pt-4 space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('analyzerForensicExplanations')}</h4>
                    <div className="space-y-2">
                      {explanations.text_verdict && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-bold text-slate-700 dark:text-slate-300">{t('analyzerLinguistic')}</span>
                            <span className="text-indigo-600 font-semibold">{explanations.text_verdict}</span>
                          </div>
                          {explanations.text_explanation && (
                            <p className="text-[10px] text-slate-455 leading-normal">{explanations.text_explanation}</p>
                          )}
                        </div>
                      )}
                      {explanations.image_verdict && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-bold text-slate-700 dark:text-slate-300">{t('analyzerVisual')}</span>
                            <span className="text-violet-600 font-semibold">{explanations.image_verdict}</span>
                          </div>
                          {explanations.image_explanation && (
                            <p className="text-[10px] text-slate-455 leading-normal">{explanations.image_explanation}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}


                {/* Clean Timestamp Footer */}
                <div className="pt-2 text-right border-t border-slate-100 dark:border-slate-850">
                  <span className="text-[10px] font-mono text-slate-400">
                    Analyzed At: {timestamp}
                  </span>
                </div>
              </div>
            )}

            {!isAnalyzing && !hasResults && (
              <div className="flex flex-col items-center justify-center text-center py-16 animate-fade-in">
                {/* Animated concentric rings */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border border-dashed border-indigo-200/40 dark:border-indigo-800/30 animate-spin" style={{ animationDuration: '12s' }}></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border border-dashed border-violet-200/50 dark:border-violet-800/30 animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }}></div>
                  </div>
                  <div className="relative p-8 rounded-full bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/20 border border-indigo-100/50 dark:border-indigo-900/30">
                    <BarChart3 className="w-10 h-10 text-indigo-400 dark:text-indigo-500" />
                  </div>
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">
                  {t('analyzerAwaitingTarget')}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs max-w-[280px] mx-auto leading-relaxed">
                  {t('analyzerAwaitingSub')}
                </p>
                {/* Step indicators */}
                <div className="flex items-center gap-3 mt-6">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[9px] font-black">1</div>
                    <span className="text-[10px] text-slate-400 font-medium">Input</span>
                  </div>
                  <div className="w-4 h-[1px] bg-slate-200 dark:bg-slate-800"></div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-[9px] font-black">2</div>
                    <span className="text-[10px] text-slate-400 font-medium">Analyze</span>
                  </div>
                  <div className="w-4 h-[1px] bg-slate-200 dark:bg-slate-800"></div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-[9px] font-black">3</div>
                    <span className="text-[10px] text-slate-400 font-medium">Verdict</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-Screen Evidence Zoom Modal */}
      {isImageZoomed && imagePreview && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 animate-fade-in cursor-zoom-out"
          onClick={() => setIsImageZoomed(false)}
        >
          <div className="relative max-w-5xl max-h-[92vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsImageZoomed(false)}
              className="absolute -top-12 right-0 text-white bg-slate-800/90 hover:bg-slate-700 p-2.5 rounded-full shadow-2xl transition-all hover:scale-110 flex items-center justify-center border border-slate-700"
              title="Close Fullscreen View"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <img
              src={imagePreview}
              alt="Visual Evidence Full Resolution"
              referrerPolicy="no-referrer"
              className="max-h-[85vh] w-auto max-w-full rounded-2xl shadow-2xl border border-slate-800/80 object-contain bg-black/40"
            />
            <p className="mt-3 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
              Visual Evidence &bull; Click anywhere outside to close
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
