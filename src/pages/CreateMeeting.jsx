import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { meetingService } from '../services/meetingService';
import { mockUsers, mockRooms } from '../utils/mockData';
import { AvailabilityHeatmap } from '../components/AvailabilityHeatmap';
import { Sparkles, Users, Calendar, Clock, MapPin, Search, Plus, X, UserMinus, ShieldAlert, AlertTriangle } from 'lucide-react';
import { addMinutes, formatTime, formatDate } from '../utils/dateHelpers';

export const CreateMeeting = () => {
  const { createMeeting, addToast } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // NLP Command state
  const [nlpText, setNlpText] = useState('');
  const [parsing, setParsing] = useState(false);

  // Structured fields
  const [title, setTitle] = useState('Project Alignment');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [duration, setDuration] = useState(60); // minutes
  const [selectedRoom, setSelectedRoom] = useState(mockRooms[0]);
  const [participants, setParticipants] = useState([mockUsers[0]]); // Organizer by default

  // Participant Autocomplete search state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([mockUsers[1], mockUsers[2]]);
  const autocompleteRef = useRef(null);

  // Load draft from NLP parser (if redirected from dashboard or parsing)
  useEffect(() => {
    const isDraft = searchParams.get('draft');
    if (isDraft) {
      const stored = sessionStorage.getItem('conflictfree_draft');
      if (stored) {
        applyParsedDraft(JSON.parse(stored));
      }
    }
  }, [searchParams]);

  // Click outside autocomplete dropdown to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Run NLP extraction
  const handleParseNlp = () => {
    if (!nlpText.trim()) return;
    setParsing(true);
    setTimeout(() => {
      const parsed = meetingService.parseNaturalLanguageInput(nlpText);
      applyParsedDraft(parsed);
      setParsing(false);
      addToast('NLP Parsed Successfully', 'Draft details updated based on input.', 'success');
    }, 600);
  };

  const applyParsedDraft = (draft) => {
    if (draft.title) setTitle(draft.title);
    if (draft.startTime) {
      const d = new Date(draft.startTime);
      setStartDate(d.toISOString().split('T')[0]);
      
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      setStartTime(`${hours}:${minutes}`);
    }
    if (draft.duration) setDuration(draft.duration);
    if (draft.room) setSelectedRoom(draft.room);
    if (draft.participants && draft.participants.length > 0) {
      setParticipants(draft.participants);
    }
  };

  // Handle Autocomplete keyboard inputs
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Filter suggestions excluding already added participants
    const filtered = mockUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(query.toLowerCase()) &&
        !participants.some((p) => p.id === user.id)
    );
    
    setSuggestions(filtered);
    setActiveSuggestion(0);
    setShowSuggestions(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions[activeSuggestion]) {
        addParticipant(suggestions[activeSuggestion]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const addParticipant = (user) => {
    if (!participants.some((p) => p.id === user.id)) {
      setParticipants([...participants, user]);
      // Update recent searches
      setRecentSearches(prev => {
        const filtered = prev.filter(p => p.id !== user.id);
        return [user, ...filtered].slice(0, 3);
      });
    }
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const removeParticipant = (userId) => {
    // Cannot remove Alice (the organizer) for the simulation
    if (userId === mockUsers[0].id) {
      addToast('Information', 'Meeting organizer must be included.', 'info');
      return;
    }
    setParticipants(participants.filter((p) => p.id !== userId));
  };

  // Heatmap slot selection
  const handleSelectTimeSlot = (hour) => {
    const formattedHour = String(hour).padStart(2, '0');
    setStartTime(`${formattedHour}:00`);
    addToast('Time Slot Selected', `Start time set to ${formattedHour}:00.`, 'success');
  };

  // Compile draft parameters
  const getDraftData = () => {
    const startIso = new Date(`${startDate}T${startTime}:00`).toISOString();
    const endIso = addMinutes(startIso, duration);
    return {
      title,
      description,
      startTime: startIso,
      endTime: endIso,
      duration,
      room: selectedRoom,
      participants
    };
  };

  // Action: Check schedule and resolve
  const handleGenerateSchedule = async (e) => {
    e.preventDefault();
    const draft = getDraftData();

    // Check if slot conflicts
    const meetingsList = JSON.parse(localStorage.getItem('conflictfree_meetings')) || [];
    const hasConflicts = meetingsList.some(existing => {
      if (existing.status === 'cancelled') return false;
      const roomConflict = draft.room && existing.room && existing.room.id === draft.room.id;
      const attendeeConflict = draft.participants.some(p => 
        existing.participants.some(ep => ep.id === p.id)
      );
      if (roomConflict || attendeeConflict) {
        const sA = new Date(draft.startTime).getTime();
        const eA = new Date(draft.endTime).getTime();
        const sB = new Date(existing.startTime).getTime();
        const eB = new Date(existing.endTime).getTime();
        return sA < eB && sB < eA;
      }
      return false;
    });

    if (hasConflicts) {
      // Save draft details and route to alternative resolver page
      sessionStorage.setItem('conflictfree_draft', JSON.stringify(draft));
      addToast('Scheduling Warning', 'Double booking conflicts found. Proposing alternatives.', 'warning');
      navigate('/scheduling-result');
    } else {
      // Schedule immediately
      await createMeeting(draft);
      navigate('/');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-105">
          Schedule Smart Meeting
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Create optimized meetings using natural language parsing or structured input.
        </p>
      </div>

      {/* Natural Language Panel */}
      <div className="p-5 bg-linear-to-r from-indigo-500/10 to-violet-500/5 dark:from-indigo-950/20 dark:to-violet-950/5 border border-indigo-100/50 dark:border-indigo-900/20 rounded-2xl glow-primary">
        <label className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
            Natural Language Parser
          </span>
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={nlpText}
            onChange={(e) => setNlpText(e.target.value)}
            placeholder='e.g., "Schedule a UX Review with Alice and Bob on Monday at 3pm for 90 minutes in Glass Room Gamma"'
            className="flex-grow bg-white border border-slate-200/55 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-indigo-400 transition-all"
          />
          <button
            type="button"
            onClick={handleParseNlp}
            disabled={parsing || !nlpText.trim()}
            className="py-3 px-6 bg-slate-950 hover:bg-slate-900 dark:bg-indigo-650 dark:hover:bg-indigo-700 text-white font-medium text-sm rounded-xl active:scale-[0.98] transition-all flex-shrink-0 cursor-pointer disabled:opacity-50"
          >
            {parsing ? 'Parsing...' : 'Apply Command'}
          </button>
        </div>
      </div>

      {/* Main Creation Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Fields Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleGenerateSchedule} className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-105 uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-850">
              Meeting Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Title input */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                  Meeting Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Review Roadmap Alignments..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 dark:focus:bg-slate-900 transition-colors"
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                  Description (Optional)
                </label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter meeting scope or notes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 dark:focus:bg-slate-900 transition-colors"
                />
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                  Meeting Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-850 focus:bg-white focus:border-indigo-500 focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 dark:focus:bg-slate-900 transition-colors"
                  />
                </div>
              </div>

              {/* Time Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                  Preferred Time
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-850 focus:bg-white focus:border-indigo-500 focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 dark:focus:bg-slate-900 transition-colors"
                />
              </div>

              {/* Duration Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-850 focus:bg-white focus:border-indigo-500 focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 dark:focus:bg-slate-900 transition-colors cursor-pointer"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>1 Hour</option>
                  <option value={90}>1.5 Hours</option>
                  <option value={120}>2 Hours</option>
                </select>
              </div>

              {/* Room select */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                  Meeting Room (Optional)
                </label>
                <select
                  value={selectedRoom ? selectedRoom.id : ''}
                  onChange={(e) => {
                    const match = mockRooms.find((r) => r.id === e.target.value);
                    setSelectedRoom(match || null);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-850 focus:bg-white focus:border-indigo-500 focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 dark:focus:bg-slate-900 transition-colors cursor-pointer"
                >
                  <option value="">Virtual (Zoom/Teams Link)</option>
                  {mockRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} ({room.capacity} cap)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Buttons action */}
            <div className="flex gap-4 pt-3 border-t border-slate-100 dark:border-slate-850">
              <button
                type="submit"
                className="py-3 px-6 flex-grow bg-indigo-650 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-md shadow-indigo-600/10 active:scale-[0.98] transition-all cursor-pointer text-center"
              >
                Generate Schedule
              </button>
              
              <button
                type="button"
                onClick={() => {
                  const draft = getDraftData();
                  sessionStorage.setItem('conflictfree_draft', JSON.stringify(draft));
                  navigate('/scheduling-result');
                }}
                className="py-3 px-6 bg-slate-550/10 hover:bg-slate-550/20 text-slate-700 dark:text-slate-305 dark:bg-slate-800 dark:hover:bg-slate-750 font-medium text-sm rounded-xl active:scale-[0.98] transition-all cursor-pointer text-center"
              >
                Suggest Alternatives
              </button>
            </div>
          </form>

          {/* Availability Heatmap under the form */}
          <AvailabilityHeatmap 
            participants={participants} 
            date={new Date(startDate)} 
            onSelectTimeSlot={handleSelectTimeSlot}
          />
        </div>

        {/* Right Side: Participant Autocomplete search */}
        <div className="space-y-6">
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-indigo-500" />
                Attendees List
              </h3>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5">
                Search and add participants to audit overlaps.
              </p>
            </div>

            {/* Autocomplete Input Search */}
            <div ref={autocompleteRef} className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                placeholder="Search by name or email..."
                className="block w-full rounded-xl border border-slate-200 bg-slate-55/20 py-2.5 pl-10 pr-4 text-xs text-slate-850 placeholder-slate-450 focus:bg-white focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:placeholder-slate-500 transition-all animate-fade-in"
              />

              {/* Suggestions Dropdown panel */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1.5 z-40 rounded-xl border border-slate-200/80 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-900 max-h-60 overflow-y-auto">
                  {suggestions.map((user, index) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => addParticipant(user)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                        index === activeSuggestion
                          ? 'bg-indigo-50/80 text-indigo-650 dark:bg-indigo-950/40 dark:text-indigo-400'
                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <img src={user.avatar} className="w-5 h-5 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-[10px] opacity-70">{user.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Added list */}
            <div className="space-y-2 mt-2">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">
                Selected ({participants.length})
              </span>
              <div className="divide-y divide-slate-100 dark:divide-slate-850 max-h-[160px] overflow-y-auto pr-1">
                {participants.map((person) => (
                  <div key={person.id} className="flex items-center justify-between py-2 text-xs">
                    <div className="flex items-center gap-2">
                      <img src={person.avatar} className="w-6 h-6 rounded-full object-cover border border-slate-100 dark:border-slate-800" />
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {person.name}
                          {person.id === mockUsers[0].id && (
                            <span className="ml-1 text-[8px] px-1 bg-indigo-50 text-indigo-600 rounded font-bold dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200/20">
                              Org
                            </span>
                          )}
                        </p>
                        <p className="text-[9px] text-slate-450 dark:text-slate-500">{person.role}</p>
                      </div>
                    </div>
                    {person.id !== mockUsers[0].id && (
                      <button
                        type="button"
                        onClick={() => removeParticipant(person.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        title="Remove attendee"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Searches section */}
            {recentSearches.length > 0 && searchQuery.trim() === '' && (
              <div className="space-y-1.5 mt-2 border-t border-slate-100 dark:border-slate-850 pt-3">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">
                  Recent contacts
                </span>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((u) => {
                    const isAlreadySelected = participants.some(p => p.id === u.id);
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => !isAlreadySelected && addParticipant(u)}
                        disabled={isAlreadySelected}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] transition-all font-semibold ${
                          isAlreadySelected
                            ? 'bg-slate-50/50 border-slate-100 dark:bg-slate-950/20 dark:border-slate-850 opacity-40 cursor-not-allowed'
                            : 'bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900 border-slate-150 dark:border-slate-850 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{u.name.split(' ')[0]}</span>
                        <Plus className="w-3 h-3 text-slate-400" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Rooms feature card */}
          {selectedRoom && (
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4.5 h-4.5 text-indigo-500" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Room Allocation</h4>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl space-y-2">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{selectedRoom.name}</p>
                <p className="text-[10px] text-slate-450 dark:text-slate-500">{selectedRoom.location}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedRoom.features.map(f => (
                    <span key={f} className="text-[8px] font-bold px-1.5 py-0.5 bg-indigo-50/50 text-indigo-650 dark:bg-indigo-950/30 dark:text-indigo-400 rounded-md border border-indigo-200/10">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
