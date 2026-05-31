import React, { useState, useEffect, useCallback } from 'react';
import { api, API_BASE_URL } from './api.js';
import { useToast } from './ToastContext.js';
import { Modal, EmptyState, Loading } from './components.js';

const rvStyles = `
  .rv-toolbar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 20px; }
  .rv-filter-btn { padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; border: 1.5px solid var(--border-color); background: #fff; color: var(--text-muted); cursor: pointer; }
  .rv-filter-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); }
  .rv-filter-btn.danger-active { background: var(--red); color: #fff; border-color: var(--red); }
  .rv-search { flex: 1; min-width: 180px; max-width: 280px; padding: 9px 14px; border: 1px solid var(--border-color); border-radius: 10px; font-size: 14px; }
  .rv-sort { display: flex; align-items: center; gap: 8px; font-size: 13px; }
  .rv-sort select { padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 13px; }
  .flag-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--red); margin-right: 6px; }
  .violation-chip { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 12px; font-size: 11px; font-weight: 700; background: #ffe4e6; color: #9f1239; margin-right: 4px; }
  .score-bar-wrap { width: 80px; height: 6px; background: #e2e8f0; border-radius: 3px; display: inline-block; vertical-align: middle; margin-left: 8px; }
  .score-bar-fill { height: 100%; border-radius: 3px; }
  .detail-section { margin-bottom: 18px; }
  .detail-q { padding: 12px; background: var(--bg-secondary); border-radius: 8px; margin-bottom: 8px; }
  .detail-q-text { font-weight: 600; font-size: 14px; margin-bottom: 6px; }
  .violation-timeline { border-top: 1px solid var(--border-color); padding-top: 14px; margin-top: 14px; }
  .vt-row { display: flex; gap: 10px; align-items: flex-start; padding: 5px 0; font-size: 12px; border-bottom: 1px dashed #e2e8f0; }
  .vt-row:last-child { border-bottom: none; }
  .vt-time { color: #94a3b8; width: 76px; flex-shrink: 0; font-family: monospace; }
  .vt-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; }
  .vt-badge.tab_switch { background: #fef3c7; color: #92400e; }
  .vt-badge.fullscreen_exit { background: #e0f2fe; color: #0369a1; }
  .vt-badge.concurrent_login { background: #ffe4e6; color: #9f1239; }
  .vt-badge.other { background: #f1f5f9; color: #475569; }
`;

export default function ResponsesViewer({ exam, onBack }) {
  const { showToast } = useToast();
  const [responses, setResponses] = useState(null);
  const [detail, setDetail] = useState(null);
  const [published, setPublished] = useState(exam.resultsPublished);
  const [filter, setFilter] = useState('all'); // all | passed | failed | flagged
  const [sort, setSort] = useState('score-desc'); // score-asc/desc | name | submitted | violations
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    api(`/api/exams/${exam.id}/responses`).then(d => setResponses(d.responses)).catch(() => setResponses([]));
  }, [exam.id]);
  useEffect(load, [load]);

  const openDetail = async (rid) => {
    try { const d = await api(`/api/exams/${exam.id}/responses/${rid}`); setDetail(d.response); }
    catch (e) { showToast(e.message, 'error'); }
  };

  const toggleResults = async () => {
    try {
      const r = await api(`/api/exams/${exam.id}/results/toggle`, { method: 'PUT', body: { published: !published } });
      setPublished(r.resultsPublished);
      showToast(r.resultsPublished ? '📢 Results published — students can now see scores' : '🙈 Results hidden from students', 'success');
    } catch (e) { showToast(e.message, 'error'); }
  };

  const exportResults = async (format) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/exams/${exam.id}/responses/export?format=${format}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `${exam.title}-results.${format === 'xlsx' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      showToast('Export downloaded', 'success');
    } catch (e) { showToast(e.message, 'error'); }
  };

  if (!responses) return <Loading />;

  // Apply filter + search + sort
  const visible = responses
    .filter(r => {
      if (filter === 'passed') return r.passed;
      if (filter === 'failed') return !r.passed;
      if (filter === 'flagged') return r.isFlagged;
      return true;
    })
    .filter(r => {
      if (!search) return true;
      const s = search.toLowerCase();
      return r.studentName.toLowerCase().includes(s) || r.studentEmail.toLowerCase().includes(s);
    })
    .sort((a, b) => {
      if (sort === 'score-desc') return b.percentScore - a.percentScore;
      if (sort === 'score-asc') return a.percentScore - b.percentScore;
      if (sort === 'name') return a.studentName.localeCompare(b.studentName);
      if (sort === 'violations') return (b.tabSwitches + b.violations.length) - (a.tabSwitches + a.violations.length);
      if (sort === 'submitted') return new Date(b.submittedAt) - new Date(a.submittedAt);
      return 0;
    });

  const counts = {
    all: responses.length,
    passed: responses.filter(r => r.passed).length,
    failed: responses.filter(r => !r.passed).length,
    flagged: responses.filter(r => r.isFlagged).length
  };
  const avg = responses.length ? Math.round(responses.reduce((s, r) => s + r.percentScore, 0) / responses.length) : 0;

  const scoreColor = (p) => p >= 75 ? 'var(--green)' : p >= 50 ? '#f59e0b' : 'var(--red)';

  return (
    <>
      <style>{rvStyles}</style>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div className="page-header">
          <div>
            <button className="btn btn-secondary btn-sm" onClick={onBack}>← Back</button>
            <div className="page-title" style={{ marginTop: 12 }}>{exam.title} — Results</div>
            <div className="page-subtitle">{responses.length} submission{responses.length !== 1 ? 's' : ''} · Exam code: {exam.examCode || '—'}</div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <button className={`btn ${published ? 'btn-secondary' : 'btn-primary'}`} onClick={toggleResults}>
              {published ? '🙈 Unpublish Results' : '📢 Publish Results'}
            </button>
            <button className="btn btn-secondary" onClick={() => exportResults('csv')}>⬇ CSV</button>
            <button className="btn btn-secondary" onClick={() => exportResults('xlsx')}>⬇ Excel</button>
          </div>
        </div>

        {/* Summary stats */}
        <div className="stat-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card"><div className="stat-label">Submissions</div><div className="stat-value">{responses.length}</div></div>
          <div className="stat-card"><div className="stat-label">Average Score</div><div className="stat-value">{avg}%</div></div>
          <div className="stat-card"><div className="stat-label">Passed / Failed</div><div className="stat-value">{counts.passed}<span style={{ fontSize: 18, color: 'var(--text-muted)' }}>/{counts.failed}</span></div></div>
          <div className="stat-card"><div className="stat-label">Flagged</div><div className="stat-value" style={{ color: counts.flagged > 0 ? 'var(--red)' : 'var(--green)' }}>{counts.flagged}</div></div>
          <div className="stat-card"><div className="stat-label">Results Visible</div><div style={{ marginTop: 8 }}><span className={`badge ${published ? 'badge-success' : 'badge-draft'}`}>{published ? 'Published' : 'Hidden'}</span></div></div>
        </div>

        {/* Filter + search + sort toolbar */}
        {responses.length > 0 && (
          <div className="rv-toolbar">
            {[['all', `All (${counts.all})`], ['passed', `✅ Passed (${counts.passed})`], ['failed', `❌ Failed (${counts.failed})`], ['flagged', `⚠️ Flagged (${counts.flagged})`]].map(([k, l]) => (
              <button key={k} className={`rv-filter-btn ${filter === k ? (k === 'flagged' ? 'danger-active' : 'active') : ''}`} onClick={() => setFilter(k)}>{l}</button>
            ))}
            <input className="rv-search" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
            <div className="rv-sort">
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sort:</span>
              <select value={sort} onChange={e => setSort(e.target.value)}>
                <option value="score-desc">Score (High → Low)</option>
                <option value="score-asc">Score (Low → High)</option>
                <option value="name">Name (A → Z)</option>
                <option value="submitted">Submitted (Latest)</option>
                <option value="violations">Most Violations</option>
              </select>
            </div>
          </div>
        )}

        {visible.length === 0 ? (
          responses.length === 0
            ? <EmptyState icon="📊" title="No submissions yet" message="Student responses will appear here after submission." />
            : <EmptyState icon="🔍" title="No results match" message="Try a different filter or clear the search." />
        ) : (
          <div className="panel" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Score</th>
                  <th>Result</th>
                  <th>Tab Switches</th>
                  <th>Violations</th>
                  <th>Time Taken</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visible.map(r => (
                  <tr key={r.id} style={{ background: r.isFlagged ? '#fff7f7' : undefined }}>
                    <td>
                      {r.isFlagged && <span className="flag-dot" title="Flagged — violations detected" />}
                      <div style={{ fontWeight: 700 }}>{r.studentName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.studentEmail}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: scoreColor(r.percentScore) }}>{r.percentScore}%</span>
                      <div className="score-bar-wrap">
                        <div className="score-bar-fill" style={{ width: `${r.percentScore}%`, background: scoreColor(r.percentScore) }} />
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.totalScore}/{r.totalPoints} pts</div>
                    </td>
                    <td>
                      <span className={`badge ${r.passed ? 'badge-success' : 'badge-danger'}`}>{r.passed ? 'Pass' : 'Fail'}</span>
                    </td>
                    <td>
                      {r.tabSwitches > 0
                        ? <span className={`badge ${r.tabSwitches >= 3 ? 'badge-danger' : 'badge-finished'}`}>⚠ {r.tabSwitches}</span>
                        : <span style={{ color: 'var(--green)', fontSize: 13 }}>✓ 0</span>
                      }
                    </td>
                    <td>
                      {r.violations.length === 0 && r.concurrentLoginAttempts === 0
                        ? <span style={{ color: 'var(--green)', fontSize: 13 }}>✓ Clean</span>
                        : <div>
                            {r.violations.length > 0 && <span className="violation-chip">⚠ {r.violations.length} violation{r.violations.length !== 1 ? 's' : ''}</span>}
                            {r.concurrentLoginAttempts > 0 && <span className="violation-chip" style={{ background: '#ffe4e6', color: '#9f1239' }}>🚨 Multi-device</span>}
                          </div>
                      }
                    </td>
                    <td style={{ fontSize: 13 }}>{r.timeTaken ? `${Math.floor(r.timeTaken / 60)}m ${r.timeTaken % 60}s` : '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openDetail(r.id)}>View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Detail modal */}
        {detail && (
          <Modal title="" onClose={() => setDetail(null)} wide>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{detail.studentName}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{detail.studentEmail}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: scoreColor(detail.percentScore), lineHeight: 1 }}>{detail.percentScore}%</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{detail.totalScore}/{detail.totalPoints} pts</div>
                <span className={`badge ${detail.passed ? 'badge-success' : 'badge-danger'}`} style={{ marginTop: 4 }}>{detail.passed ? 'Passed' : 'Failed'}</span>
              </div>
            </div>

            {/* Violation summary in detail */}
            {detail.isFlagged && (
              <div style={{ background: '#fff7f7', border: '1.5px solid #fecaca', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <div style={{ fontWeight: 700, color: 'var(--red)', marginBottom: 10 }}>⚠️ Integrity Flags</div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                  {detail.tabSwitches > 0 && <span className="violation-chip">Tab switches: {detail.tabSwitches}</span>}
                  {detail.concurrentLoginAttempts > 0 && <span className="violation-chip">Multi-device attempts: {detail.concurrentLoginAttempts}</span>}
                  {detail.violations?.length > 0 && <span className="violation-chip">Total violations: {detail.violations.length}</span>}
                </div>
                {detail.violations?.length > 0 && (
                  <div className="violation-timeline">
                    <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: 'var(--text-muted)' }}>VIOLATION TIMELINE</div>
                    {detail.violations.map((v, i) => (
                      <div key={i} className="vt-row">
                        <span className="vt-time">{v.timestamp ? new Date(v.timestamp).toLocaleTimeString() : '—'}</span>
                        <span className={`vt-badge ${v.type === 'tab_switch' ? 'tab_switch' : v.type === 'fullscreen_exit' ? 'fullscreen_exit' : v.type === 'concurrent_login' ? 'concurrent_login' : 'other'}`}>{v.type?.replace(/_/g, ' ')}</span>
                        {v.details && <span style={{ color: 'var(--text-muted)' }}>{v.details}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Answer breakdown */}
            {(detail.sections || []).map((sec, si) => (
              <div key={si} className="detail-section">
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10, paddingBottom: 6, borderBottom: '2px solid var(--border-color)' }}>{sec.sectionName}</div>
                {sec.questions.map((q, qi) => (
                  <div key={qi} className="detail-q">
                    <div className="detail-q-text">{qi + 1}. {q.questionText}</div>
                    <div style={{ fontSize: 13 }}>
                      {q.questionType === 'multiple-choice' ? (
                        <span>
                          Answer: <b>{q.studentAnswer === null || q.studentAnswer === undefined ? 'Not answered' : `Option ${q.studentAnswer + 1}`}</b>
                          {' '}
                          {q.isCorrect === true && <span className="badge badge-success">Correct</span>}
                          {q.isCorrect === false && <span className="badge badge-danger">Wrong {q.correctAnswer !== null ? `(correct: Opt ${q.correctAnswer + 1})` : ''}</span>}
                          {q.isCorrect === null && <span className="badge badge-draft">Not answered</span>}
                        </span>
                      ) : (
                        <span>Answer: <i style={{ color: 'var(--text-muted)' }}>{q.studentAnswer || '(blank)'}</i> <span className="badge badge-info">Manual grading</span></span>
                      )}
                      <span style={{ float: 'right', color: q.pointsEarned < 0 ? 'var(--red)' : 'var(--text-muted)', fontWeight: 600 }}>{q.pointsEarned > 0 ? '+' : ''}{q.pointsEarned} / {q.maxPoints} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </Modal>
        )}
      </div>
    </>
  );
}
