// Mock Calendar Service for Conflict Allocation and Availability Mapping

import { mockMeetings } from '../utils/mockData';
import { checkOverlap, addMinutes, isSameDay } from '../utils/dateHelpers';

export const calendarService = {
  // Generate conflict-free alternative slots
  findAlternativeSlots: async (meetingData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const meetings = JSON.parse(localStorage.getItem('conflictfree_meetings')) || mockMeetings;
        const { startTime, duration, room, participants, id: currentId } = meetingData;
        
        const alternatives = [];
        const baseDate = new Date(startTime);
        
        // Potential business hour starting slots (9:00 AM, 10:00 AM, 11:00 AM, 1:00 PM, 2:00 PM, 3:00 PM, 4:00 PM)
        const candidateHours = [9, 10, 11, 13, 14, 15, 16];
        
        // Scan today, tomorrow, and the day after tomorrow
        for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
          const testDate = new Date(baseDate);
          testDate.setDate(baseDate.getDate() + dayOffset);
          
          for (const hour of candidateHours) {
            testDate.setHours(hour, 0, 0, 0);
            const slotStart = testDate.toISOString();
            const slotEnd = addMinutes(slotStart, duration);
            
            // Check if this slot conflicts
            let slotHasConflict = false;
            let roomBusy = false;
            const busyParticipants = [];

            for (const existing of meetings) {
              if (existing.id === currentId || existing.status === 'cancelled') continue;
              
              const overlap = checkOverlap(slotStart, slotEnd, existing.startTime, existing.endTime);
              if (overlap) {
                if (room && existing.room && existing.room.id === room.id) {
                  roomBusy = true;
                  slotHasConflict = true;
                }
                
                const overlappingAttendees = participants.filter(p =>
                  existing.participants.some(ep => ep.id === p.id)
                );
                
                if (overlappingAttendees.length > 0) {
                  slotHasConflict = true;
                  overlappingAttendees.forEach(a => {
                    if (!busyParticipants.some(bp => bp.id === a.id)) {
                      busyParticipants.push(a);
                    }
                  });
                }
              }
            }

            if (!slotHasConflict) {
              alternatives.push({
                startTime: slotStart,
                endTime: slotEnd,
                duration,
                room,
                score: 100, // Perfect availability
                conflictReason: 'Conflict-Free'
              });
            } else if (busyParticipants.length < participants.length) {
              // Soft alternative: maybe room is busy but we can change rooms, or only 1 person is busy
              alternatives.push({
                startTime: slotStart,
                endTime: slotEnd,
                duration,
                room: roomBusy ? null : room, // Need a different room if room is busy
                score: Math.max(20, 100 - (busyParticipants.length * 25) - (roomBusy ? 30 : 0)),
                conflictReason: roomBusy ? 'Room Occupied (requires room change)' : `${busyParticipants.map(p => p.name.split(' ')[0]).join(', ')} busy`
              });
            }

            if (alternatives.filter(alt => alt.score === 100).length >= 3) break;
          }
          if (alternatives.filter(alt => alt.score === 100).length >= 3) break;
        }

        // Sort alternatives by availability score (highest first)
        const sortedAlts = alternatives
          .sort((a, b) => b.score - a.score)
          .slice(0, 4);

        resolve(sortedAlts);
      }, 600);
    });
  },

  // Calculate detailed explanations for a conflict
  getConflictDetails: (meetingData, allMeetings = []) => {
    const { startTime, duration, room, participants, id: currentId } = meetingData;
    const endTime = addMinutes(startTime, duration);
    const conflicts = [];

    const activeMeetings = allMeetings.length > 0 
      ? allMeetings 
      : (JSON.parse(localStorage.getItem('conflictfree_meetings')) || mockMeetings);

    for (const existing of activeMeetings) {
      if (existing.id === currentId || existing.status === 'cancelled') continue;

      const overlap = checkOverlap(startTime, endTime, existing.startTime, existing.endTime);
      if (overlap) {
        // Room conflict
        if (room && existing.room && existing.room.id === room.id) {
          conflicts.push({
            type: 'room',
            resource: room.name,
            reason: `Occupied by "${existing.title}"`,
            solution: 'Change room or reschedule'
          });
        }

        // Participant conflicts
        const conflictingParticipants = participants.filter(p =>
          existing.participants.some(ep => ep.id === p.id)
        );

        if (conflictingParticipants.length > 0) {
          conflicts.push({
            type: 'participant',
            resource: conflictingParticipants.map(p => p.name).join(', '),
            reason: `Required in "${existing.title}"`,
            solution: 'Reschedule meeting'
          });
        }
      }
    }

    return conflicts;
  },

  // Availability Heatmap Calculator
  // Returns busy density (0 = free, 1 = light, 2 = moderate, 3 = high) for hours 9 AM - 6 PM
  getAvailabilityHeatmap: (participants, date = new Date()) => {
    const meetings = JSON.parse(localStorage.getItem('conflictfree_meetings')) || mockMeetings;
    
    // 9 AM to 6 PM (9 hour blocks)
    const hours = Array.from({ length: 10 }, (_, i) => i + 9); // 9, 10, 11, 12, 13, 14, 15, 16, 17, 18
    
    return hours.map(hour => {
      const slotStart = new Date(date);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(date);
      slotEnd.setHours(hour + 1, 0, 0, 0);

      let busyCount = 0;

      // Scan meetings that overlap this hour block
      meetings.forEach(meeting => {
        if (meeting.status === 'cancelled') return;
        
        if (isSameDay(meeting.startTime, date)) {
          const overlap = checkOverlap(slotStart.toISOString(), slotEnd.toISOString(), meeting.startTime, meeting.endTime);
          if (overlap) {
            // Count how many of our selected participants are busy in this meeting
            const busyAttendees = participants.filter(p => 
              meeting.participants.some(ep => ep.id === p.id)
            );
            busyCount += busyAttendees.length;
          }
        }
      });

      // Map to visual density score (0 to 3)
      let density = 0;
      if (busyCount > 0) {
        if (busyCount === 1) density = 1;
        else if (busyCount <= 3) density = 2;
        else density = 3;
      }

      return {
        hour: `${hour}:00`,
        rawHour: hour,
        busyCount,
        density
      };
    });
  }
};
