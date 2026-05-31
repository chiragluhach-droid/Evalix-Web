import React, { useState, useEffect } from 'react';
import theme from './theme.js';
import { getStoredUser, logout as doLogout, api } from './api.js';
import { Loading } from './components.js';
import LoginScreen from './LoginScreen.js';
import SuperAdminDashboard from './SuperAdminDashboard.js';
import CollegeAdminDashboard from './CollegeAdminDashboard.js';
import TeacherDashboard from './TeacherDashboard.js';
import StudentExamTaking from './StudentExamTaking.js';

export default function App() {
  const [user, setUser] = useState(null);           // admin / teacher session
  const [loading, setLoading] = useState(true);
  const [examState, setExamState] = useState(null); // { session, student } for student exam

  useEffect(() => {
    const token = localStorage.getItem('token');
    const stored = getStoredUser();
    if (token && stored && stored.role !== 'student') {
      setUser(stored);
      api('/api/auth/me')
        .then(d => { setUser(d.user); localStorage.setItem('user', JSON.stringify(d.user)); })
        .catch(() => handleLogout())
        .finally(() => setLoading(false));
    } else {
      // Clear any lingering student tokens
      if (stored?.role === 'student') { localStorage.removeItem('token'); localStorage.removeItem('user'); }
      setLoading(false);
    }
  }, []);

  const handleLogin = (u) => setUser(u);
  const handleLogout = () => { doLogout(); setUser(null); };

  // Student joins via exam code — store token temporarily in localStorage for API calls
  const handleExamStart = ({ token, session, student }) => {
    localStorage.setItem('token', token); // used by api.js for autosave/submit calls
    setExamState({ session, student });
  };

  const handleExamExit = () => {
    localStorage.removeItem('token');     // clear student session token
    setExamState(null);
  };

  // Student in exam
  if (examState) {
    return (
      <>
        <style>{theme}</style>
        <StudentExamTaking session={examState.session} onExit={handleExamExit} />
      </>
    );
  }

  if (loading) return <Loading />;

  let screen;
  if (!user) {
    screen = <LoginScreen onLogin={handleLogin} onExamStart={handleExamStart} />;
  } else if (user.role === 'superadmin') {
    screen = <SuperAdminDashboard user={user} onLogout={handleLogout} />;
  } else if (user.role === 'college_admin') {
    screen = <CollegeAdminDashboard user={user} onLogout={handleLogout} />;
  } else if (user.role === 'teacher') {
    screen = <TeacherDashboard user={user} onLogout={handleLogout} />;
  } else {
    // Unknown role (e.g. stale student token) — show login
    screen = <LoginScreen onLogin={handleLogin} onExamStart={handleExamStart} />;
  }

  return (
    <>
      <style>{theme}</style>
      {screen}
    </>
  );
}
