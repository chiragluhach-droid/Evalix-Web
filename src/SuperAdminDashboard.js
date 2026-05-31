import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api.js';
import { useToast } from './ToastContext.js';
import { Sidebar, StatCard, Modal, EmptyState, Loading } from './components.js';

const NAV = [
  { key: 'overview', label: 'Overview', icon: '📊' },
  { key: 'colleges', label: 'Colleges', icon: '🏫' },
  { key: 'audit', label: 'Audit Logs', icon: '📜' }
];

export default function SuperAdminDashboard({ user, onLogout }) {
  const [view, setView] = useState('overview');
  const [activeCollege, setActiveCollege] = useState(null);

  const select = (key) => { setActiveCollege(null); setView(key); };

  return (
    <div className="app-shell">
      <Sidebar brand="Evalix" role="Super Admin" items={NAV} active={view} onSelect={select} user={user} onLogout={onLogout} />
      <main className="main-content">
        {view === 'overview' && <Overview />}
        {view === 'colleges' && !activeCollege && <Colleges onOpen={setActiveCollege} />}
        {view === 'colleges' && activeCollege && <CollegeDetail college={activeCollege} onBack={() => setActiveCollege(null)} />}
        {view === 'audit' && <AuditLogs />}
      </main>
    </div>
  );
}

function Overview() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api('/api/admin/analytics').then(d => setStats(d.stats)).catch(() => {}); }, []);
  if (!stats) return <Loading />;
  return (
    <>
      <div className="page-header"><div><div className="page-title">Platform Overview</div><div className="page-subtitle">System-wide statistics across all colleges</div></div></div>
      <div className="stat-grid">
        <StatCard icon="🏫" label="Colleges" value={stats.colleges} />
        <StatCard icon="👨‍🏫" label="Teachers" value={stats.teachers} />
        <StatCard icon="🎓" label="Students" value={stats.students} />
        <StatCard icon="📝" label="Exams" value={stats.exams} />
        <StatCard icon="✅" label="Submissions" value={stats.responses} />
      </div>
    </>
  );
}

function Colleges({ onOpen }) {
  const { showToast, showConfirm } = useToast();
  const [colleges, setColleges] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', domain: '', address: '', phone: '' });

  const load = useCallback(() => { api('/api/admin/colleges').then(d => setColleges(d.colleges)).catch(() => setColleges([])); }, []);
  useEffect(load, [load]);

  const create = async () => {
    if (!form.name) return showToast('College name is required', 'error');
    try {
      await api('/api/admin/colleges', { method: 'POST', body: form });
      showToast('College created', 'success');
      setShowAdd(false); setForm({ name: '', domain: '', address: '', phone: '' }); load();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const remove = (c) => showConfirm(
    `Delete "${c.name}"? This permanently removes all its teachers, students, exams, and responses.`,
    async () => {
      try { await api(`/api/admin/colleges/${c._id}`, { method: 'DELETE' }); showToast('College deleted', 'success'); load(); }
      catch (e) { showToast(e.message, 'error'); }
    }, 'Delete College'
  );

  if (!colleges) return <Loading />;
  return (
    <>
      <div className="page-header">
        <div><div className="page-title">Colleges</div><div className="page-subtitle">Manage institutions on the platform</div></div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add College</button>
      </div>
      {colleges.length === 0 ? (
        <EmptyState icon="🏫" title="No colleges yet" message="Add your first college to get started." action={<button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add College</button>} />
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Domain</th><th>Status</th><th>Created</th><th></th></tr></thead>
            <tbody>
              {colleges.map(c => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>{c.domain || '—'}</td>
                  <td><span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{c.status}</span></td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => onOpen(c)}>Manage</button>{' '}
                    <button className="btn btn-danger btn-sm" onClick={() => remove(c)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showAdd && (
        <Modal title="Add College" onClose={() => setShowAdd(false)}>
          <div className="form-group"><label className="form-label">College Name *</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Email Domain</label><input className="form-input" placeholder="college.edu" value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={create}>Create</button>
          </div>
        </Modal>
      )}
    </>
  );
}

function CollegeDetail({ college, onBack }) {
  const [tab, setTab] = useState('admin');
  return (
    <>
      <div className="page-header">
        <div>
          <button className="btn btn-secondary btn-sm" onClick={onBack}>← Back</button>
          <div className="page-title" style={{ marginTop: 12 }}>{college.name}</div>
          <div className="page-subtitle">Manage admin, teachers and students</div>
        </div>
      </div>
      <div className="tab-bar">
        <button className={`tab ${tab === 'admin' ? 'active' : ''}`} onClick={() => setTab('admin')}>College Admin</button>
        <button className={`tab ${tab === 'teachers' ? 'active' : ''}`} onClick={() => setTab('teachers')}>Teachers</button>
        <button className={`tab ${tab === 'students' ? 'active' : ''}`} onClick={() => setTab('students')}>Students</button>
      </div>
      {tab === 'admin' && <AdminTab collegeId={college._id} />}
      {tab === 'teachers' && <UserTab collegeId={college._id} role="teacher" />}
      {tab === 'students' && <UserTab collegeId={college._id} role="student" />}
    </>
  );
}

function AdminTab({ collegeId }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const add = async () => {
    if (!form.name || !form.email || !form.password) return showToast('All fields required', 'error');
    try {
      await api(`/api/admin/colleges/${collegeId}/admin`, { method: 'POST', body: form });
      showToast('College admin created', 'success'); setForm({ name: '', email: '', password: '' });
    } catch (e) { showToast(e.message, 'error'); }
  };
  return (
    <div className="panel" style={{ maxWidth: 520 }}>
      <div className="panel-title">Assign College Admin</div>
      <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
      <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
      <div className="form-group"><label className="form-label">Temporary Password</label><input className="form-input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
      <button className="btn btn-primary" onClick={add}>Create Admin</button>
    </div>
  );
}

function UserTab({ collegeId, role }) {
  const { showToast, showConfirm } = useToast();
  const [users, setUsers] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', studentId: '' });
  const [csv, setCsv] = useState('');
  const plural = role === 'teacher' ? 'teachers' : 'students';

  const load = useCallback(() => { api(`/api/admin/colleges/${collegeId}/${plural}`).then(d => setUsers(d[plural])).catch(() => setUsers([])); }, [collegeId, plural]);
  useEffect(load, [load]);

  const add = async () => {
    if (!form.name || !form.email || !form.password) return showToast('Name, email, password required', 'error');
    try {
      await api(`/api/admin/colleges/${collegeId}/${plural}`, { method: 'POST', body: form });
      showToast(`${role} added`, 'success'); setShowAdd(false); setForm({ name: '', email: '', password: '', studentId: '' }); load();
    } catch (e) { showToast(e.message, 'error'); }
  };
  const bulk = async () => {
    try {
      const r = await api(`/api/admin/colleges/${collegeId}/${plural}/bulk`, { method: 'POST', body: { csv } });
      showToast(`Imported ${r.created}, skipped ${r.skipped}`, 'success'); setShowBulk(false); setCsv(''); load();
    } catch (e) { showToast(e.message, 'error'); }
  };
  const remove = (u) => showConfirm(`Remove ${u.name}?`, async () => {
    try { await api(`/api/admin/colleges/${collegeId}/${plural}/${u.id}`, { method: 'DELETE' }); showToast('Removed', 'success'); load(); }
    catch (e) { showToast(e.message, 'error'); }
  });

  if (!users) return <Loading />;
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 16 }}>
        <button className="btn btn-secondary" onClick={() => setShowBulk(true)}>⬆ Bulk Import</button>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add {role}</button>
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

function AuditLogs() {
  const [logs, setLogs] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  useEffect(() => { api(`/api/admin/audit-logs?page=${page}&limit=30`).then(d => { setLogs(d.logs); setPages(d.pages); }).catch(() => setLogs([])); }, [page]);
  if (!logs) return <Loading />;
  return (
    <>
      <div className="page-header"><div><div className="page-title">Audit Logs</div><div className="page-subtitle">Platform activity tracking</div></div></div>
      {logs.length === 0 ? <EmptyState icon="📜" title="No activity yet" message="Actions across the platform will appear here." /> : (
        <div className="panel" style={{ padding: 0 }}>
          <table className="data-table">
            <thead><tr><th>Action</th><th>Actor</th><th>Role</th><th>Time</th></tr></thead>
            <tbody>
              {logs.map(l => (
                <tr key={l._id}>
                  <td><span className="badge badge-info">{l.action}</span></td>
                  <td>{l.actorEmail}</td>
                  <td>{l.actorRole}</td>
                  <td>{new Date(l.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pages > 1 && (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
          <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</button>
          <span style={{ alignSelf: 'center', fontSize: 14, color: '#64748b' }}>Page {page} of {pages}</span>
          <button className="btn btn-secondary btn-sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next →</button>
        </div>
      )}
    </>
  );
}
