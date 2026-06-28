// Mock Data for ConflictFree Frontend

export const mockUsers = [
  { id: 'u1', name: 'Alice Chen', email: 'alice@conflictfree.ai', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', role: 'Product Lead' },
  { id: 'u2', name: 'Bob Smith', email: 'bob@conflictfree.ai', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', role: 'Tech Lead' },
  { id: 'u3', name: 'Charlie Davis', email: 'charlie@conflictfree.ai', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', role: 'UX Designer' },
  { id: 'u4', name: 'Diana Prince', email: 'diana@conflictfree.ai', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', role: 'Engineering Manager' },
  { id: 'u5', name: 'Ethan Hunt', email: 'ethan@conflictfree.ai', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', role: 'Security Engineer' },
  { id: 'u6', name: 'Fiona Gallagher', email: 'fiona@conflictfree.ai', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', role: 'Data Scientist' },
];

export const mockRooms = [
  { id: 'r1', name: 'Boardroom Alpha', capacity: 12, location: 'Building A, 4th Floor', features: ['TV Screen', 'Whiteboard', 'Video Conferencing'] },
  { id: 'r2', name: 'Huddle Room Beta', capacity: 4, location: 'Building A, 2nd Floor', features: ['Whiteboard'] },
  { id: 'r3', name: 'Glass Room Gamma', capacity: 6, location: 'Building B, 1st Floor', features: ['TV Screen', 'Video Conferencing'] },
  { id: 'r4', name: 'Innovation Hub', capacity: 20, location: 'Building C, Ground Floor', features: ['Projector', 'Whiteboard', 'Flexible Seating'] }
];

// Helper to generate dynamic dates relative to today
const getRelativeDate = (daysOffset, hour, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const mockMeetings = [
  {
    id: 'm1',
    title: 'Product Roadmap Alignment',
    description: 'Sync on the Q3 product deliverables and address any resource blockages.',
    startTime: getRelativeDate(0, 10), // Today at 10:00 AM
    endTime: getRelativeDate(0, 11),   // Today at 11:00 AM
    duration: 60,
    room: mockRooms[0],
    organizer: mockUsers[0],
    participants: [mockUsers[0], mockUsers[1], mockUsers[2]],
    color: '#6366f1', // Indigo
    status: 'scheduled',
    liveStatus: 'ended'
  },
  {
    id: 'm2',
    title: 'Daily Standup',
    description: 'Quick check-in on yesterday\'s accomplishments and blockers.',
    startTime: getRelativeDate(0, 9, 30), // Today at 9:30 AM
    endTime: getRelativeDate(0, 10),      // Today at 10:00 AM
    duration: 30,
    room: mockRooms[1],
    organizer: mockUsers[3],
    participants: [mockUsers[0], mockUsers[1], mockUsers[2], mockUsers[3], mockUsers[4]],
    color: '#10b981', // Emerald
    status: 'scheduled',
    liveStatus: 'ended'
  },
  {
    id: 'm3',
    title: 'UX Review & Design Crit',
    description: 'Detailed analysis of the new settings page layout and scheduling flows.',
    startTime: getRelativeDate(0, 14), // Today at 2:00 PM
    endTime: getRelativeDate(0, 15, 30), // Today at 3:30 PM
    duration: 90,
    room: mockRooms[2],
    organizer: mockUsers[2],
    participants: [mockUsers[0], mockUsers[2]],
    color: '#ec4899', // Pink
    status: 'scheduled',
    liveStatus: 'active'
  },
  {
    id: 'm4',
    title: 'Security Architecture Audit',
    description: 'Review system permissions, OAuth config, and local encryption storage.',
    startTime: getRelativeDate(1, 11), // Tomorrow at 11:00 AM
    endTime: getRelativeDate(1, 12, 30), // Tomorrow at 12:30 PM
    duration: 90,
    room: mockRooms[0],
    organizer: mockUsers[4],
    participants: [mockUsers[1], mockUsers[4], mockUsers[3]],
    color: '#f59e0b', // Amber
    status: 'scheduled',
    liveStatus: 'upcoming'
  },
  {
    id: 'm5',
    title: 'One-on-One: Diana & Bob',
    description: 'Monthly sync, career review, and feedback loop.',
    startTime: getRelativeDate(1, 14), // Tomorrow at 2:00 PM
    endTime: getRelativeDate(1, 14, 45), // Tomorrow at 2:45 PM
    duration: 45,
    room: mockRooms[1],
    organizer: mockUsers[3],
    participants: [mockUsers[3], mockUsers[1]],
    color: '#8b5cf6', // Violet
    status: 'scheduled',
    liveStatus: 'upcoming'
  },
  // Conflicting meeting (Double booked Room Alpha tomorrow at 11:30 AM)
  {
    id: 'm6',
    title: 'Emergency Bug Bash (Conflict)',
    description: 'Urgent meeting to investigate server errors. Note: Room and attendees overlap with the Security Audit!',
    startTime: getRelativeDate(1, 11, 30), // Tomorrow at 11:30 AM (Conflicts with m4!)
    endTime: getRelativeDate(1, 12, 30),   // Tomorrow at 12:30 PM
    duration: 60,
    room: mockRooms[0], // Conflicts!
    organizer: mockUsers[1],
    participants: [mockUsers[1], mockUsers[2]], // Bob is in m4 as well!
    color: '#ef4444', // Red
    status: 'conflict',
    liveStatus: 'upcoming'
  }
];

export const mockNotifications = [
  {
    id: 'n1',
    title: 'Meeting Conflict Detected',
    message: '"Emergency Bug Bash" conflicts with "Security Architecture Audit" on Room Boardroom Alpha tomorrow at 11:30 AM.',
    type: 'conflict',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(), // 5 mins ago
    read: false,
    link: '/meetings/m6'
  },
  {
    id: 'n2',
    title: 'Schedule Optimization Suggestion',
    message: 'ConflictFree has generated 3 alternative times to resolve the conflict for tomorrow morning.',
    type: 'suggestion',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    read: false,
    link: '/scheduling-result?mId=m6'
  },
  {
    id: 'n3',
    title: 'Meeting Accepted',
    message: 'Alice Chen accepted the invitation to "UX Review & Design Crit" today at 2:00 PM.',
    type: 'accepted',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    read: true,
    link: '/meetings/m3'
  }
];
