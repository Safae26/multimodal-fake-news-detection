import React, { useState, useEffect } from 'react';
import { 
  Calendar, Loader, Trash2, Eye, FileText, 
  Image as ImageIcon, Globe, BarChart3, AlertCircle, CheckCircle2, 
  FileDown, Download, ShieldCheck
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { useLanguage } from '../context/LanguageContext';

export default function Dossiers({ token, user }) {
  const { confirmAction, toast } = useAlert();
  const { t } = useLanguage();
  
  const [historyList, setHistoryList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchMyHistory = async () => {
    if (!token) return;
    setIsLoadingHistory(true);
    try {
      const res = await fetch('/api/analyses/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data);
        // Auto-select the first item if none is selected
        if (data.length > 0 && !selectedItem) {
          setSelectedItem(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load user analysis dossiers', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchMyHistory();
  }, [token]);

  const handleDeleteHistory = async (analysisId, e) => {
    if (e) e.stopPropagation();
    confirmAction({
      title: 'Delete Scan Record',
      message: 'Are you sure you want to permanently delete this scan record from your verification history?',
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/analyses/${analysisId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            toast('Scan record deleted successfully.', 'success');
            
            // Fetch updated history
            const updatedList = historyList.filter(item => item.id !== analysisId);
            setHistoryList(updatedList);
            
            if (selectedItem && selectedItem.id === analysisId) {
              if (updatedList.length > 0) {
                setSelectedItem(updatedList[0]);
              } else {
                setSelectedItem(null);
              }
            }
          } else {
            toast('Failed to delete claim dossier.', 'error');
          }
        } catch (err) {
          console.error(err);
          toast('Network error during delete operation.', 'error');
        }
      }
    });
  };

  // Helper for computing metric percentages
  const getMetrics = (item) => {
    if (!item) return { fakeProbability: 0, realProbability: 0, textWeight: 0, imageWeight: 0, videoWeight: 0 };
    const isFake = item.verdict.includes('Fake');
    const confidence = item.confidence;
    const fakeP = isFake ? confidence : (100 - confidence);
    const realP = 100 - fakeP;
    return {
      fakeProbability: fakeP,
      realProbability: realP,
      textWeight: item.text ? 60 : 0,
      imageWeight: item.image_present ? 40 : 0,
      videoWeight: 0
    };
  };

  const metrics = selectedItem ? getMetrics(selectedItem) : null;
  const explanations = selectedItem ? selectedItem.explanations : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-6 text-left rtl:text-right">
        <h1 className="text-2xl font-display font-black tracking-tight flex items-center gap-2.5 text-slate-900 dark:text-white">
          <ShieldCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <span>{t('analyzerHistoryTitle')}</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm max-w-xl">
          {t('analyzerHistorySub')}
        </p>
      </div>

      {isLoadingHistory ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
        </div>
      ) : historyList.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
          <Calendar className="w-12 h-12 text-slate-350 dark:text-slate-650 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('analyzerNoDossiers')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Dossier Cards List (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
            {historyList.map((item) => {
              const isSelected = selectedItem && selectedItem.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative group text-left rtl:text-right ${
                    isSelected
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-500 dark:border-indigo-400 shadow-md shadow-indigo-500/5'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:scale-[1.01]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      {item.model && item.model.toUpperCase() !== 'UNKNOWN' && item.model.toUpperCase() !== 'MULTIMODAL AI' && (
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded uppercase font-mono">
                          {item.model}
                        </span>
                      )}
                      <span className="text-[9px] font-mono text-slate-400">
                        {item.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 dark:text-slate-200 font-medium line-clamp-3 italic">
                      "{item.text || 'Visual asset claim verification scan.'}"
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      item.verdict.includes('Fake')
                        ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200/50'
                        : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/50'
                    }`}>
                      {item.verdict}
                    </span>

                    <div className="flex gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                        title="View Details"
                        className="p-1.5 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-950 dark:hover:bg-indigo-950 text-slate-500 hover:text-indigo-600 rounded-lg border dark:border-slate-800 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteHistory(item.id, e)}
                        title="Delete Dossier"
                        className="p-1.5 bg-slate-50 hover:bg-red-50 dark:bg-slate-950 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-600 rounded-lg border dark:border-slate-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Verification Dossier Report View (lg:col-span-7) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[500px] flex flex-col justify-between text-left rtl:text-right">
            {selectedItem ? (
              <div className="space-y-6 animate-fade-in">
                {/* Header Title */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {t('analyzerResultsTitle')}
                    </h2>
                  </div>
                </div>

                {/* Verdict Alert Card */}
                {selectedItem.verdict.includes('Fake') ? (
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
                      {selectedItem.confidence.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-200/40 dark:border-slate-850">
                    <div
                      className="bg-indigo-600 dark:bg-indigo-500 h-3 rounded-full animate-score-growth shadow"
                      style={{ width: `${selectedItem.confidence}%` }}
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



                {/* Detailed Explanation Metrics — only rendered if real API explanations exist */}
                {Boolean(explanations?.text_explanation || explanations?.text_verdict) && (
                  <div className="border-t border-slate-100 dark:border-slate-850 pt-4 space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('analyzerForensicExplanations')}</h4>
                    <div className="space-y-2">
                      {explanations?.text_verdict && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-bold text-slate-700 dark:text-slate-300">{t('analyzerLinguistic')}</span>
                            <span className="text-indigo-600 font-semibold">{explanations.text_verdict}</span>
                          </div>
                          {explanations.text_explanation && (
                            <p className="text-[10px] text-slate-450 leading-normal">{explanations.text_explanation}</p>
                          )}
                        </div>
                      )}

                      {explanations?.image_verdict && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-bold text-slate-700 dark:text-slate-300">{t('analyzerVisual')}</span>
                            <span className="text-violet-600 font-semibold">{explanations.image_verdict}</span>
                          </div>
                          {explanations.image_explanation && (
                            <p className="text-[10px] text-slate-450 leading-normal">{explanations.image_explanation}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Clean Timestamp Footer */}
                <div className="pt-2 text-right border-t border-slate-100 dark:border-slate-850">
                  <span className="text-[10px] font-mono text-slate-400">
                    Analyzed At: {selectedItem.timestamp}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-20 my-auto animate-fade-in">
                <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">No Scan Selected</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[280px]">
                  Select a claim scan from your history list to view its complete verification report.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
