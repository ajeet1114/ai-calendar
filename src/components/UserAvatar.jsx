import React from 'react';

export const UserAvatar = ({ user, size = 'md', showStatus = false, status = 'online' }) => {
  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-medium',
    lg: 'w-12 h-12 text-base font-semibold',
    xl: 'w-16 h-16 text-xl font-bold',
  };

  const statusColors = {
    online: 'bg-emerald-500 ring-white dark:ring-slate-900',
    busy: 'bg-rose-500 ring-white dark:ring-slate-900',
    offline: 'bg-slate-400 ring-white dark:ring-slate-900',
  };

  const statusSize = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  return (
    <div className="relative inline-flex items-center justify-center flex-shrink-0">
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className={`${sizeClasses[size].split(' ')[0]} ${sizeClasses[size].split(' ')[1]} rounded-full object-cover border border-slate-200 dark:border-slate-800`}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200/30 dark:border-indigo-800/30 flex items-center justify-center`}
        >
          {initials}
        </div>
      )}
      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ${statusColors[status] || statusColors.online} ${statusSize[size]}`}
        />
      )}
    </div>
  );
};
