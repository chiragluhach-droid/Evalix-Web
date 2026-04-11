import React from 'react';
import { useToast } from './ToastContext.js';
import API_BASE_URL from './apiConfig.js';

// ========== ENHANCED STYLES ==========
const dashboardStyles = `
  :root {
    --primary: #6366f1;
    --primary-hover: #4f46e5;
    --success: #10b981;
    --success-hover: #059669;
    --danger: #ef4444;
    --danger-hover: #dc2626;
    --warning: #f59e0b;
    --purple: #8b5cf6;
    
    --bg-main: #f8fafc;
    --bg-surface: #ffffff;
    --text-dark: #0f172a;
    --text-medium: #334155;
    --text-muted: #64748b;
    --border-color: #e2e8f0;
    
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .dashboard-container {
    min-height: 100vh;
    background: var(--bg-main);
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
    color: var(--text-dark);
  }

  /* Fade In Animation */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Top Navigation - Glassmorphism */
  .dash-nav {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--border-color);
    padding: 0 32px;
    height: 72px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 24px;
    font-weight: 800;
    color: var(--text-dark);
    letter-spacing: -0.5px;
  }

  .nav-brand-icon {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, var(--primary), var(--purple));
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .nav-user {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .user-profile {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    background: #e0e7ff;
    color: var(--primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 16px;
    border: 2px solid white;
    box-shadow: var(--shadow-sm);
  }

  .user-details h4 {
    color: var(--text-dark);
    font-size: 14px;
    font-weight: 600;
  }

  .user-details p {
    color: var(--text-muted);
    font-size: 12px;
  }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: var(--bg-surface);
    color: var(--text-medium);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .logout-btn:hover {
    border-color: var(--danger);
    color: var(--danger);
    background: #fef2f2;
    transform: translateY(-1px);
  }

  /* Main Content Area */
  .dash-main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 48px 32px;
    animation: fadeIn 0.4s ease-out;
  }

  /* Welcome & Stats Section */
  .welcome-section { margin-bottom: 48px; }

  .welcome-section h1 {
    font-size: 32px;
    color: var(--text-dark);
    margin-bottom: 8px;
    font-weight: 800;
    letter-spacing: -0.5px;
  }

  .welcome-section p {
    color: var(--text-muted);
    font-size: 16px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 24px;
    margin-top: 24px;
  }

  .stat-card {
    background: var(--bg-surface);
    padding: 24px;
    border-radius: 16px;
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-sm);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .stat-title {
    color: var(--text-muted);
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .stat-value {
    font-size: 36px;
    font-weight: 800;
    color: var(--text-dark);
    line-height: 1;
  }

  /* Section Headers */
  .exams-section { margin-bottom: 48px; }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .section-header h2 {
    font-size: 20px;
    color: var(--text-dark);
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .create-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--primary);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
  }

  .create-btn:hover {
    background: var(--primary-hover);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
  }

  /* Exams Grid */
  .exams-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 24px;
  }

  .exam-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 24px;
    box-shadow: var(--shadow-sm);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
  }

  .exam-card:hover {
    border-color: var(--primary);
    box-shadow: var(--shadow-lg);
    transform: translateY(-4px);
  }

  .exam-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }

  .exam-card-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-dark);
    line-height: 1.3;
  }

  /* Status Pills */
  .exam-status {
    padding: 4px 12px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 600;
    text-transform: capitalize;
    letter-spacing: 0.3px;
  }
  .status-draft { background: #f1f5f9; color: #475569; }
  .status-published { background: #dcfce7; color: #15803d; }
  .status-finished { background: #f3e8ff; color: #6d28d9; }

  /* Info Block (for codes) */
  .exam-code-block {
    margin-bottom: 20px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px dashed var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* Exam Stats Row */
  .exam-stats {
    display: flex;
    gap: 24px;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-color);
  }

  .exam-stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .exam-stat-label {
    color: var(--text-muted);
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
  }

  .exam-stat-value {
    color: var(--text-dark);
    font-size: 16px;
    font-weight: 700;
  }

  .exam-meta {
    font-size: 13px;
    color: var(--text-muted);
    margin-bottom: 20px;
    flex-grow: 1;
  }

  /* Action Buttons */
  .exam-actions {
    display: flex;
    gap: 12px;
    margin-top: auto;
  }

  .exam-action-btn {
    flex: 1;
    padding: 10px;
    border-radius: 8px;
    border: none;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
  }

  .btn-secondary { background: #f1f5f9; color: var(--text-medium); }
  .btn-secondary:hover { background: #e2e8f0; color: var(--text-dark); }
  
  .btn-primary { background: var(--primary); color: white; }
  .btn-primary:hover { background: var(--primary-hover); }
  
  .btn-success { background: var(--success); color: white; }
  .btn-success:hover { background: var(--success-hover); }
  
  .btn-danger { background: #fef2f2; color: var(--danger); }
  .btn-danger:hover { background: #fee2e2; }

  /* Empty States */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    background: transparent;
    border: 2px dashed var(--border-color);
    border-radius: 16px;
    padding: 64px 20px;
    transition: border-color 0.3s;
  }

  .empty-state:hover { border-color: var(--text-muted); }

  .empty-icon {
    width: 64px;
    height: 64px;
    background: white;
    color: var(--text-muted);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    box-shadow: var(--shadow-sm);
  }

  .empty-state h3 { font-size: 18px; color: var(--text-dark); margin-bottom: 8px; font-weight: 600; }
  .empty-state p { color: var(--text-muted); font-size: 14px; max-width: 340px; line-height: 1.6; }

  /* Loading Spinner */
  .loader-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px;
    color: var(--text-muted);
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

  @media (max-width: 768px) {
    .dash-nav { padding: 0 20px; }
    .dash-main { padding: 32px 20px; }
    .user-details { display: none; }
    .section-header { flex-direction: column; align-items: flex-start; gap: 16px; }
    .create-btn { width: 100%; justify-content: center; }
    .exams-grid { grid-template-columns: 1fr; }
    .exam-actions { flex-direction: column; }
  }
`;

// ========== COMPONENT ==========
function HostDashboard({ user, onLogout, onCreateExam, onEditExam, onViewResponses, onLiveTracking }) {
  const { showToast, showConfirm } = useToast();
  const [exams, setExams] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        showToast('Session expired. Please log in again.', 'error');
        onLogout();
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/exams`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showToast('Session expired. Please log in again.', 'error');
        onLogout();
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setExams(data.exams);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      showToast('Failed to load dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishExam = async (examId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/exams/${examId}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        showToast(`Exam published! Code: ${data.examCode}`, 'success');
        fetchExams();
      } else {
        showToast('Failed to publish exam', 'error');
      }
    } catch (error) {
      console.error('Error publishing exam:', error);
    }
  };

  const handleDeleteExam = (examId) => {
    showConfirm('Are you sure you want to finish this exam? Students will no longer be able to submit.', async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/exams/${examId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          await fetchExams();
          showToast('Exam finished successfully.', 'success');
        } else {
          showToast('Failed to finish exam', 'error');
        }
      } catch (error) {
        console.error('Error finishing exam:', error);
        showToast('Error: ' + error.message, 'error');
      }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
  };

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : 'U';
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <>
      <style>{dashboardStyles}</style>

      <div className="dashboard-container">
        {/* Top Navbar */}
        <nav className="dash-nav">
          <div className="nav-brand">
            <div className="nav-brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
            </div>
            Evalix
          </div>

          <div className="nav-user">
            <div className="user-profile">
              <div className="user-avatar">{getInitials(user?.name)}</div>
              <div className="user-details">
                <h4>{user?.name || 'Educator'}</h4>
                <p>{user?.email || 'Host Account'}</p>
              </div>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Logout
            </button>
          </div>
        </nav>

        {/* Main Workspace */}
        <main className="dash-main">
          {/* Welcome & Overview */}
          <div className="welcome-section">
            <h1>Welcome back, {user?.name ? user.name.split(' ')[0] : 'Professor'} 👋</h1>
            <p>Here is an overview of your secure assessments and active sessions.</p>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  Total Exams
                </div>
                <div className="stat-value">{exams.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  Drafts
                </div>
                <div className="stat-value">{exams.filter(e => e.status === 'draft').length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Active & Published
                </div>
                <div className="stat-value">{exams.filter(e => e.status === 'published').length}</div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loader-container">
              <div className="spinner"></div>
              <p>Syncing your workspace...</p>
            </div>
          ) : (
            <>
              {/* Draft Exams Section */}
              <div className="exams-section">
                <div className="section-header">
                  <h2>📝 Draft Exams</h2>
                  <button className="create-btn" onClick={onCreateExam}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Create New Exam
                  </button>
                </div>

                {exams.filter(e => e.status === 'draft').length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </div>
                    <h3>No draft exams</h3>
                    <p>Start building your first assessment. You can prepare questions and publish it later.</p>
                  </div>
                ) : (
                  <div className="exams-grid">
                    {exams.filter(e => e.status === 'draft').map(exam => (
                      <div key={exam.id} className="exam-card">
                        <div className="exam-card-header">
                          <h3 className="exam-card-title">{exam.title}</h3>
                          <span className="exam-status status-draft">Draft</span>
                        </div>

                        <div className="exam-stats">
                          <div className="exam-stat">
                            <span className="exam-stat-label">Questions</span>
                            <span className="exam-stat-value">{exam.totalQuestions}</span>
                          </div>
                          <div className="exam-stat">
                            <span className="exam-stat-label">Time</span>
                            <span className="exam-stat-value">{exam.duration}m</span>
                          </div>
                          <div className="exam-stat">
                            <span className="exam-stat-label">Pass</span>
                            <span className="exam-stat-value">{exam.passingScore}%</span>
                          </div>
                        </div>

                        <p className="exam-meta">Last updated: {formatDate(exam.updatedAt)}</p>

                        <div className="exam-actions">
                          <button className="exam-action-btn btn-secondary" onClick={() => onEditExam(exam.id)}>Edit</button>
                          <button className="exam-action-btn btn-success" onClick={() => handlePublishExam(exam.id)}>Publish</button>
                          <button className="exam-action-btn btn-danger" onClick={() => handleDeleteExam(exam.id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Published Exams Section */}
              <div className="exams-section">
                <div className="section-header">
                  <h2>🚀 Published Exams</h2>
                </div>

                {exams.filter(e => e.status === 'published').length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <h3>No active exams</h3>
                    <p>Publish a draft exam to make it live. Students will use the generated exam code to join.</p>
                  </div>
                ) : (
                  <div className="exams-grid">
                    {exams.filter(e => e.status === 'published').map(exam => (
                      <div key={exam.id} className="exam-card" style={{ borderTop: '4px solid var(--success)' }}>
                        <div className="exam-card-header">
                          <h3 className="exam-card-title">{exam.title}</h3>
                          <span className="exam-status status-published">Published</span>
                        </div>

                        <div className="exam-code-block">
                          <div>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>EXAM CODE</span>
                            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--success)', letterSpacing: '1px' }}>{exam.examCode}</span>
                          </div>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </div>

                        <div className="exam-stats">
                          <div className="exam-stat">
                            <span className="exam-stat-label">Questions</span>
                            <span className="exam-stat-value">{exam.totalQuestions}</span>
                          </div>
                          <div className="exam-stat">
                            <span className="exam-stat-label">Time</span>
                            <span className="exam-stat-value">{exam.duration}m</span>
                          </div>
                        </div>

                        <p className="exam-meta">Share the exam code above with your students to begin.</p>

                        <div className="exam-actions">
                          <button className="exam-action-btn btn-primary" onClick={() => onLiveTracking(exam)}>🔴 Track Live</button>
                          <button className="exam-action-btn btn-secondary" onClick={() => onViewResponses(exam)}>📊 Responses</button>
                          <button className="exam-action-btn btn-danger" onClick={() => handleDeleteExam(exam.id)}>Finish</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Finished Exams Section */}
              <div className="exams-section">
                <div className="section-header">
                  <h2>✓ Finished Exams</h2>
                </div>

                {exams.filter(e => e.status === 'finished').length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    <h3>No past exams</h3>
                    <p>Finished exams will appear here. You can review scores and student responses anytime.</p>
                  </div>
                ) : (
                  <div className="exams-grid">
                    {exams.filter(e => e.status === 'finished').map(exam => (
                      <div key={exam.id} className="exam-card" style={{ opacity: 0.9, background: '#fafafa' }}>
                        <div className="exam-card-header">
                          <h3 className="exam-card-title">{exam.title}</h3>
                          <span className="exam-status status-finished">Finished</span>
                        </div>

                        <div className="exam-stats">
                          <div className="exam-stat">
                            <span className="exam-stat-label">Questions</span>
                            <span className="exam-stat-value">{exam.totalQuestions}</span>
                          </div>
                          <div className="exam-stat">
                            <span className="exam-stat-label">Pass</span>
                            <span className="exam-stat-value">{exam.passingScore}%</span>
                          </div>
                        </div>

                        <p className="exam-meta">Completed on {formatDate(exam.updatedAt)}</p>

                        <div className="exam-actions">
                          <button className="exam-action-btn btn-secondary" onClick={() => onViewResponses(exam)}>📊 View Responses</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}

export default HostDashboard;