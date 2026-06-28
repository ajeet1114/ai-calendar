// Mock Socket.io & Notification Service

import { mockNotifications, mockUsers } from '../utils/mockData';

const NOTIFS_KEY = 'conflictfree_notifications';

const getStoredNotifications = () => {
  const data = localStorage.getItem(NOTIFS_KEY);
  if (!data) {
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(mockNotifications));
    return mockNotifications;
  }
  return JSON.parse(data);
};

const listeners = {};

// Emulate socket connection state
let socketConnected = false;

export const notificationService = {
  // Socket.io emulation
  connect: (onConnect) => {
    socketConnected = true;
    console.log('🔌 ConflictFree WebSocket Connected.');
    if (onConnect) onConnect();
    
    // Simulate background activities every 45-60 seconds to fire mock socket messages
    const interval = setInterval(() => {
      if (!socketConnected) {
        clearInterval(interval);
        return;
      }
      
      const randomAlerts = [
        {
          title: 'Meeting Rescheduled',
          message: 'Bob Smith moved "Daily Standup" to 10:00 AM due to a double-booking overlap.',
          type: 'rescheduled',
          link: '/meetings/m2'
        },
        {
          title: 'Room Freed Up',
          message: 'Boardroom Alpha is now fully available tomorrow between 11:30 AM and 1:00 PM.',
          type: 'freed',
          link: '/calendar'
        },
        {
          title: 'New RSVP Received',
          message: 'Charlie Davis RSVP\'d "Accept" for "Security Architecture Audit" tomorrow.',
          type: 'rsvp',
          link: '/meetings/m4'
        }
      ];

      const alert = randomAlerts[Math.floor(Math.random() * randomAlerts.length)];
      notificationService.pushServerNotification(alert);
    }, 45000);
  },

  disconnect: () => {
    socketConnected = false;
    console.log('🔌 ConflictFree WebSocket Disconnected.');
  },

  on: (event, callback) => {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    listeners[event].push(callback);
  },

  off: (event, callback) => {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(cb => cb !== callback);
  },

  emit: (event, data) => {
    console.log(`Socket emitted: ${event}`, data);
  },

  // Notification CRUD
  getNotifications: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getStoredNotifications());
      }, 300);
    });
  },

  markAsRead: (id) => {
    const list = getStoredNotifications();
    const index = list.findIndex(n => n.id === id);
    if (index !== -1) {
      list[index].read = true;
      localStorage.setItem(NOTIFS_KEY, JSON.stringify(list));
      // Notify listeners
      if (listeners['update']) {
        listeners['update'].forEach(cb => cb(list));
      }
    }
    return list;
  },

  markAllAsRead: () => {
    const list = getStoredNotifications().map(n => ({ ...n, read: true }));
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(list));
    if (listeners['update']) {
      listeners['update'].forEach(cb => cb(list));
    }
    return list;
  },

  deleteNotification: (id) => {
    const list = getStoredNotifications().filter(n => n.id !== id);
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(list));
    if (listeners['update']) {
      listeners['update'].forEach(cb => cb(list));
    }
    return list;
  },

  // Simulating a real-time incoming notification from server
  pushServerNotification: (alertDetails) => {
    const list = getStoredNotifications();
    const newNotif = {
      id: 'n_' + Math.random().toString(36).substr(2, 9),
      title: alertDetails.title,
      message: alertDetails.message,
      type: alertDetails.type || 'info',
      timestamp: new Date().toISOString(),
      read: false,
      link: alertDetails.link || '/'
    };

    list.unshift(newNotif);
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(list));

    // Broadcast to UI Toast listeners and global context
    if (listeners['notification']) {
      listeners['notification'].forEach(cb => cb(newNotif));
    }
    if (listeners['update']) {
      listeners['update'].forEach(cb => cb(list));
    }
  }
};
