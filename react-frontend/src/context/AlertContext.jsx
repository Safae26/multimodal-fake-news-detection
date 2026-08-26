import React, { createContext, useContext, useState, useEffect } from 'react';
import { ShieldAlert, AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const AlertContext = createContext();

export function useAlert() {
  return useContext(AlertContext);
}

export function AlertProvider({ children }) {
  const [alert, setAlert] = useState(null); // { title, message, type, onConfirm, onCancel }
  const [toasts, setToasts] = useState([]); // Array of { id, message, type }

  const confirmAction = ({ title, message, type = 'warning', onConfirm, onCancel }) => {
    setAlert({ title, message, type, onConfirm, onCancel });
  };

  const closeAlert = () => {
    if (alert && alert.onCancel) {
      alert.onCancel();
    }
    setAlert(null);
  };

  const handleConfirm = () => {
    if (alert && alert.onConfirm) {
      alert.onConfirm();
    }
    setAlert(null);
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AlertContext.Provider value={{ confirmAction, toast: showToast }}>
      {children}
      
      {/* Global Confirmation Modal */}
      {alert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-verdict-reveal p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl shrink-0 ${
                alert.type === 'danger' || alert.type === 'error'
                  ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400'
                  : alert.type === 'warning'
                  ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                  : alert.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400'
              }`}>
                {alert.type === 'danger' || alert.type === 'error' ? (
                  <ShieldAlert className="w-6 h-6" />
                ) : alert.type === 'warning' ? (
                  <AlertCircle className="w-6 h-6" />
                ) : alert.type === 'success' ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <Info className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-display font-black text-slate-900 dark:text-white">
                  {alert.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  {alert.message}
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={closeAlert}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`px-5 py-2.5 text-white font-bold rounded-xl text-xs transition-all active:scale-95 shadow-md ${
                  alert.type === 'danger' || alert.type === 'error'
                    ? 'bg-red-600 hover:bg-red-500 shadow-red-500/10'
                    : alert.type === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/10'
                    : alert.type === 'success'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/10'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Stack */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </AlertContext.Provider>
  );
}

function ToastCard({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="pointer-events-auto w-full bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl backdrop-blur-md p-4 flex items-center justify-between gap-3 animate-fade-in-up transition-all hover:scale-[1.01]">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl shrink-0 ${
          toast.type === 'error'
            ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400'
            : toast.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
            : toast.type === 'warning'
            ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500'
            : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400'
        }`}>
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5" />
          ) : toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <Info className="w-5 h-5" />
          )}
        </div>
        <p className="text-slate-850 dark:text-slate-200 text-sm font-semibold leading-snug">
          {toast.message}
        </p>
      </div>
      <button
        onClick={onClose}
        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

