import React, { useState, useEffect } from "react";
import API_BASE_URL from "./apiConfig.js";

// --- SVG Icons to replace emojis and raw text ---
const Icons = {
  Back: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
  ),
  Chevron: ({ className }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  ),
  Shield: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  ),
  Camera: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
  ),
  Document: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
  ),
  User: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  )
};

const viewerStyles = `
  :root {
    --primary: #6366f1;
    --primary-hover: #4f46e5;
    --primary-light: #e0e7ff;
    --success: #10b981;
    --success-bg: #d1fae5;
    --danger: #ef4444;
    --danger-bg: #fee2e2;
    --warning: #f59e0b;
    --warning-bg: #fef3c7;
    --bg-main: #f8fafc;
    --bg-surface: #ffffff;
    --text-dark: #0f172a;
    --text-muted: #64748b;
    --border-color: #e2e8f0;
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --radius-lg: 12px;
    --radius-md: 8px;
  }

  * { box-sizing: border-box; }

  .responses-container {
    min-height: 100vh;
    background: var(--bg-main);
    padding: 48px 24px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }

  .responses-header {
    max-width: 1200px;
    margin: 0 auto 32px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .responses-header h1 {
    font-size: 32px;
    font-weight: 800;
    color: var(--text-dark);
    margin: 0 0 4px 0;
    letter-spacing: -0.025em;
  }

  .responses-header-subtitle {
    color: var(--text-muted);
    font-size: 15px;
    margin: 0;
  }

  .back-button {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-surface);
    color: var(--text-dark);
    border: 1px solid var(--border-color);
    padding: 8px 16px;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-weight: 500;
    font-size: 14px;
    transition: all 0.2s ease;
    box-shadow: var(--shadow-sm);
  }

  .back-button:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }

  .responses-content {
    max-width: 1200px;
    margin: 0 auto;
  }

  .responses-table {
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
  }

  .table-header {
    background: #f8fafc;
    display: grid;
    grid-template-columns: 1.5fr 1.5fr 0.8fr 0.8fr 1.2fr 0.4fr;
    gap: 20px;
    padding: 16px 24px;
    font-weight: 600;
    font-size: 12px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--border-color);
  }

  .table-row {
    display: grid;
    grid-template-columns: 1.5fr 1.5fr 0.8fr 0.8fr 1.2fr 0.4fr;
    gap: 20px;
    padding: 16px 24px;
    border-bottom: 1px solid var(--border-color);
    align-items: center;
    cursor: pointer;
    transition: background-color 0.15s ease;
  }

  .table-row:hover { background: #f8fafc; }
  .table-row:last-child { border-bottom: none; }

  .student-name-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .student-avatar {
    width: 32px;
    height: 32px;
    background: var(--primary-light);
    color: var(--primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .student-name {
    font-weight: 600;
    color: var(--text-dark);
    font-size: 14px;
  }

  .student-email { color: var(--text-muted); font-size: 14px; }
  
  .score-display {
    font-weight: 500;
    color: var(--text-dark);
    font-size: 14px;
  }

  .percent-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 9999px;
    font-weight: 600;
    font-size: 13px;
  }

  .percent-badge.pass { background: var(--success-bg); color: #047857; }
  .percent-badge.fail { background: var(--danger-bg); color: #b91c1c; }

  .submit-time { font-size: 13px; color: var(--text-muted); }

  .expand-icon {
    display: flex;
    justify-content: flex-end;
    color: var(--text-muted);
    transition: transform 0.3s ease;
  }

  .expand-icon.expanded {
    transform: rotate(180deg);
    color: var(--primary);
  }

  /* Expanded Detail Section */
  .detail-row {
    grid-column: 1 / -1;
    background: #f1f5f9; /* slightly darker to inset it */
    padding: 32px;
    border-top: 1px solid var(--border-color);
    border-bottom: 1px solid var(--border-color);
    animation: slideDown 0.3s ease-out;
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .detail-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .section-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: var(--shadow-sm);
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 16px;
    margin-bottom: 20px;
    font-size: 18px;
    font-weight: 700;
    color: var(--text-dark);
  }

  .section-icon { color: var(--primary); display: flex; }

  /* Security Stats */
  .security-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .stat-card {
    background: var(--bg-main);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 16px;
  }

  .stat-label {
    font-size: 12px;
    color: var(--text-muted);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
  }

  .stat-value {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .status-badge {
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
  }

  .status-badge.red { background: var(--danger-bg); color: #b91c1c; }
  .status-badge.green { background: var(--success-bg); color: #047857; }
  .status-badge.orange { background: var(--warning-bg); color: #b45309; }

  /* Device Timeline */
  .device-timeline-section {
    margin-top: 8px;
  }

  .device-timeline-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 16px;
  }

  .timeline-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .timeline-item {
    display: flex;
    align-items: flex-start;
    position: relative;
    padding-left: 28px;
    padding-bottom: 20px;
  }

  .timeline-item:last-child { padding-bottom: 0; }

  .timeline-item::before {
    content: '';
    position: absolute;
    left: 6px;
    top: 6px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--primary);
    border: 2px solid white;
    box-shadow: 0 0 0 1px var(--primary);
    z-index: 2;
  }

  .timeline-item::after {
    content: '';
    position: absolute;
    left: 10px;
    top: 16px;
    width: 2px;
    height: 100%;
    background: #e2e8f0;
    z-index: 1;
  }

  .timeline-item:last-child::after { display: none; }

  .timeline-content {
    background: var(--bg-main);
    border: 1px solid var(--border-color);
    padding: 12px 16px;
    border-radius: var(--radius-md);
    flex: 1;
  }

  .timeline-action { font-weight: 600; color: var(--text-dark); font-size: 14px; margin-bottom: 4px; }
  .timeline-device { font-size: 13px; color: var(--text-muted); font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
  .timeline-time { font-size: 12px; color: var(--text-muted); margin-top: 6px; display: block; }

  /* Snapshots */
  .snapshots-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
  }

  .snapshot-card {
    background: var(--bg-main);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    overflow: hidden;
    position: relative;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .snapshot-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .snapshot-image {
    width: 100%;
    height: 160px;
    object-fit: cover;
    display: block;
    background: #e2e8f0;
  }

  .delete-snapshot-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(239, 68, 68, 0.9);
    color: white;
    border: none;
    border-radius: 6px;
    width: 28px;
    height: 28px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: scale(0.9);
    transition: all 0.2s ease;
  }

  .snapshot-card:hover .delete-snapshot-btn {
    opacity: 1;
    transform: scale(1);
  }

  .delete-snapshot-btn:hover { background: rgb(220, 38, 38); }

  .snapshot-meta { padding: 12px 16px; border-top: 1px solid var(--border-color); }
  .snapshot-reason { font-size: 14px; font-weight: 600; color: var(--text-dark); margin-bottom: 4px; text-transform: capitalize; }
  .snapshot-time { font-size: 12px; color: var(--text-muted); }

  /* Q&A Section */
  .questions-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .detail-question {
    background: var(--bg-main);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 20px;
  }

  .q-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
  
  .question-number {
    font-size: 13px;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .q-type-badge {
    font-size: 11px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }
  
  .q-type-badge.mc { background: var(--primary-light); color: var(--primary-hover); }
  .q-type-badge.short { background: #e2e8f0; color: #475569; }

  .question-content { font-weight: 600; color: var(--text-dark); font-size: 16px; margin-bottom: 16px; line-height: 1.5; }

  .answer-grid {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 12px 16px;
    font-size: 14px;
    background: var(--bg-surface);
    padding: 16px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }

  .answer-label { font-weight: 600; color: var(--text-muted); }
  .answer-value { color: var(--text-dark); word-break: break-word; font-weight: 500; }
  .answer-correct { color: var(--success); font-weight: 600; display: flex; align-items: center; gap: 4px; }
  .answer-incorrect { color: var(--danger); font-weight: 600; display: flex; align-items: center; gap: 4px; }

  .no-responses {
    background: var(--bg-surface);
    border: 2px dashed var(--border-color);
    border-radius: var(--radius-lg);
    padding: 80px 20px;
    text-align: center;
    color: var(--text-muted);
  }

  .no-responses-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    background: #f1f5f9;
    border-radius: 50%;
    color: #94a3b8;
    margin-bottom: 16px;
  }

  @media (max-width: 1024px) {
    .table-header { display: none; }
    .table-row {
      grid-template-columns: 1fr;
      gap: 12px;
      padding: 20px;
      border: 1px solid var(--border-color);
      margin-bottom: 16px;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
    }
    .expand-icon { justify-content: flex-start; }
    .detail-row { padding: 20px 16px; }
    .answer-grid { grid-template-columns: 1fr; gap: 4px; padding-bottom: 12px; }
    .answer-label { margin-top: 8px; font-size: 12px; }
  }
`;

function StudentResponsesViewer({ exam, examId, onBack }) {
  const [responses, setResponses] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [responseDetails, setResponseDetails] = useState({});
  const [fullExam, setFullExam] = useState(exam);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const examResponse = await fetch(`${API_BASE_URL}/api/exams/${examId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const examData = await examResponse.json();

        if (!examResponse.ok) {
          setError(examData.error || "Failed to fetch exam");
          setLoading(false);
          return;
        }

        setFullExam(examData.exam);

        const responsesResponse = await fetch(`${API_BASE_URL}/api/exams/${examId}/responses`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const responsesData = await responsesResponse.json();

        if (!responsesResponse.ok) {
          setError(responsesData.error || "Failed to fetch responses");
          setLoading(false);
          return;
        }

        setResponses(responsesData.responses || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [examId]);

  const handleExpandRow = async (responseId) => {
    if (expandedId === responseId) {
      setExpandedId(null);
      return;
    }

    if (responseDetails[responseId]) {
      setExpandedId(responseId);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/exams/${examId}/responses/${responseId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to fetch response details");
        return;
      }

      setResponseDetails((prev) => ({
        ...prev,
        [responseId]: data.response,
      }));
      setExpandedId(responseId);
    } catch (err) {
      console.error("Error fetching response details:", err);
    }
  };

  const handleDeleteSnapshot = async (responseId, public_id) => {
    if (!window.confirm("Are you sure you want to delete this snapshot?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/exams/response/${responseId}/snapshot`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ public_id }),
      });

      if (!res.ok) {
        console.error("Failed to delete snapshot");
        return;
      }

      setResponseDetails((prev) => {
        const details = { ...prev };
        if (details[responseId] && details[responseId].snapshots) {
          details[responseId].snapshots = details[responseId].snapshots.filter(
            (s) => s.public_id !== public_id
          );
        }
        return details;
      });
    } catch (err) {
      console.error("Error deleting snapshot:", err);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="responses-container">
        <style>{viewerStyles}</style>
        <div className="responses-header">
          <h1>Loading responses...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="responses-container">
        <style>{viewerStyles}</style>
        <div className="responses-header">
          <h1>Error</h1>
          <button className="back-button" onClick={onBack}>
            <Icons.Back /> Back
          </button>
        </div>
        <div className="responses-content">
          <div className="no-responses" style={{ color: "var(--danger)", borderColor: "var(--danger-bg)" }}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="responses-container">
      <style>{viewerStyles}</style>
      <div className="responses-header">
        <div>
          <h1>Student Responses</h1>
          <p className="responses-header-subtitle">
            {fullExam?.title} • {responses.length} submission{responses.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="back-button" onClick={onBack}>
          <Icons.Back /> Back
        </button>
      </div>

      <div className="responses-content">
        {responses.length === 0 ? (
          <div className="no-responses">
            <div className="no-responses-icon"><Icons.Document /></div>
            <p style={{ fontWeight: 500, color: "var(--text-dark)", fontSize: "16px", margin: "0 0 8px 0" }}>No responses yet</p>
            <p style={{ margin: 0 }}>Students haven't submitted this exam yet.</p>
          </div>
        ) : (
          <div className="responses-table">
            <div className="table-header">
              <div>Student</div>
              <div>Email</div>
              <div>Score</div>
              <div>Grade</div>
              <div>Submitted At</div>
              <div></div>
            </div>

            {responses.map((resp) => (
              <React.Fragment key={resp.id}>
                <div className="table-row" onClick={() => handleExpandRow(resp.id)}>
                  <div className="student-name-wrapper">
                    <div className="student-avatar"><Icons.User /></div>
                    <span className="student-name">{resp.studentName}</span>
                  </div>
                  <div className="student-email">{resp.studentEmail}</div>
                  <div className="score-display">
                    {resp.totalScore} / {resp.totalPoints} pts
                  </div>
                  <div>
                    <span className={`percent-badge ${resp.percentScore >= 50 ? "pass" : "fail"}`}>
                      {resp.percentScore}%
                    </span>
                  </div>
                  <div className="submit-time">{formatDate(resp.submittedAt)}</div>
                  <div className={`expand-icon ${expandedId === resp.id ? "expanded" : ""}`}>
                    <Icons.Chevron />
                  </div>
                </div>

                {expandedId === resp.id && responseDetails[resp.id] && (
                  <div className="detail-row">
                    <div className="detail-content">
                      
                      {/* Security & Integrity Report */}
                      <div className="section-card">
                        <div className="section-header">
                          <span className="section-icon"><Icons.Shield /></span>
                          Security & Integrity Report
                        </div>

                        <div className="security-stats-grid">
                          <div className="stat-card">
                            <div className="stat-label">Device Changed</div>
                            <div className="stat-value">
                              {responseDetails[resp.id].flags?.includes("different_device") ? (
                                <span className="status-badge red">Yes</span>
                              ) : (
                                <span className="status-badge green">No</span>
                              )}
                            </div>
                          </div>

                          <div className="stat-card">
                            <div className="stat-label">Exit Count</div>
                            <div className="stat-value">
                              {responseDetails[resp.id].exitCount > 0 ? (
                                <span className="status-badge red">{responseDetails[resp.id].exitCount}</span>
                              ) : (
                                <span className="status-badge green">0</span>
                              )}
                            </div>
                          </div>

                          <div className="stat-card">
                            <div className="stat-label">Resume Count</div>
                            <div className="stat-value">
                              {responseDetails[resp.id].deviceHistory?.length > 1 ? (
                                <span className="status-badge orange">{responseDetails[resp.id].deviceHistory.length - 1}</span>
                              ) : (
                                <span className="status-badge green">0</span>
                              )}
                            </div>
                          </div>

                          {responseDetails[resp.id].flags?.length > 0 && (
                            <div className="stat-card">
                              <div className="stat-label">Triggered Flags</div>
                              <div className="stat-value">
                                {Object.entries(
                                  responseDetails[resp.id].flags.reduce((acc, curr) => {
                                    acc[curr] = (acc[curr] || 0) + 1;
                                    return acc;
                                  }, {})
                                ).map(([flag, count], idx) => (
                                  <span key={idx} className="status-badge red">
                                    {flag} ({count}x)
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {responseDetails[resp.id].deviceHistory?.length > 0 && (
                          <div className="device-timeline-section">
                            <div className="device-timeline-title">Device Timeline</div>
                            <div className="timeline-list">
                              {responseDetails[resp.id].deviceHistory.map((historyItem, idx) => {
                                const parser = (ua) => {
                                  if (!ua) return "Unknown Browser";
                                  if (ua.includes("Chrome") && !ua.includes("Edge")) return "Chrome";
                                  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
                                  if (ua.includes("Firefox")) return "Firefox";
                                  if (ua.includes("Edg")) return "Edge";
                                  return "Browser";
                                };
                                const browser = parser(historyItem.deviceInfo?.userAgent);
                                const platform = historyItem.deviceInfo?.platform || "Unknown OS";

                                return (
                                  <div key={idx} className="timeline-item">
                                    <div className="timeline-content">
                                      <div className="timeline-action">{historyItem.action}</div>
                                      <div className="timeline-device">{browser} on {platform}</div>
                                      <div className="timeline-time">{formatDate(historyItem.timestamp)}</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Proctoring Snapshots */}
                      {responseDetails[resp.id].snapshots?.length > 0 && (
                        <div className="section-card">
                          <div className="section-header">
                            <span className="section-icon"><Icons.Camera /></span>
                            Proctoring Snapshots
                          </div>
                          <div className="snapshots-grid">
                            {responseDetails[resp.id].snapshots.map((snapshot, idx) => (
                              <div key={idx} className="snapshot-card">
                                {snapshot.public_id && (
                                  <button
                                    onClick={() => handleDeleteSnapshot(resp.id, snapshot.public_id)}
                                    className="delete-snapshot-btn"
                                    title="Delete Snapshot"
                                  >
                                    <Icons.Trash />
                                  </button>
                                )}
                                <img
                                  src={snapshot.url}
                                  alt="Proctor Snapshot"
                                  className="snapshot-image"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    if (e.target.nextSibling) {
                                      e.target.nextSibling.style.display = "flex";
                                    }
                                  }}
                                />
                                <div style={{ display: "none", height: "160px", background: "#f8fafc", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "var(--text-muted)" }}>
                                  <Icons.Camera />
                                  <span style={{ fontSize: "12px", fontWeight: "500", marginTop: "8px" }}>Snapshot deleted</span>
                                </div>
                                <div className="snapshot-meta">
                                  <div className="snapshot-reason">{snapshot.reason.replace(/_/g, " ")}</div>
                                  <div className="snapshot-time">{formatDate(snapshot.timestamp)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Student Answers */}
                      <div className="section-card">
                        <div className="section-header">
                          <span className="section-icon"><Icons.Document /></span>
                          Student Answers
                        </div>
                        
                        <div className="questions-list">
                          {responseDetails[resp.id].responses.map((q, idx) => {
                            const examQuestion = fullExam?.questions?.[q.questionIndex];
                            return (
                              <div key={idx} className="detail-question">
                                <div className="q-header">
                                  <span className="question-number">Question {q.questionIndex + 1}</span>
                                  <span className={`q-type-badge ${q.questionType === 'multiple-choice' ? 'mc' : 'short'}`}>
                                    {q.questionType === "multiple-choice" ? "Multiple Choice" : "Short Answer"}
                                  </span>
                                </div>
                                
                                <div className="question-content">{q.questionText}</div>

                                <div className="answer-grid">
                                  {q.questionType === "multiple-choice" ? (
                                    <>
                                      <div className="answer-label">Student Answer</div>
                                      <div className="answer-value">
                                        {q.studentAnswer !== null && q.studentAnswer !== undefined && examQuestion?.options
                                          ? examQuestion.options[q.studentAnswer]
                                          : "Not answered"}
                                      </div>
                                      
                                      <div className="answer-label">Correct Answer</div>
                                      <div className="answer-value">
                                        {examQuestion?.options?.[q.correctAnswer] || "N/A"}
                                      </div>
                                      
                                      <div className="answer-label">Result</div>
                                      <div className={q.isCorrect ? "answer-correct" : "answer-incorrect"}>
                                        {q.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                                      </div>
                                      
                                      <div className="answer-label">Points</div>
                                      <div className="answer-value">{q.points} / {examQuestion?.points || 0}</div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="answer-label">Student Answer</div>
                                      <div className="answer-value">{q.studentAnswer || "Not answered"}</div>
                                      
                                      <div className="answer-label">Status</div>
                                      <div className="answer-value" style={{ color: "var(--warning)" }}>Requires manual grading</div>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentResponsesViewer;