import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, Calendar, PlusCircle, Settings, ShieldAlert, Sparkles, CheckSquare, Clock } from 'lucide-react';
import { isSameDay } from '../utils/dateHelpers';

export const Sidebar = () => {
  const { meetings } = useApp();
  const navigate = useNavigate();

  // Calculate statistics for the summary card
  const today = new Date();
  const todayMeetings = meetings.filter(m => isSameDay(m.startTime, today) && m.status !== 'cancelled');
  const conflictCount = meetings.filter(m => m.status === 'conflict').length;

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Calendar View', path: '/calendar', icon: <Calendar className="w-5 h-5" /> },
    { name: 'Schedule Meeting', path: '/create-meeting', icon: <PlusCircle className="w-5 h-5" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <aside className="w-64 h-screen border-r border-slate-200/80 bg-slate-50/70 dark:border-slate-800/80 dark:bg-slate-950/40 p-5 flex flex-col justify-between hidden md:flex">
      <div className="flex flex-col gap-6">
        {/* Branding header */}
        <div className="flex items-center gap-3 px-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/10">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">
              ConflictFree
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              Smart Scheduler v1.0
            </p>
          </div>
        </div>

        {/* Create Meeting Button */}
        <button
          onClick={() => navigate('/create-meeting')}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] hover:scale-[1.01] transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Meeting</span>
        </button>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-100 dark:bg-slate-900 dark:text-indigo-400 dark:border-slate-800/50'
                    : 'text-slate-600 hover:bg-slate-100/50 dark:text-slate-400 dark:hover:bg-slate-900/50 hover:text-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
              
              {/* Conflict Counter Badge next to Calendar or Dashboard */}
              {item.name === 'Calendar View' && conflictCount > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-50 px-1 text-[10px] font-bold text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200/20">
                  {conflictCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Today Summary Card */}
      <div className="p-4 rounded-2xl bg-white border border-slate-150 shadow-sm dark:bg-slate-900 dark:border-slate-800/80 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4.5 h-4.5 text-indigo-500" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Today's Sync</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">MEETINGS</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-205 mt-0.5">{todayMeetings.length}</p>
          </div>
          <div className={`p-2 rounded-xl border ${
            conflictCount > 0 
              ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30' 
              : 'bg-slate-50 dark:bg-slate-950/60 border-slate-100 dark:border-slate-850'
          }`}>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">CONFLICTS</p>
            <p className={`text-lg font-bold mt-0.5 ${conflictCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-205'}`}>
              {conflictCount}
            </p>
          </div>
        </div>

        {conflictCount > 0 && (
          <div className="flex items-start gap-2 p-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/20 text-[10px] text-amber-700 dark:text-amber-400">
            <ShieldAlert className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <p className="leading-tight">
              {conflictCount} booking issues detected. Click Calendar View to resolve.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
