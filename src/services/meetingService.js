// Mock Meeting Service

import { mockMeetings, mockUsers, mockRooms } from '../utils/mockData';
import { checkOverlap, addMinutes } from '../utils/dateHelpers';

const MEETINGS_KEY = 'conflictfree_meetings';

const initializeMeetings = () => {
  const data = localStorage.getItem(MEETINGS_KEY);
  if (!data) {
    localStorage.setItem(MEETINGS_KEY, JSON.stringify(mockMeetings));
    return mockMeetings;
  }
  return JSON.parse(data);
};

export const meetingService = {
  getMeetings: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(initializeMeetings());
      }, 400);
    });
  },

  getMeetingById: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const meetings = initializeMeetings();
        const meeting = meetings.find(m => m.id === id);
        if (meeting) resolve(meeting);
        else reject(new Error('Meeting not found'));
      }, 200);
    });
  },

  createMeeting: async (meetingData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const meetings = initializeMeetings();
        
        // Auto-assign ID and organizer (Alice default)
        const organizer = JSON.parse(localStorage.getItem('conflictfree_user')) || mockUsers[0];
        
        const newMeeting = {
          id: 'm_' + Math.random().toString(36).substr(2, 9),
          title: meetingData.title || 'Untitled Meeting',
          description: meetingData.description || '',
          startTime: meetingData.startTime,
          endTime: meetingData.endTime || addMinutes(meetingData.startTime, meetingData.duration || 30),
          duration: parseInt(meetingData.duration) || 30,
          room: meetingData.room || null,
          organizer: organizer,
          participants: meetingData.participants || [organizer],
          color: meetingData.color || '#6366f1',
          status: meetingData.status || 'scheduled',
          liveStatus: 'upcoming'
        };

        // Check if there is an overlap conflict
        const hasConflicts = meetings.some(existing => {
          if (existing.status === 'cancelled') return false;
          // Room conflict
          const roomConflict = newMeeting.room && existing.room && existing.room.id === newMeeting.room.id;
          // Attendee conflict
          const attendeeConflict = newMeeting.participants.some(p => 
            existing.participants.some(ep => ep.id === p.id)
          );
          
          if (roomConflict || attendeeConflict) {
            return checkOverlap(newMeeting.startTime, newMeeting.endTime, existing.startTime, existing.endTime);
          }
          return false;
        });

        if (hasConflicts) {
          newMeeting.status = 'conflict';
        }

        meetings.push(newMeeting);
        localStorage.setItem(MEETINGS_KEY, JSON.stringify(meetings));
        resolve(newMeeting);
      }, 500);
    });
  },

  updateMeeting: async (id, updatedData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const meetings = initializeMeetings();
        const index = meetings.findIndex(m => m.id === id);
        if (index === -1) {
          reject(new Error('Meeting not found'));
          return;
        }

        const currentMeeting = meetings[index];
        const updated = {
          ...currentMeeting,
          ...updatedData,
          endTime: updatedData.startTime && updatedData.duration 
            ? addMinutes(updatedData.startTime, updatedData.duration)
            : updatedData.endTime || currentMeeting.endTime
        };

        // Re-evaluate conflicts
        const hasConflicts = meetings.some(existing => {
          if (existing.id === id || existing.status === 'cancelled') return false;
          const roomConflict = updated.room && existing.room && existing.room.id === updated.room.id;
          const attendeeConflict = updated.participants.some(p => 
            existing.participants.some(ep => ep.id === p.id)
          );
          if (roomConflict || attendeeConflict) {
            return checkOverlap(updated.startTime, updated.endTime, existing.startTime, existing.endTime);
          }
          return false;
        });

        updated.status = hasConflicts ? 'conflict' : 'scheduled';
        meetings[index] = updated;
        localStorage.setItem(MEETINGS_KEY, JSON.stringify(meetings));
        resolve(updated);
      }, 500);
    });
  },

  deleteMeeting: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const meetings = initializeMeetings();
        const filtered = meetings.filter(m => m.id !== id);
        if (filtered.length === meetings.length) {
          reject(new Error('Meeting not found'));
          return;
        }
        localStorage.setItem(MEETINGS_KEY, JSON.stringify(filtered));
        resolve(true);
      }, 400);
    });
  },

  // Regex-based natural language intelligence parser
  parseNaturalLanguageInput: (text) => {
    const textLower = text.toLowerCase();
    
    // 1. Detect Room
    let detectedRoom = null;
    for (const room of mockRooms) {
      if (textLower.includes(room.name.toLowerCase()) || textLower.includes(room.name.split(' ')[0].toLowerCase())) {
        detectedRoom = room;
        break;
      }
    }
    if (!detectedRoom && textLower.includes('boardroom')) detectedRoom = mockRooms[0];
    if (!detectedRoom && textLower.includes('huddle')) detectedRoom = mockRooms[1];
    if (!detectedRoom && textLower.includes('glass')) detectedRoom = mockRooms[2];
    if (!detectedRoom && textLower.includes('innovation')) detectedRoom = mockRooms[3];

    // 2. Detect Participants
    const detectedParticipants = [];
    const currentUser = JSON.parse(localStorage.getItem('conflictfree_user')) || mockUsers[0];
    detectedParticipants.push(currentUser); // Organizer is always participant

    mockUsers.forEach(user => {
      if (user.id === currentUser.id) return;
      const firstName = user.name.split(' ')[0].toLowerCase();
      if (textLower.includes(firstName) || textLower.includes(user.name.toLowerCase())) {
        detectedParticipants.push(user);
      }
    });

    // 3. Detect Duration
    let duration = 30; // default minutes
    const durationMatch = textLower.match(/(\d+)\s*(min|minute|hr|hour|h)/);
    if (durationMatch) {
      const num = parseInt(durationMatch[1]);
      const unit = durationMatch[2];
      if (unit.startsWith('h')) {
        duration = num * 60;
      } else {
        duration = num;
      }
    } else if (textLower.includes('an hour') || textLower.includes('1 hour') || textLower.includes('1hr')) {
      duration = 60;
    } else if (textLower.includes('half hour') || textLower.includes('30 mins')) {
      duration = 30;
    }

    // 4. Detect Date
    const targetDate = new Date();
    targetDate.setSeconds(0, 0);
    
    if (textLower.includes('tomorrow')) {
      targetDate.setDate(targetDate.getDate() + 1);
    } else if (textLower.includes('next monday')) {
      const day = targetDate.getDay();
      const distance = (8 - day) % 7 || 7;
      targetDate.setDate(targetDate.getDate() + distance);
    } else {
      // Check days of week
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      for (let i = 0; i < 7; i++) {
        if (textLower.includes(days[i])) {
          const currentDay = targetDate.getDay();
          const distance = (i + 7 - currentDay) % 7;
          targetDate.setDate(targetDate.getDate() + (distance === 0 ? 7 : distance)); // Next occurrence
          break;
        }
      }
    }

    // 5. Detect Time (e.g. "3pm", "10:30am", "at 14:00")
    let hour = 10; // default 10:00 AM
    let minute = 0;
    
    const timeMatch = textLower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
    if (timeMatch) {
      let h = parseInt(timeMatch[1]);
      const m = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const ampm = timeMatch[3];
      
      // Filter false positives like "30 min"
      const isDurationConflict = durationMatch && durationMatch[1] === timeMatch[1] && !ampm;
      if (!isDurationConflict && h >= 1 && h <= 24) {
        if (ampm) {
          if (ampm === 'pm' && h < 12) h += 12;
          if (ampm === 'am' && h === 12) h = 0;
        } else {
          // If no am/pm, infer smart business hour (e.g. 2 means 2 PM (14), 10 means 10 AM)
          if (h >= 1 && h <= 6) h += 12;
        }
        hour = h;
        minute = m;
      }
    }

    targetDate.setHours(hour, minute, 0, 0);

    // Extract Title (Simple fallback)
    let title = 'Project Sync';
    if (textLower.startsWith('meet with') || textLower.startsWith('meeting with')) {
      const remainingText = text.replace(/^(meet|meeting)\s+with\s+/i, '');
      const parts = remainingText.split(/(at|on|for|in|tomorrow|today)/i);
      title = `Meeting w/ ${parts[0].trim()}`;
    } else {
      // Find verbs/nouns
      const matchTitle = text.match(/^(?:schedule|create|book)\s+([^on|at|for|in|tomorrow]+)/i);
      if (matchTitle && matchTitle[1]) {
        title = matchTitle[1].trim();
      }
    }

    return {
      title,
      startTime: targetDate.toISOString(),
      duration,
      room: detectedRoom,
      participants: detectedParticipants
    };
  }
};
