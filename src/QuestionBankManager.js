import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api.js';
import { useToast } from './ToastContext.js';
import { Modal, EmptyState, Loading } from './components.js';
import QuestionEditor from './QuestionEditor.js';

export default function QuestionBankManager() {
  const [activeBank, setActiveBank] = useState(null);
  if (activeBank) return <BankDetail bankId={activeBank} onBack={() => setActiveBank(null)} />;
  return <BankList onOpen={setActiveBank} />;
}

function BankList({ onOpen }) {
  const { showToast, showConfirm } = useToast();
  const [banks, setBanks] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', tags: '' });

  const load = useCallback(() => { api('/api/question-banks').then(d => setBanks(d.banks)).catch(() => setBanks([])); }, []);
  useEffect(load, [load]);

  const create = async () => {
    if (!form.name) return showToast('Name required', 'error');
    try {
      await api('/api/question-banks', { method: 'POST', body: { name: form.name, description: form.description, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) } });
      showToast('Bank created', 'success'); setShowAdd(false); setForm({ name: '', description: '', tags: '' }); load();
    } catch (e) { showToast(e.message, 'error'); }
  };
  const del = (b) => showConfirm(`Delete "${b.name}" and all its questions?`, async () => {
    try { await api(`/api/question-banks/${b.id}`, { method: 'DELETE' }); showToast('Deleted', 'success'); load(); }
    catch (e) { showToast(e.message, 'error'); }
  });

  if (!banks) return <Loading />;
  return (
    <>
      <div className="page-header">
        <div><div className="page-title">Question Banks</div><div className="page-subtitle">Reusable pools of questions for your exams</div></div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ New Bank</button>
      </div>
      {banks.length === 0 ? (
        <EmptyState icon="🗂️" title="No question banks yet" message="Create a bank to reuse questions across exams." action={<button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ New Bank</button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {banks.map(b => (
            <div key={b.id} className="panel" style={{ margin: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{b.name}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12, minHeight: 18 }}>{b.description || 'No description'}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {(b.tags || []).map(t => <span key={t} className="badge badge-info">{t}</span>)}
              </div>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>❓ {b.questionCount} questions</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => onOpen(b.id)}>Open</button>
                <button className="btn btn-danger btn-sm" onClick={() => del(b)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showAdd && (
        <Modal title="New Question Bank" onClose={() => setShowAdd(false)}>
          <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Description</label><input className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Tags (comma separated)</label><input className="form-input" placeholder="Unit 1, Algebra" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} /></div>
          <div className="modal-actions"><button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn btn-primary" onClick={create}>Create</button></div>
        </Modal>
      )}
    </>
  );
}

function BankDetail({ bankId, onBack }) {
  const { showToast, showConfirm } = useToast();
  const [bank, setBank] = useState(null);
  const [editing, setEditing] = useState(null); // question being edited, or {} for new

  const load = useCallback(() => { api(`/api/question-banks/${bankId}`).then(d => setBank(d.bank)).catch(() => {}); }, [bankId]);
  useEffect(load, [load]);

  const saveQuestion = async (q) => {
    try {
      if (q.id) await api(`/api/question-banks/${bankId}/questions/${q.id}`, { method: 'PUT', body: q });
      else await api(`/api/question-banks/${bankId}/questions`, { method: 'POST', body: q });
      showToast('Question saved', 'success'); setEditing(null); load();
    } catch (e) { showToast(e.message, 'error'); }
  };
  const delQuestion = (q) => showConfirm('Delete this question?', async () => {
    try { await api(`/api/question-banks/${bankId}/questions/${q.id}`, { method: 'DELETE' }); showToast('Deleted', 'success'); load(); }
    catch (e) { showToast(e.message, 'error'); }
  });

  if (!bank) return <Loading />;
  return (
    <>
      <div className="page-header">
        <div>
          <button className="btn btn-secondary btn-sm" onClick={onBack}>← Back to banks</button>
          <div className="page-title" style={{ marginTop: 12 }}>{bank.name}</div>
          <div className="page-subtitle">{bank.questions.length} questions</div>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({})}>+ Add Question</button>
      </div>
      {bank.questions.length === 0 ? (
        <EmptyState icon="❓" title="No questions yet" message="Add questions to build out this bank." action={<button className="btn btn-primary" onClick={() => setEditing({})}>+ Add Question</button>} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {bank.questions.map((q, i) => (
            <div key={q.id} className="panel" style={{ margin: 0, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                    <span className="badge badge-info">{q.type === 'multiple-choice' ? 'MCQ' : 'Short'}</span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{q.points} pt{q.points !== 1 ? 's' : ''}</span>
                    {(q.tags || []).map(t => <span key={t} className="badge badge-draft">{t}</span>)}
                  </div>
                  <div style={{ fontWeight: 600 }}>{i + 1}. {q.text}</div>
                  {q.type === 'multiple-choice' && (
                    <div style={{ marginTop: 8, fontSize: 13, color: '#64748b' }}>
                      {q.options.map((o, oi) => <div key={oi} style={{ color: oi === q.correctOption ? 'var(--green)' : undefined, fontWeight: oi === q.correctOption ? 600 : 400 }}>{oi === q.correctOption ? '✓ ' : '○ '}{o}</div>)}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditing(q)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => delQuestion(q)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing !== null && (
        <Modal title={editing.id ? 'Edit Question' : 'Add Question'} onClose={() => setEditing(null)} wide>
          <QuestionEditor initial={editing} onSave={saveQuestion} onCancel={() => setEditing(null)} />
        </Modal>
      )}
    </>
  );
}
