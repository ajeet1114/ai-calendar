import React from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, X, ShieldAlert, Sparkles, Calendar, HelpCircle } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { formatDate, formatTime } from '../utils/dateHelpers';

export const NotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, deleteNotification, markAllAsRead, unreadCount } = useApp();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNotifClick = (notification) => {
    markAsRead(notification.id);
    onClose();
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'conflict':
        return (
          <div className="p-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        );
      case 'suggestion':
        return (
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
        );
      case 'rescheduled':
        return (
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400">
            <Calendar className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-xl bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <HelpCircle className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-xs" 
        onClick={onClose} 
      />

      {/* Slide-out Tray */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Notification Center
            </h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                Mark all read
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 dark:text-slate-600">
              <Bell className="w-12 h-12 mb-3 stroke-[1.2]" />
              <p className="text-sm">All clear! No alerts at the moment.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id}
                className={`relative group flex gap-3 p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  notif.read 
                    ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700' 
                    : 'bg-indigo-50/20 dark:bg-indigo-950/10 border-indigo-100/50 dark:border-indigo-900/30 hover:border-indigo-200 dark:hover:border-indigo-800'
                }`}
                onClick={() => handleNotifClick(notif)}
              >
                {/* Visual Unread Indicator */}
                {!notif.read && (
                  <span className="absolute top-4 left-4 w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                )}
                
                <div className={`flex-shrink-0 ${!notif.read ? 'pl-3' : ''}`}>
                  {getIcon(notif.type)}
                </div>

                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap mt-0.5">
                      {formatTime(notif.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-indigo-500 dark:text-indigo-400 mt-2 font-medium flex items-center gap-1 group-hover:underline">
                    View updates &rarr;
                  </p>
                </div>

                {/* Inline Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif.id);
                  }}
                  className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-150"
                  title="Delete notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
