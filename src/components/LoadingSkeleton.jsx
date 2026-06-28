import React from 'react';

export const LoadingSkeleton = ({ type = 'list', count = 3 }) => {
  const CardSkeleton = () => (
    <div className="p-5 border border-slate-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50 flex flex-col gap-3 animate-pulse shadow-sm">
      <div className="flex justify-between items-center">
        <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded-md" />
      </div>
      <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-md" />
      <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md" />
      <div className="flex gap-2 mt-2">
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );

  const ListSkeleton = () => (
    <div className="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
      <div className="flex-grow flex flex-col gap-2">
        <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-md" />
      </div>
      <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded-md flex-shrink-0" />
    </div>
  );

  const CalendarSkeleton = () => (
    <div className="w-full h-96 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900/50 animate-pulse flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
      </div>
      <div className="flex-grow grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="flex-grow bg-slate-100 dark:bg-slate-800/30 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-4">
      {type === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {Array.from({ length: count }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}
      
      {type === 'list' && (
        <div className="w-full flex flex-col">
          {Array.from({ length: count }).map((_, i) => (
            <ListSkeleton key={i} />
          ))}
        </div>
      )}

      {type === 'calendar' && <CalendarSkeleton />}
    </div>
  );
};
