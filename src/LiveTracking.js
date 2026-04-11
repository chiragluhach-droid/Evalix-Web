import React, { useState, useEffect } from 'react';
import API_BASE_URL from './apiConfig.js';

// ========== PREMIUM STYLES ==========
const trackingStyles = `
  :root {
    --primary: #4f46e5;
    --primary-light: #e0e7ff;
    --success: #10b981;
    --success-light: #d1fae5;
    --warning: #f59e0b;
    --warning-light: #fef3c7;
    --danger: #ef4444;
    --danger-light: #fee2e2;
    --bg-main: #f8fafc;
    --bg-surface: #ffffff;
    --text-dark: #0f172a;
    --text-muted: #64748b;
    --border-color: #e2e8f0;
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
    --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes slideUpFade {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes radarPulse {
    0% { transform: scale(0.8); opacity: 1; }
    100% { transform: scale(2.5); opacity: 0; }
  }

  @keyframes spin { 100% { transform: rotate(360deg); } }

  .tracking-container {
    background: var(--bg-main);
    min-height: 100vh;
    padding: 40px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: var(--text-dark);
  }

  /* Header Section */
  .tracking-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 32px;
    animation: slideUpFade 0.4s ease-out forwards;
  }

  .header-left h1 {
    font-size: 26px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 12px;
    letter-spacing: -0.02em;
  }

  /* Enhanced Live Dot */
  .live-indicator {
    position: relative;
    width: 14px; height: 14px;
    display: flex; align-items: center; justify-content: center;
  }
  .live-dot {
    position: absolute;
    width: 10px; height: 10px;
    background-color: var(--danger);
    border-radius: 50%;
    z-index: 2;
  }
  .live-ring {
    position: absolute;
    width: 100%; height: 100%;
    background-color: var(--danger);
    border-radius: 50%;
    animation: radarPulse 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
    z-index: 1;
  }

  .exam-meta {
    display: flex; align-items: center; gap: 8px;
    color: var(--text-muted); font-size: 15px; margin-top: 8px;
  }
  .exam-code {
    background: #e2e8f0; padding: 4px 10px; border-radius: 6px;
    font-family: monospace; font-weight: 600; color: var(--text-dark);
  }

  /* Controls */
  .tracking-controls { display: flex; gap: 12px; }

  button { font-family: inherit; }
  
  .btn {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 18px; border-radius: var(--radius-sm);
    font-size: 14px; font-weight: 600; cursor: pointer;
    transition: var(--transition); border: 1px solid transparent;
  }
  
  .btn-secondary {
    background: var(--bg-surface); border-color: var(--border-color); color: var(--text-dark);
    box-shadow: var(--shadow-sm);
  }
  .btn-secondary:hover { background: #f1f5f9; border-color: #cbd5e1; }

  .refreshing svg { animation: spin 1s linear infinite; }

  /* KPI Summary Cards */
  .summary-cards {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;
    margin-bottom: 40px; animation: slideUpFade 0.5s ease-out forwards;
  }

  .kpi-card {
    background: var(--bg-surface); padding: 24px; border-radius: var(--radius-md);
    border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);
    display: flex; flex-direction: column; gap: 12px; position: relative; overflow: hidden;
  }
  
  .kpi-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
  }
  .kpi-total::before { background: var(--primary); }
  .kpi-active::before { background: var(--success); }
  .kpi-completed::before { background: var(--text-muted); }
  .kpi-suspicious::before { background: var(--danger); }

  .kpi-header { display: flex; justify-content: space-between; align-items: center; }
  .kpi-title { font-size: 13px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
  .kpi-icon { padding: 8px; border-radius: 8px; display: flex; }
  
  .kpi-total .kpi-icon { background: var(--primary-light); color: var(--primary); }
  .kpi-active .kpi-icon { background: var(--success-light); color: var(--success); }
  .kpi-completed .kpi-icon { background: #f1f5f9; color: var(--text-muted); }
  .kpi-suspicious .kpi-icon { background: var(--danger-light); color: var(--danger); }

  .kpi-value { font-size: 32px; font-weight: 800; color: var(--text-dark); line-height: 1; }

  /* Grid Layout */
  .students-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px;
    animation: slideUpFade 0.6s ease-out forwards;
  }

  /* Student Cards */
  .student-card {
    background: var(--bg-surface); border: 1px solid var(--border-color);
    border-radius: var(--radius-md); padding: 24px; box-shadow: var(--shadow-sm);
    transition: var(--transition); display: flex; flex-direction: column; gap: 20px;
  }

  .student-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); border-color: #cbd5e1; }

  /* Suspicious State Override */
  .student-card.status-suspicious {
    background: #fffcfc; border-color: #fca5a5;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.08);
  }

  /* Card Header & Avatar */
  .student-header { display: flex; justify-content: space-between; align-items: flex-start; }
  .student-profile { display: flex; gap: 12px; align-items: center; }
  
  .avatar {
    width: 40px; height: 40px; border-radius: 50%; background: var(--primary-light); color: var(--primary);
    display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; flex-shrink: 0;
  }
  
  .student-info h3 { font-size: 16px; color: var(--text-dark); margin-bottom: 2px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px; }
  .student-info p { font-size: 13px; color: var(--text-muted); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px; }

  /* Badges */
  .status-badge {
    font-size: 12px; font-weight: 600; padding: 6px 12px; border-radius: 20px;
    display: inline-flex; align-items: center; gap: 6px;
  }
  .badge-active { background: var(--success-light); color: #065f46; border: 1px solid #a7f3d0; }
  .badge-completed { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
  .badge-suspicious { background: var(--danger-light); color: #991b1b; border: 1px solid #fecaca; animation: blink 2s infinite; }

  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; } }

  /* Card Body (Times & Metrics) */
  .student-body { display: flex; flex-direction: column; gap: 16px; }

  .time-info { background: var(--bg-main); padding: 12px; border-radius: var(--radius-sm); display: flex; flex-direction: column; gap: 8px; }
  .time-row { display: flex; justify-content: space-between; font-size: 13px; }
  .time-label { color: var(--text-muted); font-weight: 500; }
  .time-val { color: var(--text-dark); font-weight: 600; font-variant-numeric: tabular-nums; }

  .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  
  .metric-box {
    border: 1px solid var(--border-color); padding: 12px; border-radius: var(--radius-sm);
    display: flex; flex-direction: column; gap: 4px;
  }
  .status-suspicious .metric-box { border-color: #fecaca; background: white; }

  .metric-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; }
  .metric-value { font-size: 18px; font-weight: 700; color: var(--text-dark); }
  .metric-danger { color: var(--danger); }

  /* Flag Chips */
  .flags-container { margin-top: 4px; display: flex; flex-wrap: wrap; gap: 6px; }
  .flag-chip {
    background: var(--danger-light); color: var(--danger); font-size: 11px; font-weight: 600;
    padding: 4px 8px; border-radius: 6px; display: inline-block; border: 1px solid #fecaca;
  }

  /* Empty State */
  .empty-state {
    text-align: center; padding: 80px 20px; background: var(--bg-surface);
    border: 2px dashed var(--border-color); border-radius: var(--radius-md);
  }
  .empty-state h3 { font-size: 18px; color: var(--text-dark); margin-bottom: 8px; }
  .empty-state p { color: var(--text-muted); font-size: 15px; }

  @media (max-width: 1024px) { .summary-cards { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 768px) {
    .tracking-container { padding: 20px; }
    .tracking-header { flex-direction: column; align-items: flex-start; gap: 20px; }
    .summary-cards { grid-template-columns: 1fr; }
  }
`;

function LiveTracking({ exam, examId, onBack }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLiveData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/exams/${examId}/live`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data.attempts || []);
      }
    } catch (error) {
      console.error('Error fetching live data:', error);
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setRefreshing(false), 600); // UI feel
    }
  };

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(() => fetchLiveData(false), 5000);
    return () => clearInterval(interval);
  }, [examId]);

  const activeCount = students.filter(s => s.status === 'in_progress' && !s.isSuspicious).length;
  const completedCount = students.filter(s => s.status === 'submitted').length;
  const suspiciousCount = students.filter(s => s.status === 'in_progress' && s.isSuspicious).length;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Helper to generate initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Helper to format flag strings neatly
  const formatFlagName = (flagStr) => {
    return flagStr.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getStatusDisplay = (student) => {
    if (student.status === 'submitted') return { text: 'Completed', class: 'completed', dot: '✓' };
    if (student.isSuspicious) return { text: 'Suspicious', class: 'suspicious', dot: '!' };
    return { text: 'Active', class: 'active', dot: '●' };
  };

  if (loading && students.length === 0) {
    return (
      <div className="tracking-container">
        <style>{trackingStyles}</style>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-muted)' }}>
          <svg className="refreshing" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
        </div>
      </div>
    );
  }

  return (
    <div className="tracking-container">
      <style>{trackingStyles}</style>
      
      <div className="tracking-header">
        <div className="header-left">
          <h1>
            <div className="live-indicator">
              <div className="live-ring"></div>
              <div className="live-dot"></div>
            </div>
            Live Tracking: {exam.title}
          </h1>
          <div className="exam-meta">
            Session Code: <span className="exam-code">{exam.examCode}</span>
          </div>
        </div>
        <div className="tracking-controls">
          <button className={`btn btn-secondary ${refreshing ? 'refreshing' : ''}`} onClick={() => fetchLiveData(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            Sync
          </button>
          <button className="btn btn-secondary" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Exit Dashboard
          </button>
        </div>
      </div>

      <div className="summary-cards">
        <div className="kpi-card kpi-total">
          <div className="kpi-header">
            <span className="kpi-title">Total Participants</span>
            <div className="kpi-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div>
          </div>
          <div className="kpi-value">{students.length}</div>
        </div>
        <div className="kpi-card kpi-active">
          <div className="kpi-header">
            <span className="kpi-title">Active Testing</span>
            <div className="kpi-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg></div>
          </div>
          <div className="kpi-value">{activeCount}</div>
        </div>
        <div className="kpi-card kpi-completed">
          <div className="kpi-header">
            <span className="kpi-title">Completed</span>
            <div className="kpi-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></div>
          </div>
          <div className="kpi-value">{completedCount}</div>
        </div>
        <div className="kpi-card kpi-suspicious">
          <div className="kpi-header">
            <span className="kpi-title">Suspicious Activity</span>
            <div className="kpi-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
          </div>
          <div className="kpi-value">{suspiciousCount}</div>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="empty-state">
          <svg style={{ color: '#cbd5e1', marginBottom: '16px' }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
          <h3>Awaiting Participants</h3>
          <p>No one has joined this exam session yet. Share the Exam Code above.</p>
        </div>
      ) : (
        <div className="students-grid">
          {students.map(student => {
            const statusInfo = getStatusDisplay(student);
            
            // Tally flags for clean display
            const flagCounts = student.flags.reduce((acc, curr) => {
              acc[curr] = (acc[curr] || 0) + 1;
              return acc;
            }, {});

            return (
              <div key={student.id} className={`student-card status-${statusInfo.class}`}>
                <div className="student-header">
                  <div className="student-profile">
                    <div className="avatar">{getInitials(student.studentName)}</div>
                    <div className="student-info" title={student.studentEmail}>
                      <h3>{student.studentName}</h3>
                      <p>{student.studentEmail}</p>
                    </div>
                  </div>
                  <div className={`status-badge badge-${statusInfo.class}`}>
                    {statusInfo.dot} {statusInfo.text}
                  </div>
                </div>

                <div className="student-body">
                  <div className="time-info">
                    <div className="time-row">
                      <span className="time-label">Started</span>
                      <span className="time-val">{formatDate(student.startedAt)}</span>
                    </div>
                    <div className="time-row">
                      <span className="time-label">Last Active</span>
                      <span className="time-val">{formatDate(student.lastSavedAt)}</span>
                    </div>
                  </div>

                  <div className="metrics-grid">
                    <div className="metric-box">
                      <span className="metric-label">Exits / Blurs</span>
                      <span className={`metric-value ${student.exitCount > 0 ? 'metric-danger' : ''}`}>
                        {student.exitCount}
                      </span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-label">Flags Captured</span>
                      <span className={`metric-value ${student.flags.length > 0 ? 'metric-danger' : ''}`}>
                        {student.flags.length}
                      </span>
                    </div>
                  </div>

                  {student.flags.length > 0 && (
                    <div className="flags-container">
                      {Object.entries(flagCounts).map(([flag, count], idx) => (
                        <div key={idx} className="flag-chip">
                          {formatFlagName(flag)} <span style={{opacity: 0.7}}>×{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LiveTracking;