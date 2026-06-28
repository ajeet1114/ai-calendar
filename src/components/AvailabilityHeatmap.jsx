import React from 'react';
import { calendarService } from '../services/calendarService';
import { Users, Info, Clock, CheckCircle } from 'lucide-react';

export const AvailabilityHeatmap = ({ participants, date = new Date(), onSelectTimeSlot }) => {
  const heatmapData = calendarService.getAvailabilityHeatmap(participants, date);

  const densityColors = {
    0: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100/55', // Free
    1: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-100/55', // Light busy
    2: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30 hover:bg-amber-100/55', // Moderate busy
    3: 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/30 hover:bg-rose-100/55', // High busy
  };

  const densityLabels = {
    0: 'Fully Available',
    1: '1 Member Busy',
    2: '2-3 Members Busy',
    3: 'Highly Conflicted',
  };

  return (
    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/85 rounded-2xl shadow-sm">
      <div className="flex justify-between items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Team Availability Heatmap
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          <Info className="w-3.5 h-3.5" />
          <span>Click a free slot to choose it</span>
        </div>
      </div>

      {participants.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
          Select participants to check availability overlaps
        </div>
      ) : (
        <>
          {/* Heatmap Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {heatmapData.map((slot) => {
              const colorClass = densityColors[slot.density];
              const label = densityLabels[slot.density];
              
              return (
                <button
                  key={slot.hour}
                  type="button"
                  onClick={() => onSelectTimeSlot && slot.density === 0 && onSelectTimeSlot(slot.rawHour)}
                  disabled={slot.density > 0 && !onSelectTimeSlot}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 focus:outline-none ${colorClass} ${
                    slot.density === 0 && onSelectTimeSlot 
                      ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' 
                      : 'cursor-default'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs font-bold font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {slot.hour}
                    </span>
                    {slot.density === 0 && (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                  </div>
                  <div className="mt-3">
                    <p className="text-[10px] font-semibold leading-tight">{label}</p>
                    <p className="text-[9px] opacity-70 mt-0.5">
                      {slot.busyCount === 0 ? 'Optimal Slot' : `${slot.busyCount} busy`}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Color Legend */}
          <div className="flex items-center justify-start gap-4 flex-wrap mt-4 border-t border-slate-100 dark:border-slate-800/80 pt-3">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Legend:</span>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200/50" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded bg-indigo-100 dark:bg-indigo-950/40 border border-indigo-200/50" />
              <span>Light busy</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded bg-amber-100 dark:bg-amber-950/40 border border-amber-200/50" />
              <span>Mod busy</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded bg-rose-100 dark:bg-rose-950/40 border border-rose-200/50" />
              <span>Conflicted</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
