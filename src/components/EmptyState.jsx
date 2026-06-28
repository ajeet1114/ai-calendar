import React from 'react';
import { Calendar, AlertCircle, Sparkles, Inbox } from 'lucide-react';

const icons = {
  calendar: <Calendar className="w-12 h-12 text-slate-400 dark:text-slate-600" />,
  alert: <AlertCircle className="w-12 h-12 text-amber-500/80" />,
  sparkle: <Sparkles className="w-12 h-12 text-indigo-500/80" />,
  inbox: <Inbox className="w-12 h-12 text-slate-400 dark:text-slate-600" />
};

export const EmptyState = ({
  icon = 'calendar',
  title = 'No meetings found',
  description = 'Your schedule is currently clear. Enjoy the focus time!',
  actionLabel,
  onActionClick
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/30 dark:bg-slate-900/10 max-w-lg mx-auto w-full">
      <div className="p-4 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700/50 rounded-2xl mb-4">
        {icons[icon] || icons.calendar}
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onActionClick && (
        <button
          onClick={onActionClick}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
