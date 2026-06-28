import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { meetingService } from '../services/meetingService';
import { mockRooms, mockUsers } from '../utils/mockData';
import { formatDate, formatTime, addMinutes } from '../utils/dateHelpers';
import { Calendar, Clock, MapPin, Users, Edit, Trash2, CheckCircle, AlertTriangle, ArrowLeft, Save, X, Info } from 'lucide-react';
import { UserAvatar } from '../components/UserAvatar';
import { Modal } from '../components/Modal';

export const MeetingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deleteMeeting, updateMeeting, addToast } = useApp();
  
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Edit fields
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editDuration, setEditDuration] = useState(30);
  const [editRoom, setEditRoom] = useState(null);

  useEffect(() => {
    meetingService.getMeetingById(id)
      .then((m) => {
        setMeeting(m);
        // Prep edit fields
        setEditTitle(m.title);
        setEditDesc(m.description || '');
        const d = new Date(m.startTime);
        setEditDate(d.toISOString().split('T')[0]);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        setEditTime(`${hh}:${mm}`);
        setEditDuration(m.duration);
        setEditRoom(m.room);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        addToast('Not Found', 'The requested meeting could not be loaded.', 'error');
        navigate('/');
      });
  }, [id, navigate]);

  if (loading || !meeting) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center text-center animate-pulse">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-650 mb-3" />
        <p className="text-xs text-slate-400">Fetching meeting details...</p>
      </div>
    );
  }

  const handleDelete = async () => {
    await deleteMeeting(meeting.id);
    setShowDeleteModal(false);
    navigate('/');
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    const startIso = new Date(`${editDate}T${editTime}:00`).toISOString();
    const endIso = addMinutes(startIso, editDuration);

    try {
      const updated = await updateMeeting(meeting.id, {
        title: editTitle,
        description: editDesc,
        startTime: startIso,
        endTime: endIso,
        duration: editDuration,
        room: editRoom
      });

      setMeeting(updated);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      addToast('Error', 'Failed to update meeting details.', 'error');
    }
  };

  const getLiveStatusBadge = (liveStatus, status) => {
    if (status === 'conflict') {
      return (
        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 text-xs font-semibold border border-rose-200/20 animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5" />
          Conflict
        </span>
      );
    }

    switch (liveStatus) {
      case 'active':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Ongoing
          </span>
        );
      case 'ended':
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-655 dark:bg-slate-800 dark:text-slate-400 text-xs font-semibold">
            Ended
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 text-xs font-semibold border border-indigo-200/20">
            Upcoming
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top back selector */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-205 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Main detail container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Info display or editing block */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
            {!isEditing ? (
              // Standard View Mode
              <div className="space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-105">{meeting.title}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Organized by <strong className="font-semibold text-slate-700 dark:text-slate-300">{meeting.organizer.name}</strong>
                    </p>
                  </div>
                  {getLiveStatusBadge(meeting.liveStatus, meeting.status)}
                </div>

                {meeting.status === 'conflict' && (
                  <div className="p-4 bg-rose-500/[0.02] border border-rose-500/25 rounded-2xl flex gap-3 text-xs text-rose-700 dark:text-rose-400">
                    <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold">Schedule Overlap Detected</h4>
                      <p className="mt-1 leading-relaxed">
                        This meeting conflicts with another scheduled block. Click the Edit button below to reschedule or change rooms to resolve the conflict.
                      </p>
                    </div>
                  </div>
                )}

                {/* Description info */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Agenda Notes</span>
                  <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed">
                    {meeting.description || 'No description provided for this roadmap alignment.'}
                  </p>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-850 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-500 dark:text-slate-400">
                      <Calendar className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase">DATE</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{formatDate(meeting.startTime)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-500 dark:text-slate-400">
                      <Clock className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase">TIME & SPAN</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {formatTime(meeting.startTime)} ({meeting.duration} mins)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-500 dark:text-slate-400">
                      <MapPin className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase">ALLOCATED ROOM</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-202 mt-0.5">
                        {meeting.room ? meeting.room.name : 'Virtual Link'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Edit Actions buttons */}
                <div className="flex gap-3 border-t border-slate-100 dark:border-slate-850 pt-5">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Meeting</span>
                  </button>

                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Cancel Meeting</span>
                  </button>
                </div>
              </div>
            ) : (
              // Edit Mode Form
              <form onSubmit={handleSaveChanges} className="space-y-5">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Edit Meeting Details</h3>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-450 dark:hover:bg-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">TITLE</label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">AGENDA NOTES</label>
                    <textarea
                      rows="3"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">DATE</label>
                      <input
                        type="date"
                        required
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">TIME</label>
                      <input
                        type="time"
                        required
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">DURATION</label>
                      <select
                        value={editDuration}
                        onChange={(e) => setEditDuration(parseInt(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value={15}>15 Mins</option>
                        <option value={30}>30 Mins</option>
                        <option value={45}>45 Mins</option>
                        <option value={60}>1 Hour</option>
                        <option value={90}>1.5 Hours</option>
                        <option value={120}>2 Hours</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">ROOM</label>
                      <select
                        value={editRoom ? editRoom.id : ''}
                        onChange={(e) => {
                          const match = mockRooms.find((r) => r.id === e.target.value);
                          setEditRoom(match || null);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">Virtual Link</option>
                        {mockRooms.map((r) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-850">
                  <button
                    type="submit"
                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-755 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="py-2 px-4 bg-slate-55/15 hover:bg-slate-55/25 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Side: Attendees status lists */}
        <div className="space-y-6">
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-850">
              <Users className="w-4.5 h-4.5 text-indigo-500" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Attendee RSVPs
              </h3>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-850">
              {meeting.participants.map((person) => {
                const isOrganizer = person.id === meeting.organizer.id;
                
                // Emulate typical RSVP statuses
                let rsvpLabel = 'Accepted';
                let rsvpColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-450';
                
                if (!isOrganizer) {
                  // Static mock RSVPs for details representation
                  if (person.id === 'u2') {
                    rsvpLabel = 'Accepted';
                    rsvpColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-450';
                  } else if (person.id === 'u3') {
                    rsvpLabel = 'Tentative';
                    rsvpColor = 'bg-amber-50 text-amber-705 dark:bg-amber-950/30 dark:text-amber-450';
                  } else if (person.id === 'u4') {
                    rsvpLabel = 'No response';
                    rsvpColor = 'bg-slate-100 text-slate-550 dark:bg-slate-800 dark:text-slate-400';
                  }
                } else {
                  rsvpLabel = 'Organizer';
                  rsvpColor = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200/10';
                }

                return (
                  <div key={person.id} className="flex items-center justify-between py-3 text-xs">
                    <div className="flex items-center gap-2">
                      <UserAvatar user={person} size="xs" />
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{person.name}</p>
                        <p className="text-[9px] text-slate-450 dark:text-slate-500">{person.role}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${rsvpColor}`}>
                      {rsvpLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {meeting.room && (
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Room Allocation Info</h4>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl text-xs space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-100">{meeting.room.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{meeting.room.location}</p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Cancellation"
        size="sm"
      >
        <div className="space-y-4 text-center">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-full w-12 h-12 mx-auto flex items-center justify-center dark:bg-rose-950/30">
            <Trash2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Cancel this meeting?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              This action cannot be undone. Attendees will be notified that the meeting was removed.
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleDelete}
              className="py-2.5 px-4 flex-grow bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-sm"
            >
              Cancel Meeting
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="py-2.5 px-4 bg-slate-55/15 hover:bg-slate-55/25 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Keep Event
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
