import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { formatDate, getDaysOfWeek, getDaysOfMonth, formatTime, checkOverlap, addMinutes, isSameDay } from '../utils/dateHelpers';
import { ChevronLeft, ChevronRight, Filter, AlertTriangle, Sparkles, Move, ShieldAlert, Settings } from 'lucide-react';
import { mockRooms, mockUsers } from '../utils/mockData';
import { UserAvatar } from '../components/UserAvatar';

export const CalendarView = () => {
  const { 
    meetings, 
    currentDate, 
    setCurrentDate, 
    viewMode, 
    setViewMode, 
    updateMeeting, 
    addToast 
  } = useApp();
  
  const navigate = useNavigate();

  // Filters state
  const [selectedRooms, setSelectedRooms] = useState(mockRooms.map(r => r.id));
  const [selectedUsers, setSelectedUsers] = useState(mockUsers.map(u => u.id));

  // Toggle room filter
  const handleRoomToggle = (roomId) => {
    setSelectedRooms(prev => 
      prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]
    );
  };

  // Toggle user filter
  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  // Filter meetings based on user selection
  const filteredMeetings = meetings.filter(meeting => {
    if (meeting.status === 'cancelled') return false;
    
    // Room Filter: If meeting has room, must match. If virtual (no room), default pass.
    const roomMatch = !meeting.room || selectedRooms.includes(meeting.room.id);
    
    // Attendee Filter: At least one participant in selected users
    const attendeeMatch = meeting.participants.some(p => selectedUsers.includes(p.id));
    
    return roomMatch && attendeeMatch;
  });

  // Calendar navigations
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'day') d.setDate(d.getDate() - 1);
    else if (viewMode === 'week') d.setDate(d.getDate() - 7);
    else if (viewMode === 'month') d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'day') d.setDate(d.getDate() + 1);
    else if (viewMode === 'week') d.setDate(d.getDate() + 7);
    else if (viewMode === 'month') d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e, meetingId) => {
    e.dataTransfer.setData('text/plain', meetingId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, dateString, targetHour) => {
    e.preventDefault();
    const meetingId = e.dataTransfer.getData('text/plain');
    if (!meetingId) return;

    const baseDate = new Date(dateString);
    baseDate.setHours(targetHour, 0, 0, 0);
    const newStart = baseDate.toISOString();

    try {
      const original = meetings.find(m => m.id === meetingId);
      if (!original) return;
      
      const updated = await updateMeeting(meetingId, {
        startTime: newStart,
        endTime: addMinutes(newStart, original.duration)
      });

      if (updated.status === 'conflict') {
        addToast(
          'Conflict warning', 
          `Moved "${updated.title}" to ${formatTime(newStart)}, but this creates scheduling conflicts!`, 
          'warning'
        );
      } else {
        addToast('Meeting moved', `"${updated.title}" moved to ${formatTime(newStart)}.`, 'success');
      }
    } catch (err) {
      console.error(err);
      addToast('Error', 'Could not reschedule event', 'error');
    }
  };

  // Date lists
  const weekDays = getDaysOfWeek(currentDate);
  const monthDays = getDaysOfMonth(currentDate);
  const hours = Array.from({ length: 10 }, (_, i) => i + 9); // 9 AM to 6 PM

  const getMonthName = () => {
    return currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Internal Sidebar: Filters & Navigation */}
      <div className="w-full lg:w-60 flex-shrink-0 space-y-6">
        {/* Room Filters */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Filter Rooms</h4>
            <Filter className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="space-y-2">
            {mockRooms.map((room) => (
              <label key={room.id} className="flex items-center gap-2 cursor-pointer text-xs text-slate-605 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={selectedRooms.includes(room.id)}
                  onChange={() => handleRoomToggle(room.id)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800"
                />
                <span className="truncate">{room.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* User Filters */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Filter Attendees</h4>
            <Filter className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="space-y-2.5">
            {mockUsers.map((u) => (
              <label key={u.id} className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(u.id)}
                  onChange={() => handleUserToggle(u.id)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800"
                />
                <UserAvatar user={u} size="xs" />
                <span className="truncate">{u.name.split(' ')[0]}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Main Calendar View Area */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {/* Calendar Header Controls */}
        <div className="p-5 border-b border-slate-150 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-105 min-w-[120px]">
              {getMonthName()}
            </h2>
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-150 dark:border-slate-850">
              <button 
                onClick={handlePrev}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              >
                Today
              </button>
              <button 
                onClick={handleNext}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-150 dark:border-slate-850">
              {['day', 'week', 'month'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-all cursor-pointer ${
                    viewMode === mode
                      ? 'bg-white text-indigo-650 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-205'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar Body Grids */}
        <div className="flex-1 overflow-x-auto">
          
          {/* 1. WEEK VIEW */}
          {viewMode === 'week' && (
            <div className="min-w-[800px] flex flex-col h-full">
              {/* Day Headers */}
              <div className="grid grid-cols-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-center">
                <div className="p-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-r border-slate-100 dark:border-slate-800">
                  Time
                </div>
                {weekDays.map((day) => {
                  const isCurrent = isSameDay(day, new Date());
                  return (
                    <div 
                      key={day.toISOString()} 
                      className={`p-3 border-r border-slate-100 dark:border-slate-850 last:border-0 ${
                        isCurrent ? 'bg-indigo-50/25 dark:bg-indigo-950/10' : ''
                      }`}
                    >
                      <p className="text-[10px] font-semibold text-slate-450 dark:text-slate-500 uppercase">
                        {day.toLocaleDateString([], { weekday: 'short' })}
                      </p>
                      <p className={`text-sm font-bold mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full ${
                        isCurrent 
                          ? 'bg-indigo-600 text-white dark:bg-indigo-500' 
                          : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {day.getDate()}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Time Slots Grid */}
              <div className="flex-1 overflow-y-auto max-h-[500px]">
                {hours.map((hour) => (
                  <div key={hour} className="grid grid-cols-8 border-b border-slate-100 dark:border-slate-850/80 min-h-[70px]">
                    {/* Time cell */}
                    <div className="p-3 border-r border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-405 dark:text-slate-500 text-right bg-slate-50/20 dark:bg-slate-950/5 font-mono">
                      {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                    </div>

                    {/* Day Dropzones */}
                    {weekDays.map((day) => {
                      // Get meetings falling in this hour and day
                      const dayHourMeetings = filteredMeetings.filter((m) => {
                        const mStart = new Date(m.startTime);
                        return isSameDay(m.startTime, day) && mStart.getHours() === hour;
                      });

                      return (
                        <div
                          key={day.toISOString()}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, day.toISOString(), hour)}
                          className="p-1 border-r border-slate-100 dark:border-slate-850 last:border-0 relative bg-slate-50/[0.02] hover:bg-slate-100/10 dark:hover:bg-slate-800/10 transition-colors"
                        >
                          {dayHourMeetings.map((meeting) => {
                            const isConflict = meeting.status === 'conflict';
                            return (
                              <div
                                key={meeting.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, meeting.id)}
                                onClick={() => navigate(`/meetings/${meeting.id}`)}
                                className={`p-2 rounded-xl border text-left cursor-grab active:cursor-grabbing text-[11px] font-semibold transition-all relative overflow-hidden select-none hover:shadow-xs ${
                                  isConflict
                                    ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/35 dark:text-rose-450'
                                    : 'bg-indigo-50/50 border-indigo-100/50 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/35 dark:text-indigo-400'
                                }`}
                                title="Hold to drag & reschedule"
                              >
                                {/* Drag strip */}
                                <span 
                                  className="absolute top-0 bottom-0 left-0 w-1" 
                                  style={{ backgroundColor: isConflict ? '#ef4444' : meeting.color || '#6366f1' }}
                                />
                                <div className="pl-1.5 flex flex-col gap-0.5 justify-between h-full">
                                  <div className="flex justify-between items-start gap-1">
                                    <span className="truncate leading-tight">{meeting.title}</span>
                                    {isConflict && <AlertTriangle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />}
                                  </div>
                                  <div className="flex justify-between items-center text-[9px] opacity-75 font-normal">
                                    <span>{meeting.room?.name.split(' ')[0] || 'Virtual'}</span>
                                    <span>{formatTime(meeting.startTime)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. DAY VIEW */}
          {viewMode === 'day' && (
            <div className="min-w-[600px] flex flex-col h-full">
              {/* Day Header */}
              <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 text-center border-b border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-semibold text-indigo-650 dark:text-indigo-400 uppercase tracking-widest font-mono">
                  {currentDate.toLocaleDateString([], { weekday: 'long' })}
                </p>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1">
                  {currentDate.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
              </div>

              {/* Day Hourly list */}
              <div className="flex-grow overflow-y-auto max-h-[500px]">
                {hours.map((hour) => {
                  const dayMeetings = filteredMeetings.filter((m) => {
                    const mStart = new Date(m.startTime);
                    return isSameDay(m.startTime, currentDate) && mStart.getHours() === hour;
                  });

                  return (
                    <div 
                      key={hour} 
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, currentDate.toISOString(), hour)}
                      className="grid grid-cols-6 border-b border-slate-100 dark:border-slate-850/80 min-h-[80px]"
                    >
                      <div className="p-4 border-r border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-450 dark:text-slate-500 text-right bg-slate-50/20 dark:bg-slate-950/5 font-mono">
                        {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                      </div>

                      <div className="col-span-5 p-2 flex flex-col gap-2 relative bg-slate-50/[0.01] hover:bg-slate-100/10 dark:hover:bg-slate-800/10">
                        {dayMeetings.map((meeting) => {
                          const isConflict = meeting.status === 'conflict';
                          return (
                            <div
                              key={meeting.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, meeting.id)}
                              onClick={() => navigate(`/meetings/${meeting.id}`)}
                              className={`p-3 rounded-2xl border text-left cursor-grab active:cursor-grabbing text-xs font-semibold transition-all relative overflow-hidden flex justify-between items-center ${
                                isConflict
                                  ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/35 dark:text-rose-455'
                                  : 'bg-indigo-50/50 border-indigo-100/50 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/35 dark:text-indigo-400'
                              }`}
                            >
                              <span 
                                className="absolute top-0 bottom-0 left-0 w-1.5" 
                                style={{ backgroundColor: isConflict ? '#ef4444' : meeting.color || '#6366f1' }}
                              />
                              <div className="pl-3">
                                <h4 className="font-bold flex items-center gap-1.5">
                                  {meeting.title}
                                  {isConflict && (
                                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[8px] bg-rose-200 dark:bg-rose-950 text-rose-800 dark:text-rose-400 rounded-full border border-rose-300/30">
                                      <ShieldAlert className="w-2.5 h-2.5" />
                                      Conflict
                                    </span>
                                  )}
                                </h4>
                                <p className="text-[10px] opacity-75 font-normal mt-1">
                                  {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)} • {meeting.room?.name || 'Virtual'}
                                </p>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="flex -space-x-1.5">
                                  {meeting.participants.slice(0, 3).map((p) => (
                                    <UserAvatar key={p.id} user={p} size="xs" />
                                  ))}
                                </div>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                                  Drag slot to reschedule
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. MONTH VIEW */}
          {viewMode === 'month' && (
            <div className="min-w-[800px] flex flex-col h-full">
              {/* Grid headers */}
              <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-center font-semibold text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-widest py-3">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 grid-rows-6 border-b border-r border-slate-100 dark:border-slate-800">
                {monthDays.map((day, idx) => {
                  const isCurrent = isSameDay(day, new Date());
                  const isCurMonth = day.getMonth() === currentDate.getMonth();
                  
                  const dayMeetings = filteredMeetings.filter((m) => isSameDay(m.startTime, day));

                  return (
                    <div 
                      key={idx}
                      className={`min-h-[90px] border-l border-t border-slate-100 dark:border-slate-850 p-2 flex flex-col gap-1.5 transition-colors ${
                        isCurrent ? 'bg-indigo-50/15 dark:bg-indigo-950/5' : ''
                      } ${isCurMonth ? '' : 'opacity-40 bg-slate-50/20 dark:bg-slate-950/10'}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-[11px] font-bold ${
                          isCurrent 
                            ? 'bg-indigo-600 text-white px-1.5 py-0.5 rounded-md dark:bg-indigo-500' 
                            : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {day.getDate()}
                        </span>
                      </div>
                      
                      <div className="flex-grow flex flex-col gap-1 overflow-y-auto max-h-[60px] scrollbar-none">
                        {dayMeetings.map((meeting) => {
                          const isConflict = meeting.status === 'conflict';
                          return (
                            <div
                              key={meeting.id}
                              onClick={() => navigate(`/meetings/${meeting.id}`)}
                              className={`px-1.5 py-0.5 rounded-md text-[9px] font-semibold truncate border cursor-pointer ${
                                isConflict
                                  ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30'
                                  : 'bg-indigo-50/40 border-indigo-100/30 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-400'
                              }`}
                              title={meeting.title}
                            >
                              {formatTime(meeting.startTime)} {meeting.title}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
