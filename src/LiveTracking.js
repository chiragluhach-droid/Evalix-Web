import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from './api.js';
import { Loading } from './components.js';

const ltStyles = `
  .lt-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
  .lt-filters { display: flex; gap: 8px; flex-wrap: wrap; }
  .lt-filter-btn { padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; border: 1.5px solid var(--border-color); background: #fff; color: var(--text-muted); cursor: pointer; }
  .lt-filter-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); }
  .lt-sort { display: flex; align-items: center; gap: 8px; font-size: 13px; }
  .lt-sort select { padding: 7px 12px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 13px; }
  .lt-pulse { width: 10px; height: 10px; border-radius: 50%; background: #10b981; display: inline-block; margin-right: 6px; animation: ltpulse 1.5s infinite; }
  @keyframes ltpulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
  .lt-table { width: 100%; border-collapse: collapse; }
  .lt-table th { text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.4px; color: var(--text-muted); padding: 10px 14px; border-bottom: 2px solid var(--border-color); font-weight: 600; white-space: nowrap; }
  .lt-table td { padding: 13px 14px; border-bottom: 1px solid var(--border-color); font-size: 14px; vertical-align: top; }
  .lt-table tr:last-child td { border-bottom: none; }
  .lt-row-clean td { }
  .lt-row-warn td { background: #fffbeb; }
  .lt-row-flag td { background: #fff1f2; }
  .lt-expand { cursor: pointer; }
  .lt-expand:hover td { background: #f8fafc; }
  .lt-violation-log { margin-top: 10px; font-size: 12px; border-top: 1px dashed #e2e8f0; padding-top: 10px; }
  .lt-vrow { display: flex; gap: 10px; align-items: flex-start; padding: 4px 0; }
  .lt-vrow .vtime { color: #94a3b8; width: 80px; flex-shrink: 0; font-family: monospace; }
  .lt-vbadge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; }
  .lt-vbadge.tab_switch { background: #fef3c7; color: #92400e; }
  .lt-vbadge.fullscreen_exit { background: #e0f2fe; color: #0369a1; }
  .lt-vbadge.concurrent_login { background: #ffe4e6; color: #9f1239; }
  .lt-vbadge.other { background: #f1f5f9; color: #475569; }
  .lt-empty { text-align: center; padding: 60px 20px; color: var(--text-muted); font-size: 15px; }
  .lt-counter { font-size: 13px; color: var(--text-muted); }
  .lt-refresh-btn { padding: 8px 14px; border-radius: 8px; border: 1px solid var(--border-color); background: #fff; font-size: 13px; cursor: pointer; }
  .lt-refresh-btn:hover { background: var(--bg-secondary); }
  .lt-timer { font-size: 12px; color: #94a3b8; }
  .tab-switch-pill { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; }
  .tab-switch-pill.clean { background: #ecfdf5; color: #065f46; }
  .tab-switch-pill.warn { background: #fef3c7; color: #92400e; }
  .tab-switch-pill.danger { background: #ffe4e6; color: #9f1239; }
`;

function relTime(d) {
  if (!d) return '—';
  const sec = Math.round((Date.now() - new Date(d).getTime()) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  return `${Math.floor(sec / 3600)}h ago`;
}

function fmt(s) {
  if (!s && s !== 0) return '—';
  s = Math.max(0, Math.floor(s));
  const m = Math.floor(s / 60), sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export default function LiveTracking({ exam, onBack }) {
  const [attempts, setAttempts] = useState(null);
  const [filter, setFilter] = useState('all'); // all | in_progress | submitted | flagged
  const [sort, setSort] = useState('name'); // name | switches | activity | status
  const [expanded, setExpanded] = useState(null); // attempt id
  const [lastRefresh, setLastRefresh] = useState(null);
  const intervalRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const d = await api(`/api/exams/${exam.id}/live`);
      setAttempts(d.attempts);
      setLastRefresh(new Date());
    } catch { /* silent */ }
  }, [exam.id]);

  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, 15000); // poll every 15s
    return () => clearInterval(intervalRef.current);
  }, [load]);

  if (!attempts) return <Loading />;

  const filtered = attempts.filter(a => {
    if (filter === 'in_progress') return a.status === 'in_progress';
    if (filter === 'submitted') return a.status === 'submitted';
    if (filter === 'flagged') return a.isFlagged;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'switches') return (b.tabSwitches || 0) - (a.tabSwitches || 0);
    if (sort === 'activity') return new Date(b.lastSavedAt || 0) - new Date(a.lastSavedAt || 0);
    if (sort === 'status') return a.status.localeCompare(b.status);
    return a.studentName.localeCompare(b.studentName);
  });

  const counts = {
    all: attempts.length,
    in_progress: attempts.filter(a => a.status === 'in_progress').length,
    submitted: attempts.filter(a => a.status === 'submitted').length,
    flagged: attempts.filter(a => a.isFlagged).length
  };

  const switchPillClass = (n) => n === 0 ? 'clean' : n < 3 ? 'warn' : 'danger';
  const rowClass = (a) => a.concurrentLoginAttempts > 0 ? 'lt-row-flag' : a.isFlagged ? 'lt-row-warn' : 'lt-row-clean';

  const vbadgeClass = (type) => {
    if (type === 'tab_switch') return 'tab_switch';
    if (type === 'fullscreen_exit') return 'fullscreen_exit';
    if (type === 'concurrent_login') return 'concurrent_login';
    return 'other';
  };

  return (
    <>
      <style>{ltStyles}</style>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 20 }}>
          <button className="btn btn-secondary btn-sm" onClick={onBack}>← Back</button>
          <div className="page-title" style={{ marginTop: 12 }}>
            <span className="lt-pulse" />Live Tracking — {exam.title}
          </div>
          <div className="page-subtitle">{exam.examCode} · Auto-refreshes every 15 seconds</div>
        </div>

        {/* Summary stats */}
        <div className="stat-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card"><div className="stat-label">Total Joined</div><div className="stat-value">{counts.all}</div></div>
          <div className="stat-card"><div className="stat-label">In Progress</div><div className="stat-value" style={{ color: 'var(--primary)' }}>{counts.in_progress}</div></div>
          <div className="stat-card"><div className="stat-label">Submitted</div><div className="stat-value" style={{ color: 'var(--green)' }}>{counts.submitted}</div></div>
          <div className="stat-card"><div className="stat-label">Flagged</div><div className="stat-value" style={{ color: 'var(--red)' }}>{counts.flagged}</div></div>
        </div>

        {/* Filters + sort */}
        <div className="lt-topbar">
          <div className="lt-filters">
            {[['all','All'], ['in_progress','In Progress'], ['submitted','Submitted'], ['flagged','⚠️ Flagged']].map(([k, l]) => (
              <button key={k} className={`lt-filter-btn ${filter === k ? 'active' : ''}`} onClick={() => setFilter(k)}>
                {l} {counts[k] > 0 && <span style={{ marginLeft: 4, opacity: 0.8 }}>({counts[k]})</span>}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="lt-sort">
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sort:</span>
              <select value={sort} onChange={e => setSort(e.target.value)}>
                <option value="name">Name</option>
                <option value="switches">Tab Switches</option>
                <option value="activity">Last Activity</option>
                <option value="status">Status</option>
              </select>
            </div>
            <button className="lt-refresh-btn" onClick={load}>↻ Refresh</button>
            {lastRefresh && <span className="lt-timer">Updated {relTime(lastRefresh)}</span>}
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="lt-empty">{attempts.length === 0 ? '⏳ No students have joined yet.' : 'No students match the current filter.'}</div>
        ) : (
          <div className="panel" style={{ padding: 0 }}>
            <table className="lt-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Status</th>
                  <th>Tab Switches</th>
                  <th>Violations</th>
                  <th>Concurrent Login</th>
                  <th>Remaining</th>
                  <th>Last Activity</th>
                  <th>Started</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(a => (
                  <React.Fragment key={a.id}>
                    <tr className={`lt-expand ${rowClass(a)}`} onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{a.studentName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.studentEmail}</div>
                      </td>
                      <td>
                        <span className={`badge ${a.status === 'in_progress' ? 'badge-info' : 'badge-success'}`}>
                          {a.status === 'in_progress' ? '● In Progress' : '✓ Submitted'}
                        </span>
                      </td>
                      <td>
                        <span className={`tab-switch-pill ${switchPillClass(a.tabSwitches)}`}>
                          {a.tabSwitches > 0 ? '⚠' : '✓'} {a.tabSwitches}
                        </span>
                      </td>
                      <td>
                        {a.violations.length === 0
                          ? <span style={{ color: 'var(--green)', fontWeight: 600 }}>✓ Clean</span>
                          : <span className="badge badge-danger">{a.violations.length} violation{a.violations.length !== 1 ? 's' : ''}</span>
                        }
                      </td>
                      <td>
                        {a.concurrentLoginAttempts > 0
                          ? <span className="badge badge-danger">🚨 {a.concurrentLoginAttempts} attempt{a.concurrentLoginAttempts !== 1 ? 's' : ''}</span>
                          : <span style={{ color: 'var(--green)', fontWeight: 600 }}>✓ None</span>
                        }
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{a.status === 'in_progress' ? fmt(a.remainingTime) : '—'}</td>
                      <td>{relTime(a.lastSavedAt)}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.startedAt ? new Date(a.startedAt).toLocaleTimeString() : '—'}</td>
                    </tr>
                    {/* Expanded violation log */}
                    {expanded === a.id && (
                      <tr className={rowClass(a)}>
                        <td colSpan={8}>
                          <div className="lt-violation-log">
                            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                              Violation Timeline for {a.studentName}
                              {a.submittedAt && <span style={{ marginLeft: 12, fontWeight: 400, color: 'var(--text-muted)' }}>Submitted: {new Date(a.submittedAt).toLocaleTimeString()}</span>}
                            </div>
                            {a.violations.length === 0 && a.concurrentLoginAttempts === 0 ? (
                              <div style={{ color: 'var(--green)', fontSize: 13 }}>✓ No violations recorded.</div>
                            ) : (
                              <>
                                {a.violations.map((v, i) => (
                                  <div key={i} className="lt-vrow">
                                    <span className="vtime">{v.timestamp ? new Date(v.timestamp).toLocaleTimeString() : '—'}</span>
                                    <span className={`lt-vbadge ${vbadgeClass(v.type)}`}>{v.type?.replace(/_/g, ' ')}</span>
                                    {v.details && <span style={{ color: 'var(--text-muted)' }}>{v.details}</span>}
                                  </div>
                                ))}
                                {a.concurrentLoginAttempts > 0 && (
                                  <div className="lt-vrow">
                                    <span className="vtime">—</span>
                                    <span className="lt-vbadge concurrent_login">concurrent login</span>
                                    <span style={{ color: 'var(--text-muted)' }}>{a.concurrentLoginAttempts} attempt(s) from another device</span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
