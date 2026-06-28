import React from 'react';
import { useApp } from '../context/AppContext';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  error: <XCircle className="w-5 h-5 text-rose-500" />,
  info: <Info className="w-5 h-5 text-indigo-500" />,
  conflict: <XCircle className="w-5 h-5 text-red-500" />,
  rescheduled: <Info className="w-5 h-5 text-purple-500" />,
  freed: <CheckCircle className="w-5 h-5 text-teal-500" />,
  rsvp: <CheckCircle className="w-5 h-5 text-blue-500" />,
};

const bgColors = {
  success: 'border-emerald-500/20 bg-emerald-50/90 dark:bg-emerald-950/20',
  warning: 'border-amber-500/20 bg-amber-50/90 dark:bg-amber-950/20',
  error: 'border-rose-500/20 bg-rose-50/90 dark:bg-rose-950/20',
  info: 'border-indigo-500/20 bg-indigo-50/90 dark:bg-indigo-950/20',
  conflict: 'border-red-500/20 bg-red-50/90 dark:bg-red-950/20',
  rescheduled: 'border-purple-500/20 bg-purple-50/90 dark:bg-purple-950/20',
  freed: 'border-teal-500/20 bg-teal-50/90 dark:bg-teal-950/20',
  rsvp: 'border-blue-500/20 bg-blue-50/90 dark:bg-blue-950/20',
};

export const ToastNotifications = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg ${
              bgColors[toast.type] || bgColors.info
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {icons[toast.type] || icons.info}
            </div>
            <div className="flex-grow">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {toast.title}
              </h4>
              <p className="text-xs mt-1 text-slate-600 dark:text-slate-400">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
