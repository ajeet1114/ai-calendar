import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Menu, X, Sparkles, LayoutDashboard, Calendar, PlusCircle, Settings as SettingsIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const MainLayout = () => {
  const { user } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If user session is cleared (logged out), redirect to authentication screen
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const mobileNavItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Calendar', path: '/calendar', icon: <Calendar className="w-5 h-5" /> },
    { name: 'Schedule', path: '/create-meeting', icon: <PlusCircle className="w-5 h-5" /> },
    { name: 'Settings', path: '/settings', icon: <SettingsIcon className="w-5 h-5" /> }
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950/20 text-slate-800 dark:text-slate-100">
      {/* Desktop Sidebar (visible on md+) */}
      <Sidebar />

      {/* Main Layout Area */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden relative">
        {/* Navbar */}
        <Navbar />

        {/* Floating Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden fixed bottom-6 right-6 z-40 p-4 rounded-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          aria-label="Toggle Mobile Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Menu Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-35 md:hidden bg-slate-900/40 backdrop-blur-md flex flex-col justify-end animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-t-[2.5rem] border-t border-slate-200/50 dark:border-slate-800 shadow-2xl p-6 pb-12 flex flex-col gap-6 animate-slide-in-bottom">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-600 text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-850 dark:text-slate-150">ConflictFree</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Smart Scheduling Engine</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {mobileNavItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border text-center transition-all ${
                        isActive
                          ? 'bg-indigo-50 border-indigo-200/40 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-400 font-semibold'
                          : 'border-slate-105 bg-slate-50 dark:bg-slate-950/30 dark:border-slate-850 text-slate-600 dark:text-slate-400'
                      }`
                    }
                  >
                    {item.icon}
                    <span className="text-xs">{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Page Routing Contents container */}
        <main className="flex-1 overflow-y-auto px-6 py-6 focus:outline-none">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
