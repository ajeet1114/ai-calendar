// Global App State Context - ConflictFree Scheduling Engine

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { meetingService } from '../services/meetingService';
import { notificationService } from '../services/notificationService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Auth & Prefs State
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState({});
  const [theme, setTheme] = useState('light');

  // Meetings State
  const [meetings, setMeetings] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);

  // Calendar Context State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'day' | 'week' | 'month'

  // Notifications & Toast State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  // Load initial settings and check user session
  useEffect(() => {
    const activeUser = authService.getCurrentUser();
    setUser(activeUser);
    
    const prefs = authService.getPreferences();
    setPreferences(prefs);
    setTheme(prefs.theme || 'light');
  }, []);

  // Sync theme with DOM document element (for Tailwind dark mode)
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Load meetings and connect websocket notifications
  useEffect(() => {
    if (!user) return;

    // Fetch initial meetings
    const fetchMeetingsData = async () => {
      setLoadingMeetings(true);
      try {
        const list = await meetingService.getMeetings();
        setMeetings(list);
      } catch (err) {
        console.error('Failed to load meetings', err);
      } finally {
        setLoadingMeetings(false);
      }
    };
    
    // Fetch notifications
    const fetchNotificationsData = async () => {
      try {
        const list = await notificationService.getNotifications();
        setNotifications(list);
        setUnreadCount(list.filter(n => !n.read).length);
      } catch (err) {
        console.error('Failed to load notifications', err);
      }
    };

    fetchMeetingsData();
    fetchNotificationsData();

    // Connect WebSocket emulator
    notificationService.connect();

    // Listen to real-time events
    const handleNewNotification = (newNotif) => {
      // Add a toast visual alert
      addToast(newNotif.title, newNotif.message, newNotif.type);
    };

    const handleNotificationsUpdate = (updatedList) => {
      setNotifications(updatedList);
      setUnreadCount(updatedList.filter(n => !n.read).length);
      
      // Also refresh meetings because some notification changes are trigger-based (e.g. reschedule)
      meetingService.getMeetings().then(setMeetings);
    };

    notificationService.on('notification', handleNewNotification);
    notificationService.on('update', handleNotificationsUpdate);

    return () => {
      notificationService.disconnect();
      notificationService.off('notification', handleNewNotification);
      notificationService.off('update', handleNotificationsUpdate);
    };
  }, [user]);

  // Toast controls
  const addToast = (title, message, type = 'info') => {
    const id = 't_' + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter(t => t.id !== id));
  };

  // Auth Actions
  const login = async (email, password) => {
    const activeUser = await authService.login(email, password);
    setUser(activeUser);
    addToast('Welcome back!', `Logged in as ${activeUser.name}`, 'success');
    return activeUser;
  };

  const loginWithGoogle = async () => {
    const activeUser = await authService.loginWithGoogle();
    setUser(activeUser);
    addToast('Welcome back!', `Logged in via Google as ${activeUser.name}`, 'success');
    return activeUser;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    addToast('Signed Out', 'You have been signed out successfully.', 'info');
  };

  const updatePreferences = (newPrefs) => {
    const updated = authService.savePreferences({ ...preferences, ...newPrefs });
    setPreferences(updated);
    if (updated.theme) {
      setTheme(updated.theme);
    }
    addToast('Settings Saved', 'Your preference modifications are active.', 'success');
  };

  // Meeting Actions
  const fetchMeetings = async () => {
    const list = await meetingService.getMeetings();
    setMeetings(list);
  };

  const createMeeting = async (meetingData) => {
    const created = await meetingService.createMeeting(meetingData);
    await fetchMeetings();
    
    if (created.status === 'conflict') {
      addToast(
        'Conflict Detected!',
        `"${created.title}" overlaps with existing allocations. Review alternatives.`,
        'error'
      );
      
      // Fire socket warning
      notificationService.pushServerNotification({
        title: 'Meeting Conflict Detected',
        message: `"${created.title}" conflicts with other plans. Resolve via details.`,
        type: 'conflict',
        link: `/meetings/${created.id}`
      });
    } else {
      addToast('Success', `"${created.title}" scheduled successfully.`, 'success');
    }
    return created;
  };

  const updateMeeting = async (id, updatedData) => {
    const updated = await meetingService.updateMeeting(id, updatedData);
    await fetchMeetings();
    
    if (updated.status === 'conflict') {
      addToast('Updated with Conflicts', `"${updated.title}" contains scheduling conflicts.`, 'warning');
    } else {
      addToast('Meeting Updated', `"${updated.title}" details updated.`, 'success');
    }
    return updated;
  };

  const deleteMeeting = async (id) => {
    await meetingService.deleteMeeting(id);
    await fetchMeetings();
    addToast('Meeting Cancelled', 'The meeting was removed from your schedule.', 'info');
  };

  // Notification Actions
  const markAsRead = (id) => {
    notificationService.markAsRead(id);
  };

  const markAllAsRead = () => {
    notificationService.markAllAsRead();
    addToast('Notifications Cleared', 'All notices marked as read.', 'success');
  };

  const deleteNotification = (id) => {
    notificationService.deleteNotification(id);
  };

  return (
    <AppContext.Provider
      value={{
        // Auth
        user,
        preferences,
        theme,
        login,
        loginWithGoogle,
        logout,
        updatePreferences,
        
        // Meetings
        meetings,
        loadingMeetings,
        fetchMeetings,
        createMeeting,
        updateMeeting,
        deleteMeeting,

        // Calendar Date State
        currentDate,
        setCurrentDate,
        viewMode,
        setViewMode,

        // Notifications & Toasts
        notifications,
        unreadCount,
        toasts,
        addToast,
        removeToast,
        markAsRead,
        markAllAsRead,
        deleteNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
