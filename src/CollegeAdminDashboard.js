import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api.js';
import { useToast } from './ToastContext.js';
import { Sidebar, StatCard, Modal, EmptyState, Loading, StatusBadge } from './components.js';
import CreateExamScreen from './CreateExamScreen.js';
import ResponsesViewer from './ResponsesViewer.js';
import LiveTracking from './LiveTracking.js';

const NAV = [
  { key: 'overview', label: 'Overview', icon: '📊' },
  { key: 'teachers', label: 'Teachers', icon: '👨‍🏫' },
  { key: 'students', label: 'Students', icon: '🎓' },
  { key: 'myexams', label: 'My Exams', icon: '📝' },
  { key: 'exams', label: 'Exam Oversight', icon: '🔍' }
];

export default function CollegeAdminDashboard({ user, onLogout }) {
  const [view, setView] = useState('overview');
  const [screen, setScreen] = useState(null);

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
      <Sidebar brand="Evalix" role="College Admin" items={NAV} active={view} onSelect={setView} user={user} onLogout={onLogout} />
      <main className="main-content">
        {view === 'overview' && <Overview />}
        {view === 'teachers' && <UserTab role="teacher" />}
        {view === 'students' && <UserTab role="student" />}
        {view === 'myexams' && (
          <AdminExamList
            onCreate={() => setScreen({ type: 'create' })}
            onEdit={id => setScreen({ type: 'edit', examId: id })}
            onResponses={exam => setScreen({ type: 'responses', exam })}
            onLiveTracking={exam => setScreen({ type: 'live', exam })}
          />
        )}
        {view === 'exams' && <ExamOversight />}
      </main>
    </div>
  );
}

function Overview() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api('/api/college/analytics').then(d => setStats(d.stats)).catch(() => {}); }, []);
  if (!stats) return <Loading />;
  return (
    <>
      <div className="page-header"><div><div className="page-title">College Overview</div><div className="page-subtitle">Your institution at a glance</div></div></div>
      <div className="stat-grid">
        <StatCard icon="👨‍🏫" label="Teachers" value={stats.teachers} />
        <StatCard icon="🎓" label="Students" value={stats.students} />
        <StatCard icon="📝" label="Exams" value={stats.exams} />
        <StatCard icon="✅" label="Submissions" value={stats.responses} />
      </div>
    </>
  );
}

function UserTab({ role }) {
  const { showToast, showConfirm } = useToast();
  const [users, setUsers] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', studentId: '' });
  const [csv, setCsv] = useState('');
  const plural = role === 'teacher' ? 'teachers' : 'students';

  const load = useCallback(() => { api(`/api/college/${plural}`).then(d => setUsers(d[plural])).catch(() => setUsers([])); }, [plural]);
  useEffect(load, [load]);

  const add = async () => {
    if (!form.name || !form.email || !form.password) return showToast('Name, email, password required', 'error');
    try {
      await api(`/api/college/${plural}`, { method: 'POST', body: form });
      showToast(`${role} added`, 'success'); setShowAdd(false); setForm({ name: '', email: '', password: '', studentId: '' }); load();
    } catch (e) { showToast(e.message, 'error'); }
  };
  const bulk = async () => {
    try {
      const r = await api(`/api/college/${plural}/bulk`, { method: 'POST', body: { csv } });
      showToast(`Imported ${r.created}, skipped ${r.skipped}`, 'success'); setShowBulk(false); setCsv(''); load();
    } catch (e) { showToast(e.message, 'error'); }
  };
  const remove = (u) => showConfirm(`Remove ${u.name}?`, async () => {
    try { await api(`/api/college/${plural}/${u.id}`, { method: 'DELETE' }); showToast('Removed', 'success'); load(); }
    catch (e) { showToast(e.message, 'error'); }
  });

  if (!users) return <Loading />;
  return (
    <>
      <div className="page-header">
        <div><div className="page-title" style={{ textTransform: 'capitalize' }}>{plural}</div><div className="page-subtitle">Manage your college's {plural}</div></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setShowBulk(true)}>⬆ Bulk Import</button>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add {role}</button>
        </div>
      </div>
      {users.length === 0 ? (
        <EmptyState icon={role === 'teacher' ? '👨‍🏫' : '🎓'} title={`No ${plural} yet`} message={`Add ${plural} individually or via bulk CSV import.`} />
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th>{role === 'student' && <th>Student ID</th>}<th>Status</th><th></th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.email}</td>
                  {role === 'student' && <td>{u.studentId || '—'}</td>}
                  <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'active' : 'inactive'}</span></td>
                  <td style={{ textAlign: 'right' }}><button className="btn btn-danger btn-sm" onClick={() => remove(u)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showAdd && (
        <Modal title={`Add ${role}`} onClose={() => setShowAdd(false)}>
          <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Temporary Password</label><input className="form-input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
          {role === 'student' && <div className="form-group"><label className="form-label">Student ID (optional)</label><input className="form-input" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} /></div>}
          <div className="modal-actions"><button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn btn-primary" onClick={add}>Add</button></div>
        </Modal>
      )}
      {showBulk && (
        <Modal title={`Bulk Import ${plural}`} onClose={() => setShowBulk(false)}>
          <p className="form-hint" style={{ marginBottom: 12 }}>One per line: <code>name,email,password{role === 'student' ? ',studentId' : ''}</code></p>
          <textarea className="form-textarea" style={{ minHeight: 180, fontFamily: 'monospace' }} value={csv} onChange={e => setCsv(e.target.value)} placeholder={`John Doe,john@x.edu,pass123${role === 'student' ? ',S101' : ''}`} />
          <div className="modal-actions"><button className="btn btn-secondary" onClick={() => setShowBulk(false)}>Cancel</button><button className="btn btn-primary" onClick={bulk}>Import</button></div>
        </Modal>
      )}
    </>
  );
}

function AdminExamList({ onCreate, onEdit, onResponses, onLiveTracking }) {
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

function ExamOversight() {
  const [exams, setExams] = useState(null);
  useEffect(() => { api('/api/college/exams').then(d => setExams(d.exams)).catch(() => setExams([])); }, []);

  const downloadSEBConfig = async (examId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${window.location.protocol}//${window.location.hostname}:5080/api/exams/${examId}/seb-config?frontendUrl=${encodeURIComponent(window.location.origin)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to download SEB config');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exam_SEB.seb';
      const disposition = res.headers.get('Content-Disposition');
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match) a.download = match[1];
      }
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('SEB download error:', e);
    }
  };

  if (!exams) return <Loading />;
  return (
    <>
      <div className="page-header"><div><div className="page-title">Exam Oversight</div><div className="page-subtitle">All exams created within your college</div></div></div>
      {exams.length === 0 ? <EmptyState icon="📝" title="No exams yet" message="Exams created by your teachers will appear here." /> : (
        <div className="panel" style={{ padding: 0 }}>
          <table className="data-table">
            <thead><tr><th>Title</th><th>Status</th><th>Security</th><th>Questions</th><th>Created</th><th></th></tr></thead>
            <tbody>
              {exams.map(e => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 600 }}>{e.title}</td>
                  <td><StatusBadge status={e.status} /></td>
                  <td>{e.securityMode === 'seb' ? <span className="badge badge-warning" style={{ fontSize: 11 }}>🔒 SEB</span> : <span style={{ color: '#94a3b8', fontSize: 12 }}>Standard</span>}</td>
                  <td>{e.totalQuestions}</td>
                  <td>{new Date(e.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    {e.securityMode === 'seb' && e.status === 'published' && (
                      <button className="btn btn-secondary btn-sm" onClick={() => downloadSEBConfig(e.id)} title="Download .seb config file">⬇ SEB Config</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
