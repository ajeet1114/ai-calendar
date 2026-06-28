// Mock Authentication Service

import { mockUsers } from '../utils/mockData';

const USER_KEY = 'conflictfree_user';
const PREFS_KEY = 'conflictfree_prefs';

const defaultPreferences = {
  theme: 'light',
  soundEnabled: true,
  emailNotifications: true,
  pushNotifications: true,
  defaultDuration: 30, // in minutes
  workingHoursStart: '09:00',
  workingHoursEnd: '18:00'
};

export const authService = {
  login: async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const matchedUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (matchedUser || (email && password)) {
          const user = matchedUser || {
            id: 'u_guest',
            name: email.split('@')[0].toUpperCase(),
            email: email,
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            role: 'Product Specialist'
          };
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 800); // Emulate network latency
    });
  },

  loginWithGoogle: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = mockUsers[0]; // Default to Alice for the demo
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        resolve(user);
      }, 1000);
    });
  },

  logout: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem(USER_KEY);
        resolve(true);
      }, 500);
    });
  },

  getCurrentUser: () => {
    const data = localStorage.getItem(USER_KEY);
    // If empty, pre-populate with Alice Chen so they are logged in by default for a smoother first impression
    if (!data) {
      const defaultUser = mockUsers[0];
      localStorage.setItem(USER_KEY, JSON.stringify(defaultUser));
      return defaultUser;
    }
    return JSON.parse(data);
  },

  getPreferences: () => {
    const data = localStorage.getItem(PREFS_KEY);
    if (!data) {
      localStorage.setItem(PREFS_KEY, JSON.stringify(defaultPreferences));
      return defaultPreferences;
    }
    return { ...defaultPreferences, ...JSON.parse(data) };
  },

  savePreferences: (prefs) => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    return prefs;
  }
};
