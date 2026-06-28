import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sun, Moon, Bell, LogOut, Settings as SettingsIcon, Calendar as CalendarIcon, User, Search, Sparkles } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { NotificationPanel } from './NotificationPanel';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, theme, updatePreferences, unreadCount, logout } = useApp();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const navigate = useNavigate();

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    updatePreferences({ theme: nextTheme });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80 transition-all">
      {/* Search Input Bar (Mocking global fast finder) */}
      <div className="relative max-w-md w-full hidden md:block">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
        </div>
        <input
          type="text"
          placeholder="Search meetings, attendees, or rooms... (Ctrl+K)"
          className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-indigo-400 dark:focus:bg-slate-900 transition-all"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 shadow-sm">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="md:hidden flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <span className="font-bold text-slate-800 dark:text-white text-base">ConflictFree</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60 transition-all hover:scale-[1.05] active:scale-[0.95]"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-amber-400" />
          ) : (
            <Moon className="h-5 w-5 text-slate-600" />
          )}
        </button>

        {/* Notifications Icon with Badge */}
        <button
          onClick={() => setShowNotifPanel(true)}
          className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60 transition-all hover:scale-[1.05] active:scale-[0.95]"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-xl p-1 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
          >
            <UserAvatar user={user} size="sm" showStatus={true} status="online" />
            <div className="hidden text-left xl:block pr-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                {user?.name || 'Alice Chen'}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                {user?.role || 'Product Lead'}
              </p>
            </div>
          </button>

          {showProfileMenu && (
            <>
              {/* Overlay Backdrop to close menu */}
              <div 
                className="fixed inset-0 z-30 cursor-default" 
                onClick={() => setShowProfileMenu(false)} 
              />
              
              <div className="absolute right-0 mt-2 z-40 w-56 origin-top-right rounded-2xl border border-slate-200/80 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-fade-in-up">
                <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Logged in as</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate mt-0.5">
                    {user?.email || 'alice@conflictfree.ai'}
                  </p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/settings');
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/80 transition-colors"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    <span>My Profile</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/settings');
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/80 transition-colors"
                  >
                    <SettingsIcon className="h-4 w-4 text-slate-400" />
                    <span>Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/calendar');
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/80 transition-colors"
                  >
                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                    <span>My Calendar</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Slide-out notifications Center */}
      <NotificationPanel 
        isOpen={showNotifPanel} 
        onClose={() => setShowNotifPanel(false)} 
      />
    </header>
  );
};
