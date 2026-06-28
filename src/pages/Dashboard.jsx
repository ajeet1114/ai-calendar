import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { MeetingCard } from '../components/MeetingCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { meetingService } from '../services/meetingService';
import { isSameDay, formatDate, formatTime } from '../utils/dateHelpers';
import { Sparkles, Calendar, Bell, ChevronRight, CheckSquare, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';

export const Dashboard = () => {
  const { meetings, loadingMeetings, user, notifications, markAsRead, createMeeting } = useApp();
  const [nlpText, setNlpText] = useState('');
  const [parsing, setParsing] = useState(false);
  const navigate = useNavigate();

  const handleNlpSubmit = (e) => {
    e.preventDefault();
    if (!nlpText.trim()) return;

    setParsing(true);
    setTimeout(() => {
      // Parse query parameters
      const parsed = meetingService.parseNaturalLanguageInput(nlpText);
      setParsing(false);
      
      // Save draft details to sessionStorage and route to schedule creation screen
      sessionStorage.setItem('conflictfree_draft', JSON.stringify(parsed));
      navigate('/create-meeting?draft=true');
    }, 800);
  };

  // Group meetings into categories
  const today = new Date();
  const todayMeetings = meetings.filter(m => isSameDay(m.startTime, today) && m.status !== 'cancelled');
  
  const upcomingMeetings = meetings.filter(m => {
    const isToday = isSameDay(m.startTime, today);
    const inFuture = new Date(m.startTime).getTime() > today.getTime();
    return !isToday && inFuture && m.status !== 'cancelled';
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const activeMeeting = todayMeetings.find(m => m.liveStatus === 'active');
  const conflictCount = meetings.filter(m => m.status === 'conflict').length;

  return (
    <div className="space-y-6">
      {/* Header Greeting Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-linear-to-r from-indigo-500/10 to-violet-500/5 dark:from-indigo-950/20 dark:to-violet-950/5 border border-indigo-100/50 dark:border-indigo-900/20 rounded-3xl glow-primary">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
            Welcome back, {user?.name.split(' ')[0] || 'Alice'}!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {conflictCount > 0 
              ? `You have ${conflictCount} schedule conflicts requiring resolution today.` 
              : 'Your scheduling agenda is optimized and conflict-free today.'}
          </p>
        </div>
        
        {/* Calendar widget */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-xs">
          <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold tracking-wide uppercase">TODAY'S DATE</p>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {formatDate(today.toISOString())}
            </p>
          </div>
        </div>
      </div>

      {/* Quick NLP Command Bar */}
      <form onSubmit={handleNlpSubmit} className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quick AI Scheduler</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={nlpText}
            onChange={(e) => setNlpText(e.target.value)}
            placeholder='e.g., "Meet with Bob tomorrow at 3pm for 1 hour in Huddle Room Beta"'
            className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-850 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-indigo-400 dark:focus:bg-slate-900 transition-all"
          />
          <button
            type="submit"
            disabled={parsing || !nlpText.trim()}
            className="py-3 px-6 bg-slate-950 hover:bg-slate-900 active:bg-slate-950 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-medium text-sm rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer disabled:opacity-50"
          >
            {parsing ? 'Parsing...' : 'Analyze Slot'}
          </button>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 pl-1 leading-relaxed">
          AI will automatically detect participants, room, duration, date, and times from your sentence.
        </p>
      </form>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (Schedule Listings) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active meeting block (if any) */}
          {activeMeeting && (
            <div 
              onClick={() => navigate(`/meetings/${activeMeeting.id}`)}
              className="p-5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-3xl shadow-lg shadow-indigo-600/10 cursor-pointer transition-all hover:scale-[1.005] duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden"
            >
              <div className="absolute right-0 top-0 bottom-0 w-[40%] bg-linear-to-r from-transparent to-white/5 pointer-events-none" />
              <div className="space-y-1 z-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-450" />
                  Live Meeting
                </span>
                <h3 className="text-base font-bold mt-2">{activeMeeting.title}</h3>
                <p className="text-xs text-indigo-150">
                  {formatTime(activeMeeting.startTime)} - {formatTime(activeMeeting.endTime)} • {activeMeeting.room?.name || 'Virtual'}
                </p>
              </div>
              <button className="z-10 py-2.5 px-4 bg-white hover:bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-xl flex items-center gap-1.5 self-start sm:self-auto transition-colors">
                <span>Join Details</span>
                <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>
          )}

          {/* Today's Agenda list */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-indigo-500" />
                Today's Schedule
              </h3>
              <button 
                onClick={() => navigate('/calendar')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
              >
                Full calendar &rarr;
              </button>
            </div>

            {loadingMeetings ? (
              <LoadingSkeleton type="list" count={2} />
            ) : todayMeetings.length === 0 ? (
              <EmptyState 
                icon="calendar" 
                title="No meetings today" 
                description="Your calendar is clear. You can schedule a new meeting or use the AI scheduler above."
                actionLabel="Schedule Meeting"
                onActionClick={() => navigate('/create-meeting')}
              />
            ) : (
              <div className="flex flex-col gap-3">
                {todayMeetings.map(meeting => (
                  <MeetingCard key={meeting.id} meeting={meeting} layout="list" />
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Schedule list */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-205 flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-indigo-500" />
              Upcoming Meetings
            </h3>

            {loadingMeetings ? (
              <LoadingSkeleton type="list" count={3} />
            ) : upcomingMeetings.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 border border-slate-200/50 dark:border-slate-800 rounded-2xl">
                No future meetings scheduled.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {upcomingMeetings.map(meeting => (
                  <MeetingCard key={meeting.id} meeting={meeting} layout="card" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Alert Logs) */}
        <div className="space-y-6">
          {/* Notification Quick Panel Log */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col h-[400px]">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-850">
              <div className="flex items-center gap-2">
                <Bell className="w-4.5 h-4.5 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Recent Alerts</h3>
              </div>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              )}
            </div>

            <div className="flex-grow overflow-y-auto mt-3 space-y-3 pr-1">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-600 p-4">
                  <CheckSquare className="w-8 h-8 mb-2 stroke-[1.2]" />
                  <p className="text-xs">No active alerts</p>
                </div>
              ) : (
                notifications.slice(0, 4).map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markAsRead(notif.id);
                      if (notif.link) navigate(notif.link);
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 relative ${
                      notif.read 
                        ? 'bg-slate-50/50 hover:bg-slate-100/50 border-slate-100 dark:bg-slate-950/20 dark:border-slate-850 dark:hover:bg-slate-950/40' 
                        : 'bg-indigo-50/20 hover:bg-indigo-50/45 border-indigo-100/40 dark:bg-indigo-950/10 dark:border-indigo-900/20'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-slate-800 dark:text-slate-350">{notif.title}</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500">{formatTime(notif.timestamp)}</span>
                    </div>
                    <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => navigate('/calendar')}
              className="mt-3 py-2 w-full text-center text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-950 dark:hover:bg-slate-900 dark:text-slate-300 rounded-xl transition-all border border-slate-150 dark:border-slate-850 flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Manage Conflicts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick stats and help */}
          <div className="p-5 bg-linear-to-b from-indigo-500/5 to-violet-500/5 border border-indigo-100/40 dark:border-indigo-900/10 rounded-2xl shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Scheduling Tip</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Double bookings are highlighted with a <strong>Conflict</strong> label. ConflictFree analyzes room assignments and attendee lists dynamically to recommend optimal alternative timings instantly.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
