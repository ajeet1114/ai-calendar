// Date helper utilities for Calendar and scheduling calculations

export const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
};

export const formatFullDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

export const isSameDay = (d1, d2) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const getDaysOfWeek = (currentDate = new Date()) => {
  const current = new Date(currentDate);
  const week = [];
  // Start on Sunday
  const distance = current.getDay();
  current.setDate(current.getDate() - distance);
  
  for (let i = 0; i < 7; i++) {
    week.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return week;
};

export const getDaysOfMonth = (currentDate = new Date()) => {
  const current = new Date(currentDate);
  const year = current.getFullYear();
  const month = current.getMonth();
  
  // First day of the month
  const firstDay = new Date(year, month, 1);
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);
  
  const days = [];
  
  // Pad the beginning with days of previous month
  const startPadding = firstDay.getDay(); // 0 is Sunday
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startPadding - 1; i >= 0; i--) {
    days.push(new Date(year, month - 1, prevMonthLastDay - i));
  }
  
  // Days of current month
  const totalDays = lastDay.getDate();
  for (let i = 1; i <= totalDays; i++) {
    days.push(new Date(year, month, i));
  }
  
  // Pad the end with days of next month to make complete weeks (multiples of 7)
  const remainingCells = 42 - days.length; // standard 6-row calendar
  for (let i = 1; i <= remainingCells; i++) {
    days.push(new Date(year, month + 1, i));
  }
  
  return days;
};

// Check if two time slots overlap
export const checkOverlap = (startA, endA, startB, endB) => {
  const sA = new Date(startA).getTime();
  const eA = new Date(endA).getTime();
  const sB = new Date(startB).getTime();
  const eB = new Date(endB).getTime();
  
  return sA < eB && sB < eA;
};

// Add minutes to an ISO string date
export const addMinutes = (isoString, minutes) => {
  const d = new Date(isoString);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
};
