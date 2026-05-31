import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api.js';
import { useToast } from './ToastContext.js';
import { Sidebar, EmptyState, Loading, StatusBadge } from './components.js';
import CreateExamScreen from './CreateExamScreen.js';
import QuestionBankManager from './QuestionBankManager.js';
import ResponsesViewer from './ResponsesViewer.js';
import LiveTracking from './LiveTracking.js';

const NAV = [
  { key: 'exams', label: 'My Exams', icon: '📝' },
  { key: 'banks', label: 'Question Banks', icon: '🗂️' }
];

export default function TeacherDashboard({ user, onLogout }) {
  const [view, setView] = useState('exams');
  const [screen, setScreen] = useState(null); // { type, examId?, exam? }

  if (screen?.type === 'create' || screen?.type === 'edit') {
    return <CreateExamScreen examId={screen.examId} user={user} onBack={() => setScreen(null)} />;
  }
  if (screen?.type === 'responses') {
    return <ResponsesViewer exam={screen.exam} onBack={() => setScreen(null)} />;
  }
  if (screen?.type === 'live') {
    return <LiveTracking exam={screen.exam} onBack={() => setScreen(null)} />;
  }

  return (
    <div className="app-shell">
      <Sidebar brand="Evalix" role="Teacher" items={NAV} active={view} onSelect={setView} user={user} onLogout={onLogout} />
      <main className="main-content">
        {view === 'exams' && (
          <ExamList
            onCreate={() => setScreen({ type: 'create' })}
            onEdit={id => setScreen({ type: 'edit', examId: id })}
            onResponses={exam => setScreen({ type: 'responses', exam })}
            onLiveTracking={exam => setScreen({ type: 'live', exam })}
          />
        )}
        {view === 'banks' && <QuestionBankManager />}
      </main>
    </div>
  );
}

function ExamList({ onCreate, onEdit, onResponses, onLiveTracking }) {
  const { showToast, showConfirm } = useToast();
  const [exams, setExams] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const load = useCallback(() => {
    api('/api/exams').then(d => setExams(d.exams)).catch(() => setExams([]));
  }, []);
  useEffect(load, [load]);

  const publish = async (e) => {
    try {
      const r = await api(`/api/exams/${e.id}/publish`, { method: 'POST' });
      showToast(`Published! Code: ${r.examCode}`, 'success'); load();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const del = (e) => showConfirm(`Delete "${e.title}"?`, async () => {
    try { await api(`/api/exams/${e.id}`, { method: 'DELETE' }); showToast('Deleted', 'success'); load(); }
    catch (err) { showToast(err.message, 'error'); }
  }, 'Delete Exam');

  const copyCode = (code) => { navigator.clipboard?.writeText(code); showToast('Code copied!', 'success'); };

  if (!exams) return <Loading />;

  const filtered = statusFilter === 'all' ? exams : exams.filter(e => e.status === statusFilter);

  const counts = { draft: exams.filter(e => e.status === 'draft').length, published: exams.filter(e => e.status === 'published').length, finished: exams.filter(e => e.status === 'finished').length };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">My Exams</div>
          <div className="page-subtitle">{exams.length} assessment{exams.length !== 1 ? 's' : ''} total</div>
        </div>
        <button className="btn btn-primary" onClick={onCreate}>+ Create Exam</button>
      </div>

      {/* Filter bar */}
      {exams.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {[['all', `All (${exams.length})`], ['draft', `Draft (${counts.draft})`], ['published', `Published (${counts.published})`], ['finished', `Finished (${counts.finished})`]].map(([k, l]) => (
            <button key={k} onClick={() => setStatusFilter(k)} style={{ padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, border: `1.5px solid ${statusFilter === k ? 'var(--primary)' : 'var(--border-color)'}`, background: statusFilter === k ? 'var(--primary)' : '#fff', color: statusFilter === k ? '#fff' : 'var(--text-muted)', cursor: 'pointer' }}>{l}</button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        exams.length === 0
          ? <EmptyState icon="📝" title="No exams yet" message="Build your first section-based assessment." action={<button className="btn btn-primary" onClick={onCreate}>+ Create Exam</button>} />
          : <EmptyState icon="🔍" title="No exams match filter" message="Try a different status filter." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(e => (
            <div key={e.id} className="panel" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 16, flex: 1, marginRight: 8 }}>{e.title}</div>
                <StatusBadge status={e.status} />
              </div>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12, minHeight: 18 }}>{e.description || 'No description'}</div>
              <div style={{ display: 'flex', gap: 14, fontSize: 13, color: '#64748b', marginBottom: 14, flexWrap: 'wrap' }}>
                <span>⏱ {e.duration}m</span><span>❓ {e.totalQuestions}Q</span><span>🎯 {e.passingScore}%</span>
                {e.resultsPublished && <span style={{ color: 'var(--green)', fontWeight: 600 }}>📢 Results Live</span>}
                {e.securityMode === 'seb' && <span style={{ background: '#4f46e5', color: '#fff', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>🔒 SEB</span>}
              </div>

              {e.examCode && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, padding: '8px 12px', background: 'var(--primary-light)', borderRadius: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700 }}>CODE</span>
                  <span style={{ fontWeight: 900, letterSpacing: 2, color: 'var(--primary)', fontSize: 16 }}>{e.examCode}</span>
                  <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto', padding: '4px 10px' }} onClick={() => copyCode(e.examCode)}>Copy</button>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {e.status === 'draft' && (
                  <><button className="btn btn-secondary btn-sm" onClick={() => onEdit(e.id)}>✏️ Edit</button>
                  <button className="btn btn-primary btn-sm" onClick={() => publish(e)}>🚀 Publish</button>
                  <button className="btn btn-danger btn-sm" onClick={() => del(e)}>Delete</button></>
                )}
                {e.status === 'published' && (
                  <><button className="btn btn-secondary btn-sm" onClick={() => onEdit(e.id)}>✏️ Edit</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => onLiveTracking(e)}>📡 Live</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => onResponses(e)}>📊 Results</button>
                  <button className="btn btn-danger btn-sm" onClick={() => del(e)}>Delete</button></>
                )}
                {e.status === 'finished' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => onResponses(e)}>📊 Results</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
