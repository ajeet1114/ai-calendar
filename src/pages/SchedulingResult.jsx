import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { calendarService } from '../services/calendarService';
import { formatDate, formatTime, addMinutes } from '../utils/dateHelpers';
import { ShieldAlert, Sparkles, CheckCircle, Clock, MapPin, Users, Calendar, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAvatar } from '../components/UserAvatar';

export const SchedulingResult = () => {
  const { createMeeting, addToast } = useApp();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null); // stores index of alternative, or null for default

  useEffect(() => {
    const stored = sessionStorage.getItem('conflictfree_draft');
    if (!stored) {
      addToast('No Draft Found', 'Redirecting to meeting creator.', 'info');
      navigate('/create-meeting');
      return;
    }
    
    const parsedDraft = JSON.parse(stored);
    setDraft(parsedDraft);
    
    // Evaluate conflicts
    const conflictList = calendarService.getConflictDetails(parsedDraft);
    setConflicts(conflictList);

    // Fetch alternative times
    calendarService.findAlternativeSlots(parsedDraft).then((alts) => {
      setAlternatives(alts);
      setLoading(false);
      
      // Auto-select the first 100% available alternative if current slot has conflicts
      if (conflictList.length > 0 && alts.length > 0) {
        const topSlot = alts.find(alt => alt.score === 100) || alts[0];
        setSelectedSlot(topSlot);
      }
    });
  }, [navigate]);

  if (loading || !draft) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600 mb-4" />
        <p className="text-xs text-slate-500">Calculating conflict-free schedules...</p>
      </div>
    );
  }

  // Active slot properties (depends on whether user chose an alternative or stuck to requested)
  const activeSlot = selectedSlot || draft;
  const isAlternativeSelected = selectedSlot !== null;
  const currentSlotConflicts = isAlternativeSelected ? [] : conflicts;

  const handleAcceptSchedule = async () => {
    try {
      const scheduled = await createMeeting(activeSlot);
      
      // Trigger canvas confetti fireworks
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Clear draft
      sessionStorage.removeItem('conflictfree_draft');
      addToast('Meeting Scheduled!', `"${scheduled.title}" is officially confirmed.`, 'success');
      navigate('/');
    } catch (err) {
      console.error(err);
      addToast('Error', 'Failed to schedule meeting.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-850 dark:text-slate-105 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          ConflictFree Scheduling Suggestions
        </h2>
        <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">
          Review overlaps, inspect suggested alternative slots, and authorize the booking.
        </p>
      </div>

      {/* Comparative View: Requested Slot vs Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (Conflict explanation & Suggested Slots) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Requested Details Overview Card */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
              Original Request
            </h3>

            <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{draft.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDate(draft.startTime)} at {formatTime(draft.startTime)} ({draft.duration} mins)
                </p>
              </div>

              {/* Conflict Status indicator badge */}
              <div className={`px-4 py-2 rounded-2xl border text-xs font-semibold flex items-center gap-2 self-start sm:self-auto ${
                conflicts.length > 0
                  ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400'
              }`}>
                {conflicts.length > 0 ? (
                  <>
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    <span>{conflicts.length} Conflict{conflicts.length > 1 ? 's' : ''} Detected</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>Conflict-Free Slot</span>
                  </>
                )}
              </div>
            </div>

            {/* List of overlaps (if choosing requested) */}
            {conflicts.length > 0 && !isAlternativeSelected && (
              <div className="p-4 bg-rose-500/[0.02] border border-rose-500/25 rounded-2xl space-y-3">
                <p className="text-xs font-bold text-rose-650 dark:text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  Booking Blockers
                </p>
                <div className="divide-y divide-rose-200/20 text-xs">
                  {conflicts.map((conf, index) => (
                    <div key={index} className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200 font-semibold">{conf.resource}</strong>
                        <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-0.5">{conf.reason}</p>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400">
                        {conf.solution}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Alternatives Suggestions List */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-205 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Conflict-Free Suggestions
            </h3>

            {alternatives.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 rounded-2xl">
                No alternative slots found. Adjust parameters.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {alternatives.map((slot, index) => {
                  const isSelected = selectedSlot && selectedSlot.startTime === slot.startTime;
                  
                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isSelected
                          ? 'bg-indigo-50/30 border-indigo-500 dark:bg-indigo-950/20 dark:border-indigo-500'
                          : 'bg-white border-slate-200/70 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800'
                      }`}
                    >
                      {/* Left border strip */}
                      <span className={`absolute left-0 top-0 bottom-0 w-1 ${
                        slot.score === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`} />

                      <div className="pl-2 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-850 dark:text-slate-100">
                            {formatDate(slot.startTime)}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                            slot.score === 100
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400'
                              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400'
                          }`}>
                            {slot.score}% Score
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-450 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)} ({slot.duration} mins)
                        </p>
                      </div>

                      <div className="flex items-center gap-4 pl-2 sm:pl-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {slot.room ? slot.room.name : 'Virtual'}
                          </p>
                          <p className="text-[10px] text-slate-450 dark:text-slate-550 mt-0.5">
                            {slot.conflictReason}
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600 text-white dark:border-indigo-500 dark:bg-indigo-500'
                            : 'border-slate-300 dark:border-slate-700 bg-transparent'
                        }`}>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Acceptance confirmation card */}
        <div className="space-y-6">
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col gap-4">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Selected Agenda Slot
            </h4>

            {/* Target Slot Details */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-3">
              <div>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold tracking-wide uppercase">MEETING TITLE</p>
                <p className="text-xs font-bold text-slate-805 dark:text-slate-200 mt-0.5">{draft.title}</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold tracking-wide uppercase">DATE & TIME</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {formatDate(activeSlot.startTime)} at {formatTime(activeSlot.startTime)}
                </p>
              </div>

              {activeSlot.room && (
                <div>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold tracking-wide uppercase">MEETING ROOM</p>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {activeSlot.room.name}
                  </p>
                </div>
              )}
            </div>

            {/* Attendance checklist */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">
                Required Attendees ({draft.participants.length})
              </span>
              <div className="divide-y divide-slate-100 dark:divide-slate-850 max-h-[150px] overflow-y-auto pr-1">
                {draft.participants.map((person) => {
                  // Check if attendee is busy in current slot (if not choosing alternative)
                  const isBusyInCurrent = currentSlotConflicts.some(
                    (c) => c.type === 'participant' && c.resource.includes(person.name)
                  );
                  
                  return (
                    <div key={person.id} className="flex items-center justify-between py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <img src={person.avatar} className="w-5 h-5 rounded-full object-cover border border-slate-100 dark:border-slate-800" />
                        <span className="font-semibold text-slate-800 dark:text-slate-250 truncate max-w-[120px]">
                          {person.name}
                        </span>
                      </div>
                      
                      {isBusyInCurrent ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400 font-semibold">
                          Busy
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-semibold">
                          Free
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Accept Action Button */}
            <button
              onClick={handleAcceptSchedule}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/10 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-center flex items-center justify-center gap-2"
            >
              <span>Accept Schedule</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
