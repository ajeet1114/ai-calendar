import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { MainLayout } from './components/MainLayout';
import { ToastNotifications } from './components/ToastNotifications';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CalendarView } from './pages/CalendarView';
import { CreateMeeting } from './pages/CreateMeeting';
import { SchedulingResult } from './pages/SchedulingResult';
import { MeetingDetail } from './pages/MeetingDetail';
import { Settings } from './pages/Settings';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Main Application Layout Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="calendar" element={<CalendarView />} />
            <Route path="create-meeting" element={<CreateMeeting />} />
            <Route path="scheduling-result" element={<SchedulingResult />} />
            <Route path="meetings/:id" element={<MeetingDetail />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Floating Global Micro-Alert Notification Stack */}
        <ToastNotifications />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
