import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserAvatar } from '../components/UserAvatar';
import { User, Bell, Clock, Sun, Moon, Shield, Volume2, Mail, Layout } from 'lucide-react';

export const Settings = () => {
  const { user, preferences, updatePreferences } = useApp();

  // Local settings state
  const [theme, setTheme] = useState(preferences.theme || 'light');
  const [soundEnabled, setSoundEnabled] = useState(preferences.soundEnabled !== false);
  const [emailNotifications, setEmailNotifications] = useState(preferences.emailNotifications !== false);
  const [pushNotifications, setPushNotifications] = useState(preferences.pushNotifications !== false);
  const [defaultDuration, setDefaultDuration] = useState(preferences.defaultDuration || 30);
  const [workingStart, setWorkingStart] = useState(preferences.workingHoursStart || '09:00');
  const [workingEnd, setWorkingEnd] = useState(preferences.workingHoursEnd || '18:00');

  const handleSubmit = (e) => {
    e.preventDefault();
    updatePreferences({
      theme,
      soundEnabled,
      emailNotifications,
      pushNotifications,
      defaultDuration: parseInt(defaultDuration),
      workingHoursStart: workingStart,
      workingHoursEnd: workingEnd
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-105">
          Workspace Settings
        </h2>
        <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">
          Customize your profile, configure business calendar ranges, and adjust scheduling triggers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Profile Card */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-850">
            <User className="w-4.5 h-4.5 text-indigo-500" />
            User Profile
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <UserAvatar user={user} size="xl" showStatus={true} status="online" />
            <div className="space-y-1.5 text-center sm:text-left flex-grow">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{user?.name || 'Alice Chen'}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{user?.role || 'Product Lead'}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{user?.email || 'alice@conflictfree.ai'}</p>
            </div>
            <button
              type="button"
              className="py-2 px-3 border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer"
            >
              Upload Avatar
            </button>
          </div>
        </div>

        {/* Visual & Theme config */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-850">
            <Layout className="w-4.5 h-4.5 text-indigo-500" />
            Appearance Toggles
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-3 transition-all ${
                theme === 'light'
                  ? 'border-indigo-650 bg-indigo-50/10 text-indigo-600 dark:border-indigo-500 dark:bg-indigo-950/10 dark:text-indigo-400 font-semibold shadow-xs'
                  : 'border-slate-200 dark:border-slate-805 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <Sun className="w-6 h-6 text-amber-500" />
              <span className="text-xs font-medium">Light Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-3 transition-all ${
                theme === 'dark'
                  ? 'border-indigo-650 bg-indigo-50/10 text-indigo-600 dark:border-indigo-500 dark:bg-indigo-950/10 dark:text-indigo-400 font-semibold shadow-xs'
                  : 'border-slate-200 dark:border-slate-805 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <Moon className="w-6 h-6 text-violet-500" />
              <span className="text-xs font-medium">Dark Mode</span>
            </button>
          </div>
        </div>

        {/* Business Working Hours config */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-202 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-850">
            <Clock className="w-4.5 h-4.5 text-indigo-500" />
            Availability Constraints
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
            <div>
              <label className="block font-semibold text-slate-500 mb-1.5 uppercase">Day Start</label>
              <input
                type="time"
                value={workingStart}
                onChange={(e) => setWorkingStart(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-500 mb-1.5 uppercase">Day Close</label>
              <input
                type="time"
                value={workingEnd}
                onChange={(e) => setWorkingEnd(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-205 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-500 mb-1.5 uppercase">Default Booking Duration</label>
              <select
                value={defaultDuration}
                onChange={(e) => setDefaultDuration(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-805 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications Control */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-850">
            <Bell className="w-4.5 h-4.5 text-indigo-500" />
            Alerts Dispatch Settings
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-1 text-xs">
              <div className="flex gap-3">
                <Volume2 className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Sound Alerts</p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500">Trigger notification chimes on socket events.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="rounded text-indigo-650 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 w-5 h-5 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-850 pt-4 text-xs">
              <div className="flex gap-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Email Summaries</p>
                  <p className="text-[10px] text-slate-455 dark:text-slate-500">Receive schedule conflicts updates via inbox.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="rounded text-indigo-650 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 w-5 h-5 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-850 pt-4 text-xs">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Desktop Push Notifications</p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500">Receive real-time toasts when colleagues reschedule.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={(e) => setPushNotifications(e.target.checked)}
                className="rounded text-indigo-655 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 w-5 h-5 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Form Submit */}
        <button
          type="submit"
          className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 dark:bg-indigo-650 dark:hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl active:scale-[0.98] transition-all cursor-pointer shadow-xs text-center"
        >
          Save Workspace Preferences
        </button>
      </form>
    </div>
  );
};
