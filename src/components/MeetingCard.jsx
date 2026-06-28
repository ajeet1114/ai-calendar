import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, AlertTriangle, Eye } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { formatTime, formatDate } from '../utils/dateHelpers';

export const MeetingCard = ({ meeting, layout = 'list' }) => {
  const navigate = useNavigate();
  const { id, title, startTime, endTime, room, participants, status, color } = meeting;

  const handleCardClick = () => {
    navigate(`/meetings/${id}`);
  };

  const isConflict = status === 'conflict';
  
  if (layout === 'card') {
    return (
      <div 
        onClick={handleCardClick}
        className={`group p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-md transition-all hover:scale-[1.005] duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
          isConflict ? 'ring-1 ring-rose-500/30 bg-rose-500/[0.01]' : ''
        }`}
      >
        {/* Left Color-coded indicator strip */}
        <span 
          className="absolute left-0 top-0 bottom-0 w-1.5"
          style={{ backgroundColor: isConflict ? '#f43f5e' : color || '#6366f1' }}
        />

        <div className="pl-2">
          {/* Header */}
          <div className="flex justify-between items-start gap-2 mb-2">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
              {title}
            </h3>
            {isConflict && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 rounded-full border border-rose-200/20 animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                Conflict
              </span>
            )}
          </div>

          {/* Time & Duration */}
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4">
            {formatDate(startTime)} • {formatTime(startTime)} - {formatTime(endTime)}
          </p>

          {/* Details (Room & Participants) */}
          <div className="space-y-2 mb-4">
            {room && (
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{room.name}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{participants.length} Participant{participants.length > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Footer: User Avatars List & View button */}
        <div className="flex items-center justify-between mt-auto pl-2 border-t border-slate-100 dark:border-slate-800/60 pt-3">
          <div className="flex -space-x-2 overflow-hidden">
            {participants.slice(0, 3).map((p) => (
              <UserAvatar key={p.id} user={p} size="xs" />
            ))}
            {participants.length > 3 && (
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-white dark:bg-slate-800 dark:text-slate-300 dark:border-slate-900">
                +{participants.length - 3}
              </span>
            )}
          </div>

          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            Details
          </span>
        </div>
      </div>
    );
  }

  // Standard List Layout
  return (
    <div
      onClick={handleCardClick}
      className={`group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative overflow-hidden gap-3 ${
        isConflict ? 'ring-1 ring-rose-500/30 bg-rose-500/[0.01]' : ''
      }`}
    >
      {/* Left Color-coded indicator strip */}
      <span 
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ backgroundColor: isConflict ? '#f43f5e' : color || '#6366f1' }}
      />

      {/* Title & timing */}
      <div className="flex items-start gap-3 pl-2 max-w-lg">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {title}
            </h3>
            {isConflict && (
              <span className="flex items-center gap-0.5 px-2 py-0.5 text-[9px] font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 rounded-full border border-rose-200/20 animate-pulse">
                <AlertTriangle className="w-2.5 h-2.5" />
                Conflict
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {formatDate(startTime)} • {formatTime(startTime)} - {formatTime(endTime)}
          </p>
        </div>
      </div>

      {/* Room and participants */}
      <div className="flex flex-row items-center gap-6 pl-2 sm:pl-0">
        {room && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="max-w-[120px] truncate">{room.name}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex -space-x-1.5 ml-1">
            {participants.slice(0, 3).map((p) => (
              <UserAvatar key={p.id} user={p} size="xs" />
            ))}
            {participants.length > 3 && (
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-white dark:bg-slate-800 dark:text-slate-350 dark:border-slate-900">
                +{participants.length - 3}
              </span>
            )}
          </div>
        </div>
        
        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" />
          View
        </span>
      </div>
    </div>
  );
};
